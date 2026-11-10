import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { launch, openSession, saveCsv, saveJson } from './browser-harness.mjs';

const browser = await launch();
const candidates = Array.from({ length: 400 }, (_, index) => {
  const variant = index % 2 ? 'B' : 'A';
  const id = 'ASSIGN-' + variant + '-' + String(1 + Math.floor(index / 2)).padStart(3, '0');
  const prefix = 'ec10-persist-' + id.toLowerCase();
  // The multiplier 31 is odd, so parity is the sum of character-code parities.
  const parity = [...prefix].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2;
  const seed = prefix + (parity === (variant === 'B' ? 1 : 0) ? '0' : '1');
  return { id, variant, seed };
});
const results = [];
let next = 0;

async function verify({ id, variant, seed }) {
  const session = await openSession(browser, id, { seed, lean: true });
  const { page, target, logs, startedAt, start } = session;
  let initial, reloaded, newTab, error;
  const marker = variant === 'A' ? 'at-landing #home h1' : '.ec10-form';
  const opposite = variant === 'A' ? '.ec10-form' : '.ec10-hero-short';
  const expectedView = (event) => {
    assert.equal(event.type, 'view');
    assert.equal(event.variant, variant);
    assert.equal(event.visitorId, seed);
    assert.equal(event.segment, variant === 'A' ? null : 'supervisor');
    assert.ok(Number.isFinite(Date.parse(event.at)));
  };
  const expectedState = (state, viewCount) => {
    assert.equal(state.assignment, variant);
    assert.equal(state.visitor, seed);
    assert.equal(new URL(state.url).search, '');
    assert.equal(state.events.length, viewCount);
    state.events.forEach(expectedView);
  };
  try {
    await session.navigate();
    initial = await session.state();
    expectedState(initial, 1);
    assert.ok(await target.locator(marker).isVisible());
    assert.equal(await target.locator(opposite).count(), 0);
    for (const section of ['#home', '#value', '#benefits', '#product', '#plans', '#team', '#trust', '#faq']) {
      assert.equal(await target.locator('at-landing ' + section).count(), 1, section);
    }
    assert.equal(await target.locator('.ec10-form').count(), variant === 'B' ? 1 : 0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator(marker).waitFor();
    reloaded = await session.state();
    expectedState(reloaded, 2);
    // Sample cross-tab localStorage persistence and sessionStorage separation.
    if (id.endsWith('-001')) {
      const tab = await session.context.newPage();
      await tab.goto(page.url(), { waitUntil: 'domcontentloaded' });
      await tab.locator(marker).waitFor();
      newTab = await tab.locator('html').evaluate(() => ({
        url: location.href,
        visitor: localStorage.getItem('arquitech-ec10-visitor-id'),
        assignment: localStorage.getItem('arquitech-ec10-assignment'),
        events: JSON.parse(sessionStorage.getItem('arquitech-ec10-events') ?? '[]'),
      }));
      expectedState(newTab, 1);
    }
    assert.deepEqual(logs.pageErrors, []);
  } catch (caught) {
    error = String(caught);
  } finally {
    results.push({
      id, variant, seed, correct: !error, started_at: startedAt, ended_at: new Date().toISOString(),
      duration_ms: Math.round(performance.now() - start), initial, reloaded, newTab, error,
      page_errors: logs.pageErrors,
    });
    await session.close();
  }
}

try {
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < candidates.length) await verify(candidates[next++]);
  }));
  results.sort((left, right) => left.id.localeCompare(right.id));
  await saveJson('assignment.json', { browser: browser.version(), records: results });
  await saveCsv('assignment.csv', results.map(({ initial, reloaded, newTab, page_errors, ...row }) => ({
    ...row, initial_assignment: initial?.assignment, reload_assignment: reloaded?.assignment,
    initial_views: initial?.events.length, reload_views: reloaded?.events.length,
    new_tab_views: newTab?.events.length, page_errors: page_errors.join(' | '),
  })));
  console.log(JSON.stringify(['A', 'B'].map((variant) => ({
    variant, total: results.filter((row) => row.variant === variant).length,
    correct: results.filter((row) => row.variant === variant && row.correct).length,
  }))));
} finally {
  await browser.close();
}
