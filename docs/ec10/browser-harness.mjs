import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
const env = globalThis.process?.env ?? {};

export const origin = 'http://127.0.0.1:4300';
export const output = resolve(env.EC10_OUTPUT || 'docs/ec10/evidence');
export const route = '/experiment/ec10';
export const keys = {
  visitor: 'arquitech-ec10-visitor-id',
  assignment: 'arquitech-ec10-assignment',
  events: 'arquitech-ec10-events',
};

export async function launch() {
  const require = createRequire(resolve(env.EC10_PLAYWRIGHT_PACKAGE || 'package.json'));
  const { chromium } = require('playwright');
  await mkdir(output, { recursive: true });
  return chromium.launch({ executablePath: env.CHROME_BIN, headless: true });
}

export async function saveJson(name, value) {
  await writeFile(resolve(output, name), JSON.stringify(value, null, 2) + '\n');
}

export async function saveCsv(name, records) {
  const cell = (value) => value == null ? '' : '"' + String(value).replaceAll('"', '""') + '"';
  const columns = Object.keys(records[0]);
  const rows = records.map((record) => columns.map((column) => cell(record[column])).join(','));
  await writeFile(resolve(output, name), [columns.join(','), ...rows, ''].join('\n'));
}

export async function openSession(browser, id, options = {}) {
  const mobile = options.device === 'mobile';
  const context = await browser.newContext({
    locale: 'es-PE', timezoneId: 'America/Lima', serviceWorkers: 'block',
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile, hasTouch: mobile,
  });
  const logs = { console: [], pageErrors: [], responses: [], blockedExternal: [], failedRequests: [] };
  const { wrapped, seed, lean, trace } = options;
  if (seed) {
    await context.addInitScript(({ key, seed }) => {
      if (location.pathname === '/experiment/ec10' && !localStorage.getItem(key)) {
        localStorage.setItem(key, seed);
      }
    }, { key: keys.visitor, seed });
  }
  await context.route('**/*', async (requestRoute) => {
    const request = requestRoute.request();
    const url = new URL(request.url());
    if (url.origin !== origin) {
      logs.blockedExternal.push({ url: url.href, method: request.method() });
      return requestRoute.abort('blockedbyclient');
    }
    if (url.pathname === '/__ec10_test_frame__') {
      const variant = url.searchParams.get('variant') === 'B' ? 'B' : 'A';
      return requestRoute.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">' +
          '<iframe title="EC10 local" sandbox="allow-scripts allow-same-origin allow-forms" ' +
          'style="position:fixed;inset:0;width:100%;height:100%;border:0" ' +
          'src="/experiment/ec10?testVariant=' + variant + '"></iframe>',
      });
    }
    if (lean && request.resourceType() === 'image') {
      return requestRoute.fulfill({ status: 204, body: '' });
    }
    return requestRoute.continue();
  });
  if (trace) await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on('console', (entry) => logs.console.push({ type: entry.type(), text: entry.text() }));
  page.on('pageerror', (error) => logs.pageErrors.push(String(error)));
  page.on('response', (response) => logs.responses.push({ url: response.url(), status: response.status() }));
  page.on('requestfailed', (request) => {
    logs.failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
  });
  const start = performance.now();
  const startedAt = new Date().toISOString();
  const target = wrapped ? page.frameLocator('iframe') : page;
  return {
    context, page, target, logs, startedAt, start,
    async navigate(variant) {
      const url = wrapped
        ? '/__ec10_test_frame__?variant=' + variant
        : route + (variant ? '?testVariant=' + variant : '');
      const response = await page.goto(origin + url, { waitUntil: 'domcontentloaded' });
      if (response?.status() !== 200) throw new Error('HTTP ' + response?.status());
      await target.locator('main h1').waitFor();
    },
    async state() {
      return target.locator('html').evaluate((_, keys) => ({
        url: location.href,
        visitor: localStorage.getItem(keys.visitor),
        assignment: localStorage.getItem(keys.assignment),
        events: JSON.parse(sessionStorage.getItem(keys.events) ?? '[]'),
      }), keys);
    },
    async close() {
      try {
        if (trace) await context.tracing.stop({ path: resolve(output, id + '.zip') });
      } finally {
        await context.close();
      }
    },
  };
}
