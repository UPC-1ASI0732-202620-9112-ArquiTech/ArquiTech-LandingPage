# ArquiTech: contenido y decisiones

Fuentes locales revisadas: `upc-pre-202610--1asi0732-9112-ArquiTech-report/README.md`, sus assets, la landing Angular existente y `resq-landing-page/src` (incluidos los overrides finales de estilos).

- Reporte vigente, portada: Foundex; ArquiTech; Diseño de Experimentos; NRC 9112; periodo 2026-20; equipo Eduardo Chacaliaza, Victor Espino, Braden Garcia, Mariel Mendoza y Fabricio Quispe. Se prioriza este equipo sobre los videos de la landing reutilizada.
- Capítulo 1: problema de registros fragmentados, pequeñas y medianas constructoras de Lima Metropolitana, supervisores y contratantes. Misión y visión sintetizadas sin presentarlas como resultados alcanzados.
- Capítulos 3, 4 y 5: materiales, trabajadores, asistencia, tareas, maquinaria e incidentes; perfiles supervisor y contratante. Se evita afirmar sincronización offline, resultados medidos o gestión financiera implementada.
- Capítulo 4, Style Guidelines: acento Sinopia `#C43508`; casco/engranaje de `logo.jpg` conservado. `logo.png` se descarta de la interfaz porque contiene una llave de reparación de dispositivos, ajena a la marca.
- Capítulo 5.2: destino de aplicación `https://precious-bavarois-d27735.netlify.app/`, frente al enlace anterior de la landing. Video del producto `k3Z0771Au1Y`, también presente en la landing.
- Fotografías de los cinco integrantes: `assets/chapter-1/team` del reporte, copiadas sin alteración. Fotografía de planificación: `horarios.jpg` de la landing existente, con proporción conservada.
- Capítulos 4 y 5: Angular, Flutter, Spring Boot y MySQL. Se presentan como tecnologías, sin alianzas o certificaciones.
- ResQ: composición, dimensiones finales, navegación centrada, brillo de CTA, tarjetas, equipo, cierre compacto y fondos alternados. No se copian su contenido ni la acumulación de overrides CSS.

No se encontraron planes comerciales, precios, aliados acreditados ni un video de equipo correspondiente al grupo actual. Se muestran modalidades por rol y un bloque académico en lugar de video antiguo. No se conserva el teléfono de ejemplo, el correo no acreditado ni formularios sin servicio de envío. El contacto apunta al repositorio público documentado; falta un canal directo confirmado por el equipo.

## Ejecución

`npm start -- --port 4300` para desarrollo.

`npm run build` genera producción y materializa `/privacy/` y `/terms/` para hosting estático.

`npm run build:pages` aplica `/ArquiTech_LandingPage/` como base (la ruta publicada del reporte). Si el repositorio publicado cambia de nombre, usar `npm run build -- --base-href /NOMBRE/`.

Publicar `dist/landingatt3/browser`. Netlify usa `public/_redirects`; GitHub Pages usa los directorios legales generados. Todos los assets son relativos al base href. La preferencia de idioma se guarda en localStorage; YouTube se carga después de una acción del visitante.

## Correcciones posteriores a la validación inicial

El usuario solicitó retirar el video del producto y los enlaces al repositorio, sustituir el ecosistema por ejemplos de constructoras, añadir FAQ y hacer que el CTA final lleve a modalidades. El espacio del video del equipo permanece reservado. Redes sociales: sitios oficiales de Facebook, Instagram y Twitter/X. Contacto facilitado por el usuario: contacto@arquitech.com, Lima, Perú, +51 948 742 332. El mailto apunta a ArquiTech; se corrige el destino ResQ pegado en el mensaje.

Los builds y pruebas detallados arriba corresponden a la versión inicial. Las correcciones posteriores no se compilaron por solicitud expresa del usuario; el build final queda pendiente.
