import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { openSession, output, saveJson } from './browser-harness.mjs';

export async function startTour(browser, { id, variant, profile, goal, organization, email }) {
  const session = await openSession(browser, id, { wrapped: true, trace: true, device: profile.device });
  const { page, target, context, logs, startedAt, start } = session;
  const steps = [];
  const clicks = [];
  await context.exposeBinding('ec10ObserveClick', ({ frame }, click) => {
    clicks.push({ ...click, frame_url: frame.url() });
  });
  await context.addInitScript(() => {
    document.addEventListener('click', (event) => {
      const element = event.target.closest?.('a,button');
      if (!element) return;
      void window.ec10ObserveClick({
        at: new Date().toISOString(), text: element.textContent.trim(), href: element.getAttribute('href'),
        trusted: event.isTrusted,
      });
    }, true);
  });
  await session.navigate(variant);
  let observation;
  return {
    async observe() {
      observation = await target.locator('body').ariaSnapshot();
      return {
        profile, goal, organization, email,
        accessible: observation.split('\n').filter((line) => !line.includes('paragraph')).join('\n'),
      };
    },
    async act(decision, action, name, value) {
      if (steps.length >= 10 || performance.now() - start > 480000) throw new Error('Tour limit reached');
      if (!observation) throw new Error('Observe before acting');
      const at = new Date().toISOString();
      const stepStart = performance.now();
      const row = { id, step: steps.length + 1, at, observation, decision, action, name, value };
      try {
        if (action === 'fill') await target.getByLabel(name, { exact: true }).fill(value);
        else await target.getByRole(action, { name, exact: true }).first().click();
        row.result = 'completed';
      } catch (caught) {
        row.result = 'error';
        row.error = String(caught);
      }
      row.duration_ms = Math.round(performance.now() - stepStart);
      steps.push(row);
      observation = undefined;
      return row.result;
    },
    async finish(decision) {
      try {
        const state = await session.state();
        const snapshot = await target.locator('body').ariaSnapshot();
        const link = target.locator('.ec10-mail-link');
        const draft = await link.count() ? await link.getAttribute('href') : null;
        await page.screenshot({ path: resolve(output, id + '.png') });
        await saveJson(id + '.json', {
          id, variant, profile, goal, organization, email, decision, browser: browser.version(),
          started_at: startedAt, ended_at: new Date().toISOString(),
          duration_ms: Math.round(performance.now() - start),
          state, draft, snapshot, clicks, logs, steps: steps.length,
          attempts: steps.filter(({ action, name }) => action === 'button' && /solicitud/i.test(name) ||
            action === 'link' && name.includes('@')).length,
          screenshot: id + '.png', trace: id + '.zip',
        });
        await writeFile(resolve(output, id + '.jsonl'), steps.map((step) => JSON.stringify(step)).join('\n') + '\n');
      } finally {
        await session.close();
      }
    },
  };
}
