import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { output, saveCsv } from './browser-harness.mjs';

const files = (await readdir(output)).filter((file) => /^AUTO-.*\.json$/.test(file)).sort();
const outcomes = [];
for (const file of files) {
  const observation = JSON.parse(await readFile(resolve(output, file), 'utf8'));
  const { id, profile, variant, state, logs, draft, clicks, organization, email } = observation;
  const view = state.events[0];
  const base = view?.type === 'view' && view.variant === variant && view.visitorId === state.visitor &&
    logs.pageErrors.length === 0;
  const blocked = logs.console.some(({ text }) => text.includes('Navigation to external protocol blocked by sandbox'));
  const remained = new URL(state.url).pathname === '/experiment/ec10';
  const destination = 'mailto:contacto@arquitech.com';
  let contact;
  if (variant === 'A') {
    contact = clicks.some((click) => click.trusted && click.href === destination);
  } else {
    const url = draft && new URL(draft);
    const intent = state.events.filter(({ type }) => type === 'mailto_intent');
    const label = profile.segment === 'supervisor' ? 'Supervisor de obra' : 'Contratante';
    const body = url && (url.searchParams.get('body') ?? '').split('\n');
    contact = url && url.protocol + url.pathname === destination &&
      url.searchParams.get('subject') === 'Solicitud de demostración ArquiTech - ' + profile.segment &&
      body.includes('Segmento: ' + label) && body.includes('Organización: ' + organization) &&
      body.includes('Correo de contacto: ' + email) && intent.length === 1 &&
      intent[0].variant === variant && intent[0].segment === profile.segment &&
      intent[0].visitorId === state.visitor;
  }
  const filesPresent = await Promise.all([observation.trace, observation.screenshot, id + '.jsonl']
    .map((evidence) => stat(resolve(output, evidence)).then((info) => info.size > 0, () => false)));
  const failure = [
    !base && 'Vista/identidad incoherente o error de aplicación',
    !contact && 'Falta el resultado de contacto previsto',
    !blocked && 'Falta evidencia del bloqueo de protocolo externo',
    process.argv.includes('--require-continuity') && !remained && 'El recorrido salió de EC10',
    !filesPresent.every(Boolean) && 'Faltan archivos del recorrido',
  ].filter(Boolean).join(' | ');
  outcomes.push({
    experiment_id: 'EC10', profile_id: profile.id, role: profile.segment, condition: variant,
    task_id: 'contacto-local', started_at: observation.started_at, ended_at: observation.ended_at,
    duration_seconds: observation.duration_ms / 1000, outcome_correct: !failure,
    attempt_count: observation.attempts, help_requested: null, failure_reason: failure || null,
    remained_on_experiment: remained,
    evidence_path: file,
  });
}
await saveCsv('outcomes.csv', outcomes);
console.log(JSON.stringify(outcomes));
