import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { launch, openSession, origin, output, saveCsv, saveJson } from './browser-harness.mjs';

const browser = await launch();
const records = [];

async function run(id, variant, title, check, options = {}) {
  const session = await openSession(browser, id, { trace: true, ...options });
  const { page, target, logs, startedAt, start } = session;
  let error, state, details;
  try {
    if (variant === 'public') {
      await page.goto(origin);
      await target.locator('#home h1').waitFor();
    } else {
      await session.navigate(variant);
    }
    details = await check(session);
    assert.deepEqual(logs.pageErrors, []);
  } catch (caught) {
    error = String(caught);
  } finally {
    try {
      state = await session.state();
      await page.screenshot({ path: resolve(output, id + '.png'), timeout: 5000 });
    } catch (caught) {
      error ??= 'Evidence: ' + String(caught);
    }
    records.push({
      id, variant, title, correct: !error, started_at: startedAt, ended_at: new Date().toISOString(),
      duration_ms: Math.round(performance.now() - start), error, details, state, logs,
      screenshot: id + '.png', trace: id + '.zip',
    });
    await session.close();
  }
}

function assertView(state, variant, segment) {
  assert.ok(state.visitor);
  assert.deepEqual(
    state.events.map(({ type, variant, segment, visitorId }) => [type, variant, segment, visitorId]),
    [['view', variant, segment, state.visitor]],
  );
}

function assertEvents(state, variant, steps) {
  assert.deepEqual(state.events.map((event) => [event.type, event.segment]), steps);
  for (const event of state.events) {
    assert.equal(event.variant, variant);
    assert.equal(event.visitorId, state.visitor);
    assert.ok(Number.isFinite(Date.parse(event.at)));
  }
}

const submitName = 'Preparar solicitud de demostración';
const testEmail = 'ec10@example.invalid';
const organization = 'Obra EC10 & QA';

async function verifyAnchor(page, expectedPath, expectedQuery, fragment, destination) {
  await page.waitForURL((url) => url.hash === '#' + fragment);
  const url = new URL(page.url());
  assert.equal(url.pathname, expectedPath, url.href);
  assert.equal(url.search, expectedQuery, url.href);
  await page.waitForFunction((selector) => {
    const box = document.querySelector(selector)?.getBoundingClientRect();
    return box && box.bottom > 100 && box.top < innerHeight;
  }, destination);
}

try {
  await run('FUNC-A01', 'A', 'Portada general y evento de vista', async ({ target, state }) => {
    await target.locator('#home h1').waitFor();
    assert.equal(await target.locator('.ec10-form, .ec10-segments').count(), 0);
    assertView(await state(), 'A', null);
  });
  await run('FUNC-A02', 'A', 'Las CTA llevan al plan sin salir de EC10', async ({ target, page, state }) => {
    const before = await state();
    await target.locator('#home .actions a').click();
    await verifyAnchor(page, '/experiment/ec10', '?testVariant=A', 'plans', '#plans h2');
    assert.equal(await target.locator('at-landing a[href$="#plans"]').count(), 2);
    const after = await state();
    assert.deepEqual(after, { ...before, url: page.url() });
  });
  await run('FUNC-A03', 'A', 'La CTA de planes lleva a contacto y conserva la exposición', async ({ target, page, state }) => {
    const before = await state();
    await target.locator('#plans .mode-card .button').click();
    await verifyAnchor(page, '/experiment/ec10', '?testVariant=A', 'contact', '#contact a[href^="mailto:"]');
    assert.deepEqual(await state(), { ...before, url: page.url() });
  });
  await run('FUNC-A04', 'A', 'Enlace mailto del control y eventos locales', async ({ target, state }) => {
    const mail = target.locator('#contact a[href^="mailto:"]');
    assert.equal(await mail.getAttribute('href'), 'mailto:contacto@arquitech.com');
    await mail.click();
    assertView(await state(), 'A', null);
    return { mailto: await mail.getAttribute('href') };
  }, { wrapped: true, device: 'mobile' });
  await run('FUNC-B01', 'B', 'Segmentos, beneficios, aria-pressed y eventos', async ({ target, state }) => {
    const supervisor = target.getByRole('button', { name: 'Soy supervisor' });
    const contractor = target.getByRole('button', { name: 'Soy contratante' });
    assert.equal(await supervisor.getAttribute('aria-pressed'), 'true');
    assert.match(await target.locator('#home h1').innerText(), /Menos tiempo registrando/);
    assert.match(await target.locator('.ec10-benefit').innerText(), /Menos tiempo registrando/);
    await contractor.click();
    assert.equal(await contractor.getAttribute('aria-pressed'), 'true');
    assert.equal(await supervisor.getAttribute('aria-pressed'), 'false');
    assert.match(await target.locator('#home h1').innerText(), /Consulta el avance/);
    assert.match(await target.locator('.ec10-benefit').innerText(), /Consulta el avance/);
    await supervisor.click();
    assert.equal(await supervisor.getAttribute('aria-pressed'), 'true');
    assert.match(await target.locator('.ec10-benefit').innerText(), /Menos tiempo registrando/);
    assertEvents(await state(), 'B', [
      ['view', 'supervisor'], ['segment_selected', 'contractor'], ['segment_selected', 'supervisor'],
    ]);
  }, { device: 'mobile' });
  for (const [index, company, email] of [
    ['02', '', testEmail], ['03', organization, 'invalido'], ['04', '   ', testEmail],
  ]) {
    await run('FUNC-B' + index, 'B', 'Formulario inválido con rechazo y sin mailto', async ({ target, state }) => {
      await target.getByLabel('Organización').fill(company);
      await target.getByLabel('Correo de contacto').fill(email);
      await target.getByRole('button', { name: submitName }).click();
      await target.getByRole('alert').waitFor();
      assert.match(await target.getByRole('alert').innerText(), /correo electrónico válido/);
      assert.equal(await target.locator('.ec10-mail-link').count(), 0);
      assertView(await state(), 'B', 'supervisor');
      return { company, email };
    });
  }
  for (const [index, segment, label] of [
    ['05', 'supervisor', 'Supervisor de obra'], ['06', 'contractor', 'Contratante'],
  ]) {
    await run('FUNC-B' + index, 'B', 'Borrador mailto y reapertura para ' + label, async ({ target, state }) => {
      const steps = [['view', 'supervisor']];
      if (segment === 'contractor') {
        await target.getByRole('button', { name: 'Soy contratante' }).click();
        steps.push(['segment_selected', 'contractor']);
      }
      await target.getByLabel('Organización').fill(organization);
      await target.getByLabel('Correo de contacto').fill(testEmail);
      const submit = target.getByRole('button', { name: submitName });
      await submit.click();
      const mail = target.locator('.ec10-mail-link');
      await mail.waitFor();
      const draft = new URL(await mail.getAttribute('href'));
      assert.equal(draft.protocol, 'mailto:');
      assert.equal(draft.pathname, 'contacto@arquitech.com');
      assert.equal(draft.searchParams.get('subject'), 'Solicitud de demostración ArquiTech - ' + segment);
      const body = draft.searchParams.get('body').split('\n');
      assert.ok(body.includes('Segmento: ' + label));
      assert.ok(body.includes('Organización: ' + organization));
      assert.ok(body.includes('Correo de contacto: ' + testEmail));
      assert.match(await target.locator('.ec10-disclaimer').innerText(), /solo se enviará si confirmas/);
      assert.ok(await submit.isEnabled());
      steps.push(['mailto_intent', segment]);
      assertEvents(await state(), 'B', steps);
      await mail.click();
      assertEvents(await state(), 'B', steps);
      return { mailto: draft.href };
    }, { wrapped: true, device: segment === 'contractor' ? 'mobile' : 'desktop' });
  }
  await run('FUNC-B07', 'B', 'La navegación compartida conserva la exposición B', async ({ target, page, state }) => {
    await target.getByRole('button', { name: 'Soy contratante' }).click();
    await target.getByLabel('Organización').fill(organization);
    const before = await state();
    await target.locator('#main-navigation a[href$="#plans"]').click();
    await verifyAnchor(page, '/experiment/ec10', '?testVariant=B', 'plans', '#plans h2');
    assert.equal(await target.locator('at-landing').count(), 1);
    for (const section of ['#home', '#value', '#benefits', '#product', '#plans', '#team', '#trust', '#faq']) {
      assert.equal(await target.locator('at-landing ' + section).count(), 1, section);
    }
    assert.equal(await target.locator('#plans .mode-card li').count(), 3);
    await target.locator('#plans .mode-card .button').click();
    await verifyAnchor(page, '/experiment/ec10', '?testVariant=B', 'demo', '#demo h2');
    assert.equal(await target.getByRole('button', { name: 'Soy contratante' }).getAttribute('aria-pressed'), 'true');
    assert.equal(await target.getByLabel('Organización').inputValue(), organization);
    assert.deepEqual(await state(), { ...before, url: page.url() });
  });
  await run('FUNC-P01', 'public', 'Las CTA públicas conservan planes y contacto', async ({ target, page, state }) => {
    assert.equal(await target.locator('#home .actions a').getAttribute('href'), '#plans');
    assert.equal(await target.locator('#plans .mode-card .button').getAttribute('href'), '#contact');
    assert.equal(await target.locator('#main-navigation a[href$="#plans"]').getAttribute('href'), '/#plans');
    await target.locator('#home .actions a').click();
    await verifyAnchor(page, '/', '', 'plans', '#plans h2');
    await target.locator('#plans .mode-card .button').click();
    await verifyAnchor(page, '/', '', 'contact', '#contact a[href^="mailto:"]');
    assert.deepEqual(await state(), { url: page.url(), visitor: null, assignment: null, events: [] });
  });
  await saveJson('functional.json', { browser: browser.version(), records });
  await saveCsv('functional.csv', records.map(({ state, logs, details, ...row }) => ({
    ...row, url: state?.url, events: state?.events.map((event) => event.type).join('|'),
    page_errors: logs.pageErrors.join(' | '),
  })));
  console.log(JSON.stringify(records.map(({ id, correct, error }) => ({ id, correct, error }))));
} finally {
  await browser.close();
}
