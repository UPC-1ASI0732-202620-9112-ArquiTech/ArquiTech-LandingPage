import { test, expect, type Page } from '@playwright/test';

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

test.describe('Spanish browser (es-PE)', () => {
  test.use({ locale: 'es-PE' });

  test('#14 opens in Spanish and #15 offers "Iniciar sesión"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('#home h1')).toContainText('Tu obra organizada.');
    await expect(page.locator('.nav-cta')).toHaveText(/Iniciar sesión/);
  });

  test('#21 #22 no placeholder video and no generic social links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Espacio para el video del equipo')).toHaveCount(0);
    await expect(page.locator('.team-video-space')).toHaveCount(0);
    await expect(page.locator('#team .purpose')).toBeVisible();
    await expect(page.locator('footer a[href^="https://www.facebook.com"], footer a[href^="https://www.instagram.com"], footer a[href^="https://x.com"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="mailto:contacto@arquitech.com"]')).toBeVisible();
  });

  test('#2 #6 variant B is fully translated, on a Spanish route and without internal codes', async ({ page }) => {
    await page.goto('/experiment/ec10?testVariant=B');
    await expect(page).toHaveURL(/\/experimento\/ec10\?testVariant=B/);
    await expect(page.locator('#home h1')).toContainText('Menos tiempo registrando');
    await expect(page.getByText(/EC10|VARIANTE|Prototipo experimental/)).toHaveCount(0);
    await page.locator('.language-toggle').click();
    await expect(page.locator('#home h1')).toContainText('Less time recording');
    const body = await page.locator('main').innerText();
    expect(body).not.toMatch(/Soy supervisor|Solicitar demostración|Menos tiempo|Organización/);
  });

  test('#13 the demo form explains the mailto step and shows a copyable address', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/experimento/ec10?testVariant=B');
    const notice = page.getByTestId('ec10-mail-notice');
    await expect(notice).toContainText('aplicación de correo');
    await expect(notice.getByRole('link', { name: 'contacto@arquitech.com' })).toBeVisible();
    await notice.getByRole('button', { name: 'Copiar correo' }).click();
    await expect(notice.getByRole('button', { name: 'Correo copiado' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('contacto@arquitech.com');
  });

  for (const width of [360, 390, 414]) {
    test(`#15 #16 at ${width}px there is no horizontal scroll and the menu has "Iniciar sesión"`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const route of ['/', '/experimento/ec10?testVariant=A', '/experimento/ec10?testVariant=B']) {
        await page.goto(route);
        await page.locator('#team').scrollIntoViewIfNeeded();
        expect(await overflow(page), route).toBeLessThanOrEqual(0);
        const purpose = (await page.locator('#team .purpose').boundingBox())!;
        expect(purpose.x + purpose.width, route).toBeLessThanOrEqual(width);
      }
      await page.goto('/');
      await page.locator('#menu-toggle').click();
      await expect(page.locator('nav .nav-signin')).toHaveText('Iniciar sesión');
    });
  }
});

test.describe('English browser (en-US)', () => {
  test.use({ locale: 'en-US' });

  test('#14 detects English on the first visit and remembers the choice', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('.language-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});
