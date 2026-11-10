# EC10 · Evaluación de la Landing Page

**Fecha:** 10 de noviembre de 2026, America/Lima. **Rama:** `experiment/ab-evaluation`. Se evaluaron el commit inicial `abe5e10f7ee6d254eeaadb12a936814f0893e307` y la corrección `cd872735fdcd246a472aaf21d44fae995552e428`. Ambas corridas usaron loopback, Chrome Headless 157.0.8103.39, Playwright 1.63.0 y datos sintéticos. [PR #11](https://github.com/educmz/ArquiTech-LandingPage/pull/11)

La evaluación cubre la exposición A/B, la persistencia, los beneficios por rol y la interacción local de contacto. La tarjeta EC10 y el capítulo VIII definen una evaluación comercial con tráfico comparable y presupuesto equivalente. El plan técnico EC10 define 200 visitantes sintéticos por variante, asignación persistente con semilla, exposición y eventos. Se consultaron también los criterios de aceptación de TB-HU10. [Plan de participantes](https://github.com/educmz/ArquiTech-FrontendWeb/blob/bad486e279e59d7af30dc80d1388a5e1b3d11ae9/experiments/participants/plan.json) · [Capítulo VIII](https://github.com/educmz/ArquiTech-Report/blob/2e53a047c43d9e6330ab8e999b6ac872d5f0d85e/README.md#capítulo-viii-experiment-driven-development)

## Evidencia histórica auditada

El job de Landing ejecutó dos pruebas Playwright con `AB_FULL=1`, 200 registros aprobados en A y 200 en B. Cada registro abrió un contexto nuevo, inyectó un ID e impuso la variante con `testVariant`. En A verificó la portada, la coincidencia del ID y el primer evento `view`. En B verificó la visibilidad del formulario y su botón, pulsó el rol alternado y comprobó el botón activo, el ID y el primer evento `view`. Los 200 registros B conservaron también `segment_selected`, pero el runner histórico no exigía su contenido. Hubo 100 selecciones por cada rol. La primera sesión de cada condición recargó manteniendo el parámetro forzado y volvió a comprobar la vista y el ID. No se envió el formulario ni se comprobó la asignación sin parámetro. El runner exacto coincide con el blob auditado `1e7a2a3593f4469b561e11b4613e008d3cde9723`; el log confirma el mismo commit de Landing que se evalúa aquí. [Ejecución histórica](https://github.com/educmz/ArquiTech-FrontendWeb/actions/runs/42757279970) · [Artefacto original](https://github.com/educmz/ArquiTech-FrontendWeb/actions/runs/42757279970/artifacts/13736537034) · [Runner exacto](https://github.com/educmz/ArquiTech-FrontendWeb/blob/84362bd423f6a9a051394f5f9b72cddfb0d1afdf/tests/experiments/ec10-browser.spec.ts)

La carpeta [histórica](evidence/historical-42757279970) conserva los dos JSON y el JUnit originales descargados. Las capturas y el informe HTML históricos permanecen en el artefacto original. El CI del PR comprobó, además, los tres casos EC10 de Angular TestBed (render A, cambio de segmento B y dos instancias del componente con B preasignada), el resto de la suite y la compilación. Las 400 visitas históricas quedan fuera de los totales de esta ejecución y de los recorridos autónomos. [CI del PR](https://github.com/educmz/ArquiTech-LandingPage/actions/runs/42755643617)

## Evaluación inicial

| Tipo de prueba | A correctas / ejecutadas | B correctas / ejecutadas | Correctas | Incorrectas |
| --- | ---: | ---: | ---: | ---: |
| Asignación persistente con semilla | 200 / 200 | 200 / 200 | 400 | 0 |
| Casos funcionales de navegador | 2 / 4 | 6 / 7 | 8 | 3 |
| Recorridos autónomos de contacto | 2 / 2 | 2 / 2 | 4 | 0 |
| **Total evaluable en navegador** | **204 / 206** | **208 / 209** | **412** | **3** |

La suite Angular local aprobó **6 de 6** pruebas, incluidas las tres de EC10. La compilación pasó. Si se incluyen esas seis pruebas de regresión, se obtienen **421 verificaciones evaluables, 418 correctas y 3 incorrectas**. Hubo una corrida funcional de preparación descartada por la restricción inicial de formularios del marco aislado. El primer recorrido autónomo V03/A también se conserva como piloto fuera del total evaluable. [Resultados funcionales](evidence/functional.csv) · [Suite Angular](evidence/angular-test.log) · [Compilación](evidence/angular-build.log)

### Asignación y exposición

Se ejecutó una comprobación nueva por cada uno de los 400 contextos aislados. Se sembró únicamente el ID, con paridad equilibrada a propósito, y se abrió `/experiment/ec10` sin `testVariant` ni asignación inicial. Se verificaron la variante calculada y visible, el ID, la persistencia tras recargar y los eventos `view` con variante, ID, segmento y tiempo coherentes. La primera asignación por variante incluyó otra pestaña del mismo contexto, con el mismo ID y variante y un registro de sesión independiente. Las imágenes se omitieron solo en esta batería de persistencia. El diseño comprueba que las dos salidas del algoritmo funcionan para los IDs elegidos. La distribución de tráfico real queda fuera de esta prueba. [CSV de asignación](evidence/assignment.csv) · [Eventos de asignación](evidence/assignment.json)

### Presentación, navegación y contacto

- **A.** La portada general y su enlace de correo estuvieron disponibles. La activación de correo dejó únicamente `view` en la instrumentación de EC10. `FUNC-A02` y `FUNC-A03` fallaron al verificar continuidad. Las CTA de la portada y del plan navegaron a `/#plans` y `/#contact`, respectivamente, fuera de `/experiment/ec10`. [Portada](evidence/FUNC-A01.png) · [Traza CTA a planes](evidence/FUNC-A02.zip) · [Traza CTA a contacto](evidence/FUNC-A03.zip)
- **B.** Los dos botones actualizaron el beneficio visible, `aria-pressed` y `segment_selected`. Se rechazaron organización vacía, correo mal formado y organización compuesta de espacios, con alerta y sin `mailto_intent`. Para cada rol se comprobó el destinatario, asunto, cuerpo codificado y evento `mailto_intent`. Reabrir el borrador volvió a intentar el protocolo sin añadir otro evento. `FUNC-B07` falló al abrir «Service plan» en la navegación compartida. Llegó a `/#plans`, mostró el control y conservó en sesión la vista B anterior. [Formulario móvil](evidence/FUNC-B06.png) · [Traza de salida de B](evidence/FUNC-B07.zip) · [Eventos y errores](evidence/functional.json)
- **Condición de idioma.** Con los mismos contextos nuevos y locale `es-PE`, el control y la navegación compartida se mostraron en inglés por defecto, mientras el cuerpo experimental B se mostró en español. Los resultados de navegación se limitan a esa combinación de interfaz, idioma y mecanismo de contacto. [Control](evidence/FUNC-A01.png) · [Variante B](evidence/FUNC-B06.png)
- **Aislamiento.** El servidor escuchó en `127.0.0.1`. Playwright bloqueó solicitudes HTTP externas y Chrome bloqueó la navegación a protocolos externos desde el iframe de contacto. Se usaron una organización sintética y un correo `example.invalid`. La consola confirma el bloqueo al activar cada enlace de A y al preparar o reabrir el borrador en B. El mensaje de B indica que se preparó un correo aunque la apertura del cliente se bloqueó. Se comprobó el destino local, no la entrega ni la recepción de mensajes. [Registros funcionales](evidence/functional.json)

### Navegación autónoma

Codex, de la familia GPT‑6, eligió cada acción a partir del árbol de accesibilidad observado y un objetivo común de contacto. Se utilizaron V03 (supervisor, emulación móvil de 390 × 844) y V04 (contratante, escritorio de 1440 × 900) en ambas variantes, con contextos independientes, mismo locale, datos y servidor. Se forzó la variante para emparejar el objetivo por perfil. El controlador Playwright ejecutó las acciones elegidas y guardó observación, decisión, acción, tiempo y errores. Un verificador determinista separado leyó los resultados del navegador y comprobó el correo activado en A o el borrador y evento del rol en B, además del bloqueo del protocolo y la presencia de evidencias. [Perfiles](https://github.com/educmz/ArquiTech-FrontendWeb/blob/bad486e279e59d7af30dc80d1388a5e1b3d11ae9/experiments/participants/profiles.json) · [Verificador](verify-autonomous.mjs) · [Resultados](evidence/outcomes.csv)

| Perfil | A | B |
| --- | --- | --- |
| V03 | Activó el correo del pie y permaneció en EC10 | Preparó el borrador de supervisor |
| V04 | Llegó al correo desde planes y contacto, fuera de la ruta EC10 | Seleccionó contratante y preparó el borrador correspondiente |

Los cuatro lograron el objetivo técnico de contacto. La permanencia en la ruta es un resultado separado del contacto. El piloto V03/A devolvió un árbol vacío durante la transición a planes y el controlador rechazó la acción siguiente. Se cerró ese contexto y se repitió con uno nuevo; el segundo recorrido eligió el correo visible del pie. La primera sesión está documentada en [pilot/](evidence/pilot). El operador de navegación fue el mismo modelo, conocía la tarea global y pudo observar el tratamiento. Los tiempos incluyen esperas del controlador y decisiones entre acciones. Estos recorridos constituyen un diagnóstico exploratorio de dos perfiles, sin interpretación de tiempos humanos ni inferencia causal.

## Corrección y nueva ejecución

| Caso | Observación inicial | Resultado después de la corrección |
| --- | --- | --- |
| `FUNC-A02` | La CTA abría `/#plans`. | La CTA abre el plan visible en `/experiment/ec10#plans` y conserva los parámetros de la sesión. La CTA del cierre apunta al mismo fragmento. |
| `FUNC-A03` | La CTA del plan abría `/#contact`. | La CTA abre el contacto visible en `/experiment/ec10#contact` y conserva el ID, la variante y el evento de vista. |
| `FUNC-B07` | El menú abría `/#plans` y mostraba el control. | El menú abre el plan del servicio dentro de B. Su CTA conduce al formulario de demostración de B. Se conservaron el segmento seleccionado, la organización introducida y los eventos. |

La corrección reutiliza la sección de planes en las dos variantes y en la portada pública. En el ensayo, los enlaces conservan la ruta y los parámetros activos. En la portada pública se conservan los destinos `#plans` y `#contact`, comprobados mediante `FUNC-P01`. El cambio del menú compartido se limita al enlace de planes dentro de EC10. [Implementación](https://github.com/educmz/ArquiTech-LandingPage/commit/cd872735fdcd246a472aaf21d44fae995552e428) · [CSV inicial](evidence/functional.csv) · [CSV posterior](evidence/retest/functional.csv)

| Verificación posterior | A correctas / ejecutadas | B correctas / ejecutadas | Otras correctas / ejecutadas |
| --- | ---: | ---: | ---: |
| Asignación persistente con semilla | 200 / 200 | 200 / 200 | |
| Funcionales de navegador | 4 / 4 | 7 / 7 | 1 / 1 pública |
| Recorridos autónomos de contacto | 2 / 2 | 2 / 2 | |
| Regresión Angular | | | 6 / 6 |
| **Total** | **206 / 206** | **209 / 209** | **7 / 7** |

Pasaron **422 de 422 verificaciones** posteriores, incluidas 416 de navegador. La compilación pasó. La cohorte repetida comprueba persistencia sobre las mismas semillas en contextos nuevos. Es una regresión de las asignaciones y no se suma a la muestra de conversión. Los casos funcionales conservaron el comportamiento de segmentos, validación, borrador y eventos. [Asignación posterior](evidence/retest/assignment.csv) · [Eventos funcionales](evidence/retest/functional.json) · [Angular](evidence/retest/angular-test.log) · [Compilación](evidence/retest/angular-build.log)

Los cuatro recorridos autónomos se repitieron con el mismo objetivo, perfiles y condiciones iniciales. A recorrió el plan y el contacto sin salir de EC10. En B, el supervisor usó el formulario directamente y el contratante consultó el plan desde el menú, volvió al formulario y preparó el borrador de su rol. El verificador exigió permanencia en EC10 y corroboró que Chrome bloqueó el protocolo externo en cada recorrido. Los tiempos corresponden al navegador y al operador automatizado. [Resultados autónomos posteriores](evidence/retest/outcomes.csv) · [Trazas y capturas posteriores](evidence/retest/)

La evidencia posterior está en `evidence/retest/`. Los CSV, JSON y capturas iniciales conservan sus bytes y documentan los tres fallos. Para publicar, se sustituyeron las rutas absolutas del equipo en los logs de compilación y en los metadatos de las trazas de ambas corridas. Las acciones, tiempos y resultados registrados se conservaron. La [lista de hashes iniciales preservados](evidence/initial-SHA256SUMS) y el [manifiesto de cierre](SHA256SUMS) se verifican desde `docs/ec10`. [Configuración posterior](evidence/retest/manifest.json)

## M11 y F03

| Indicador | Definición y meta | Estado |
| --- | --- | --- |
| M11 | `(tasa_B − tasa_A) / tasa_A × 100`, con tasa igual a solicitudes de demostración calificadas por visita única. Meta ≥ 20 % de incremento relativo. | Sin estimar. Faltan visitas comerciales únicas atribuibles y solicitudes efectivamente recibidas y calificadas por variante. Una tasa de referencia cero también dejaría la variación relativa indefinida. |
| F03 | `(costo_A − costo_B) / costo_A × 100`, con costo por prospecto igual a gasto de adquisición atribuible en S/ dividido por prospectos calificados. Meta ≥ 15 % de reducción. | Sin estimar. Faltan el gasto atribuible por variante y periodo y los prospectos calificados. |

El resultado técnico `mailto_intent` acredita que el prototipo inició la preparación del correo. La historia TB-HU10 pide registrar y confirmar una solicitud con medio de contacto válido, vínculo con construcción e interés en gestionar o consultar una obra. El formulario actual solo solicita organización y correo y el registro de eventos queda en `sessionStorage`. El clic directo de A tampoco genera un evento CTA comparable. Por tanto, no se estima una tasa A/B de CTA comercial ni se contrasta H10. [Definiciones y protocolo del capítulo VIII](https://github.com/educmz/ArquiTech-Report/blob/2e53a047c43d9e6330ab8e999b6ac872d5f0d85e/README.md)

## Revisión y pendientes

Para el ensayo comercial queda pendiente registrar exposición y acciones de contacto comparables, y vincular de forma seudonimizada las solicitudes recibidas a su variante. También se requiere aplicar el mismo criterio previo de calificación y registrar gasto atribuible por variante y periodo. Las 200 sesiones por condición constituyen una escala técnica. La potencia de un ensayo de conversión queda por determinar con datos comerciales.

## Reproducción y archivos

Desde la raíz de Landing Page, con las dependencias instaladas en el repositorio de Landing y Playwright disponible en el checkout vecino de FrontendWeb, iniciar `npm run start -- --host 127.0.0.1 --port 4300`. En PowerShell, elegir una carpeta de salida distinta para no sobrescribir el resultado archivado.

```powershell
$env:EC10_PLAYWRIGHT_PACKAGE = '../ArquiTech-FrontendWeb/package.json'
$env:CHROME_BIN = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:EC10_OUTPUT = Join-Path $env:TEMP 'ec10-rerun'
node docs/ec10/check-assignment.mjs
node docs/ec10/check-functional.mjs
```

Para repetir el juicio sobre los recorridos archivados, ejecutar `node docs/ec10/verify-autonomous.mjs` desde la raíz con `EC10_OUTPUT` apuntando a una copia de [evidence/](evidence). Para la corrida posterior, apuntar a una copia de [evidence/retest/](evidence/retest/) y añadir `--require-continuity`. Para otros recorridos autónomos, el operador puede usar `autonomous-session.mjs` y un directorio de comandos nuevo mediante `EC10_AGENT_QUEUE`, conservando una observación antes de cada decisión. Los ZIP son trazas Playwright. [Configuración de la corrida inicial](evidence/manifest.json)

El [manifiesto SHA-256](SHA256SUMS) cubre el informe, los scripts y los archivos de evidencia con rutas relativas a esta carpeta. Se puede comprobar con `sha256sum -c SHA256SUMS` desde `docs/ec10`.
