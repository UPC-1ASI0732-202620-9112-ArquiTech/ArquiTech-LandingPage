import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { launch } from './browser-harness.mjs';
import { startTour } from './autonomous-session.mjs';

// Local transport only. The caller chooses each action after receiving the accessibility tree.
const folder = resolve(process.env.EC10_AGENT_QUEUE || '.angular/ec10-agent');
await mkdir(folder, { recursive: true });
const browser = await launch();
const tours = new Map();
try {
  for (let index = 1; index <= 20; index++) {
    let instructions;
    const deadline = Date.now() + 480000;
    while (!instructions && Date.now() < deadline) {
      try {
        instructions = JSON.parse(await readFile(resolve(folder, index + '.in.json'), 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await setTimeout(200);
      }
    }
    if (!instructions || instructions.stop) break;
    const results = await Promise.all(instructions.map(async (step) => {
      const { id } = step;
      try {
        if (step.profile) {
          tours.set(id, await startTour(browser, step));
          return { id, ...await tours.get(id).observe() };
        }
        const tour = tours.get(id);
        if (step.observe) return { id, ...await tour.observe() };
        if (step.finish) {
          await tour.finish(step.finish);
          tours.delete(id);
          return { id, finished: true };
        }
        const result = await tour.act(step.decision, step.action, step.name, step.value);
        return { id, result, ...await tour.observe() };
      } catch (error) {
        return { id, error: String(error) };
      }
    }));
    const temporary = resolve(folder, index + '.tmp');
    await writeFile(temporary, JSON.stringify(results));
    await rename(temporary, resolve(folder, index + '.out.json'));
  }
} finally {
  await browser.close();
}
