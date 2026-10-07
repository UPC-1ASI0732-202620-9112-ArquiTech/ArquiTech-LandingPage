# Validación de la landing ArquiTech

- Build de producción: correcto, sin errores Angular ni warnings de budgets. Bundle inicial 307.53 kB; transferencia estimada 84.69 kB.
- Build GitHub Pages: correcto con /ArquiTech_LandingPage/.
- Karma + ChromeHeadless: 3/3 pruebas correctas (shell y ruta inicial, persistencia e idioma del documento, ruta legal con shell compartido).
- Playwright + ChromeHeadless: 1440×960, 820×1180 y 390×844; rutas raíz y base de GitHub Pages.
- Sin errores JavaScript, respuestas locales fallidas, imágenes rotas ni desbordamiento horizontal.
- Comprobados: orden de secciones, centro geométrico de navegación y copyright, apertura/cierre móvil y Escape, compensación de anclas desde páginas legales, traducciones ES/EN y persistencia tras recarga, seis apartados por página legal, rutas legales estáticas directas, carga voluntaria de YouTube y controles del iframe, enlaces con destinos.
- Revisión visual de capturas completas de escritorio y móvil. Contraste de títulos del footer corregido.
- Aplicación publicada, repositorio del reporte y página del video: HTTP 200. Esto comprueba disponibilidad del destino, no autenticación en la aplicación ni reproducción de terceros.
- git diff --check: correcto.

Capturas y script de QA: C:/Users/educmz/Documents/ChatGPT/Arquitech/landing-update/qa y ../qa.cjs. La QA aprovecha Playwright ya instalado en otro proyecto; no agrega dependencias a esta landing.

Pendientes de contenido: canal directo confirmado, video del equipo actual. No hay evidencia de planes comerciales ni aliados: se presentan perfiles de uso y tecnologías.

## Correcciones posteriores a la validación inicial

El usuario solicitó retirar el video del producto y los enlaces al repositorio, sustituir el ecosistema por ejemplos de constructoras, añadir FAQ y hacer que el CTA final lleve a modalidades. El espacio del video del equipo permanece reservado. Redes sociales: sitios oficiales de Facebook, Instagram y Twitter/X. Contacto facilitado por el usuario: contacto@arquitech.com, Lima, Perú, +51 948 742 332. El mailto apunta a ArquiTech; se corrige el destino ResQ pegado en el mensaje.

Los builds y pruebas detallados arriba corresponden a la versión inicial. Las correcciones posteriores no se compilaron por solicitud expresa del usuario; el build final queda pendiente.
