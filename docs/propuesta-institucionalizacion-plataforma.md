# Propuesta de institucionalización y continuidad de la plataforma web/app

Documento preparado por: Alejandro Zambrano

Fecha: 8 de julio de 2026

---

## 1. Resumen ejecutivo

La plataforma web de Iglesia Alianza Puembo comenzó como un proyecto personal para mejorar la página web de la iglesia y ofrecer una presencia digital más clara, moderna y útil. Con el tiempo, el proyecto creció más allá de una página informativa: hoy funciona como una herramienta operativa para comunicación, formularios, inscripciones, eventos, seguimiento financiero, correos, administración de contenido y apoyo a procesos internos.

El siguiente paso recomendado es pasar el control operativo del proyecto a manos de la iglesia. Esto significa que el código, la infraestructura, la base de datos, los accesos, los dominios, las credenciales y los servicios externos deben quedar bajo cuentas institucionales, con al menos dos administradores designados por la iglesia y mecanismos claros de recuperación.

El objetivo no es solamente “tener una página web”, sino construir una plataforma institucional que ayude a la iglesia a:

- comunicar mejor;
- reducir trabajo manual;
- ordenar inscripciones y respuestas;
- mejorar el seguimiento financiero;
- automatizar procesos administrativos;
- conservar continuidad aunque una persona deje de servir, cambie de rol o ya no esté disponible;
- permitir que otro desarrollador pueda continuar el proyecto si fuera necesario.

La decisión técnica actual es mover la operación hacia Cloudflare como plataforma principal de hosting y almacenamiento, optimizar las imágenes del sitio y migrar los buckets de archivos desde Supabase Storage hacia Cloudflare R2. Supabase se mantendría para base de datos y autenticación, mientras siga siendo suficiente para el uso actual.

Además del costo mínimo de operación, el desarrollo continuo actualmente se apoya en Codex/ChatGPT como herramienta de programación, análisis y documentación. Ese costo debe considerarse como herramienta de desarrollo activo: $20/mes mientras la iglesia quiera mantener evolución constante de la plataforma.

---

## 2. Origen del proyecto

Este proyecto fue iniciado por Alejandro Zambrano como un proyecto personal, con la intención inicial de darle a la iglesia una mejor página web que la que tenía en ese momento. La primera necesidad era mejorar la presentación pública de la iglesia: información más clara, mejor diseño, acceso a ministerios, eventos, donaciones, ubicación, noticias y recursos.

Con el crecimiento del proyecto, se hizo evidente que la oportunidad era mayor. La plataforma podía convertirse en una herramienta para automatizar y optimizar procesos administrativos, financieros y de comunicación. En vez de depender únicamente de hojas de cálculo, mensajes sueltos, formularios aislados o procesos manuales, la iglesia puede tener un sistema centralizado para operar mejor.

Por esa razón, aunque el proyecto nació desde una iniciativa personal, hoy conviene que pase formalmente a control institucional. La iglesia debe poder administrarlo, financiarlo, recuperarlo y continuarlo sin depender exclusivamente de una cuenta personal.

---

## 3. Qué es la plataforma

La plataforma es una aplicación web institucional construida para servir tanto a la comunidad externa como al equipo interno de la iglesia.

En su parte pública, funciona como la página oficial de la iglesia. En su parte privada, funciona como un panel administrativo para gestionar contenido, formularios, inscripciones, eventos, finanzas, comunidad y comunicaciones.

Actualmente la plataforma incluye:

- sitio web público;
- panel administrativo protegido por login;
- gestión de eventos;
- gestión de noticias;
- recursos devocionales LOM;
- formularios públicos e internos;
- inscripciones y seguimiento privado;
- formularios financieros con comprobantes;
- conciliación de comprobantes de ingreso;
- reportes y exportaciones;
- campañas y correos automáticos;
- gestión de peticiones de oración;
- gestión de mensajes de contacto;
- permisos por rol;
- almacenamiento de imágenes, archivos y comprobantes.

---

## 4. Cómo ayuda actualmente a la iglesia

### 4.1 Sitio público

El sitio público permite que miembros, visitantes y personas nuevas encuentren información de la iglesia sin depender de mensajes individuales.

Incluye:

- información general de la iglesia;
- secciones de Conócenos, Equipo, Creencias, Involúcrate y Ministerios;
- eventos próximos y calendario;
- noticias;
- recursos LOM;
- página de donaciones;
- contacto;
- ubicación;
- formularios públicos;
- peticiones de oración.

Beneficio para la iglesia:

- mejora la primera impresión para visitantes;
- reduce preguntas repetidas;
- centraliza información;
- facilita que personas nuevas se conecten;
- apoya la comunicación de ministerios y eventos.

### 4.2 Panel administrativo

El panel administrativo permite al equipo gestionar contenido y procesos sin tocar código.

Incluye:

- acceso protegido por usuarios;
- permisos por área;
- gestión de eventos;
- gestión de noticias;
- gestión de recursos LOM;
- gestión de formularios;
- revisión de respuestas;
- gestión de comunidad;
- módulo financiero;
- preferencias y configuraciones;
- notificaciones internas.

Beneficio para la iglesia:

- disminuye dependencia de una sola persona técnica;
- permite delegar tareas;
- ordena responsabilidades;
- mejora trazabilidad;
- reduce errores por procesos manuales.

### 4.3 Formularios e inscripciones

La plataforma permite crear formularios dinámicos para registros, inscripciones, procesos internos y eventos.

Incluye:

- constructor de formularios;
- campos personalizados;
- formularios públicos e internos;
- cupos;
- enlaces compartibles;
- enlaces cortos para WhatsApp o material impreso;
- seguimiento privado por inscripción;
- formularios financieros;
- pagos únicos o en cuotas;
- comprobantes compartidos;
- cuentas bancarias de destino;
- revisión delegada de respuestas.

Beneficio para la iglesia:

- elimina dependencia de múltiples herramientas externas;
- reduce uso de hojas de cálculo sueltas;
- permite que cada persona vea el estado de su inscripción;
- facilita el seguimiento de pagos;
- da acceso limitado a servidores o líderes sin entregar acceso completo al sistema.

### 4.4 Finanzas y conciliación de ingresos

Actualmente existe una parte del proceso financiero orientada a ingresos de eventos e inscripciones. La plataforma permite recibir comprobantes de pago, registrarlos, revisarlos y conciliarlos contra información bancaria.

Incluye:

- recepción de comprobantes por formulario;
- comprobantes adicionales desde enlace privado;
- estados de pago;
- pagos pendientes, verificados o rechazados;
- pagos en cuotas;
- pagos compartidos;
- registro manual de pagos;
- carga de extractos bancarios;
- conciliación asistida;
- interpretación de comprobantes con apoyo de IA;
- reportes y exportaciones.

Beneficio para la iglesia:

- reduce revisión manual;
- mejora control financiero;
- permite detectar pagos duplicados, incompletos o no identificados;
- ordena información para tesorería;
- facilita reportes por evento o formulario.

### 4.5 Comunicaciones

La plataforma permite enviar confirmaciones, recordatorios y campañas relacionadas con formularios e inscripciones.

Incluye:

- correos automáticos de confirmación;
- recordatorios de pago;
- campañas de correo asociadas a formularios;
- destinatarios basados en inscripciones;
- pruebas de campañas;
- adjuntos;
- programación de envíos;
- base para comunicaciones por WhatsApp.

Próximo paso previsto:

- usar WhatsApp Business Platform/API para campañas y recordatorios;
- crear audiencias y contactos con consentimiento explícito;
- permitir mensajes aprobados desde el panel administrativo;
- programar recordatorios de eventos;
- registrar historial de envíos y entregas;
- incluir opción de salida o baja cuando aplique;
- usar asistencia de IA para proponer textos, siempre con aprobación humana antes de enviar.

Beneficio para la iglesia:

- mejora el seguimiento con inscritos;
- reduce mensajes manuales;
- permite comunicación más ordenada;
- mejora la experiencia de las personas que participan en eventos o procesos.

### 4.6 Comunidad y atención pastoral

La plataforma también ayuda a recibir y organizar interacciones de la comunidad.

Incluye:

- mensajes de contacto;
- peticiones de oración;
- moderación de peticiones públicas;
- estados de lectura/respuesta;
- formularios internos para procesos del staff.

Beneficio para la iglesia:

- ayuda a responder mejor;
- evita que solicitudes se pierdan;
- permite ordenar necesidades pastorales y administrativas.

---

## 5. Procesos clave en desarrollo

El objetivo de la plataforma es avanzar hacia la automatización de procesos administrativos y financieros importantes para la iglesia. En este momento hay dos procesos clave: Proceso Eventos y Proceso Pagos.

### 5.1 Proceso Eventos

El Proceso Eventos busca ordenar la gestión financiera completa de un evento, desde la planificación hasta el cierre.

El flujo completo deseado es:

1. Desarrollo de presupuesto.
2. Liberación de anticipos.
3. Cuadre de ingresos y egresos.
4. Conciliación de comprobantes y facturas.
5. Informe final del evento.

Estado actual:

La plataforma ya tiene implementada una parte importante del proceso: la conciliación de comprobantes de ingreso. Esto permite revisar pagos recibidos por inscripciones, comparar contra información bancaria y generar seguimiento financiero.

Pendiente por implementar:

- presupuesto por evento;
- solicitud y aprobación de anticipos;
- registro de egresos;
- carga y validación de facturas;
- comparación entre presupuesto, ingresos, anticipos y gastos reales;
- informe final del evento;
- cierre administrativo y financiero.

Beneficio esperado:

- mejor control antes, durante y después del evento;
- reducción de reprocesos;
- mejor visibilidad para liderazgo y tesorería;
- documentación financiera más ordenada;
- capacidad de aprender de cada evento para presupuestos futuros.

### 5.2 Proceso Pagos

El Proceso Pagos busca automatizar y optimizar el desembolso de pagos a proveedores. Actualmente este proceso depende principalmente de cuadros, correos, fotos, aprobaciones por email y comprobantes enviados manualmente.

Flujo actual:

1. El administrador y el contador preparan el flujo de caja y elaboran el cuadro de pagos del periodo.
2. El pastor y el tesorero revisan el cuadro de pagos. Actualmente esta revisión se realiza por correo electrónico.
3. Si existen observaciones o rechazo, el cuadro se corrige y se vuelve a enviar para revisión. Si se aprueba, continúa el proceso.
4. El administrador carga los pagos en Banco Pacífico.
5. El administrador envía por correo fotos o capturas agrupadas por bloques/categorías de los pagos que van a salir.
6. El pastor y el tesorero aprueban esos bloques de pagos por correo.
7. El administrador verifica las transferencias y envía comprobantes a cada proveedor. Actualmente estos comprobantes suelen ser capturas de una fila de Excel indicando que el pago fue realizado. También se envía un resumen al pastor y al tesorero.

Problemas del flujo actual:

- demasiada dependencia de correos;
- dificultad para seguir versiones del cuadro de pagos;
- aprobaciones dispersas;
- observaciones repartidas en hilos de email;
- fricción para aprobar o rechazar;
- poca trazabilidad centralizada;
- comprobantes poco formales para proveedores;
- dificultad para consultar históricamente qué se aprobó, quién lo aprobó, cuándo se pagó y qué se envió.

Primera fase propuesta: centralizar y automatizar el flujo dentro de la plataforma.

La plataforma debería permitir:

- crear un periodo de pagos a partir del flujo de caja;
- cargar o construir el cuadro de pagos del periodo;
- organizar pagos por categoría, bloque, proveedor, monto, fecha y cuenta;
- adjuntar documentos de respaldo;
- manejar estados como borrador, en revisión, observado, rechazado, aprobado, cargado en banco, pendiente de aprobación final, pagado, notificado y cerrado;
- registrar observaciones dentro de la plataforma;
- permitir aprobación o rechazo con pocos clics;
- notificar por correo a cada persona cuando le toque revisar, observar o aprobar;
- mantener trazabilidad de quién aprobó, rechazó, observó o modificó cada bloque;
- cargar evidencia de transferencias realizadas;
- generar correos formales y claros para proveedores con la confirmación de pago;
- generar un correo resumen para pastor y tesorero con todos los pagos realizados;
- conservar historial completo por periodo.

En esta primera fase, el banco seguiría siendo el lugar donde se ejecutan las transferencias. La mejora principal sería eliminar el desorden operativo alrededor del proceso: menos redacción de correos, menos capturas manuales, menos seguimiento informal y más control desde una sola plataforma.

Segunda fase propuesta: evaluar integración con Banco Pacífico.

Después de centralizar el flujo, se puede evaluar si Banco Pacífico ofrece una forma formal y segura de integración. Las posibilidades pueden incluir:

- generación de archivos compatibles para carga masiva en el banco;
- importación de reportes/exportaciones bancarias para confirmar pagos;
- integración API o empresarial si el banco la ofrece y la iglesia tiene acceso;
- conciliación automática entre pagos aprobados en la plataforma y pagos ejecutados en el banco.

Esta segunda fase debe hacerse solo con mecanismos oficiales del banco. No se debe automatizar el portal bancario usando credenciales personales, scraping, bots de navegador o métodos frágiles que comprometan seguridad o cumplimiento.

Beneficio esperado:

- menos pagos gestionados por correos sueltos;
- revisión y aprobación más rápida;
- mejor control por periodo de pagos;
- trazabilidad de aprobaciones y observaciones;
- comprobantes más formales para proveedores;
- resumen claro para pastor y tesorero;
- menor carga administrativa para el administrador y el contador;
- base ordenada para una futura integración bancaria.

---

## 6. Por qué debe pasar a manos de la iglesia

Actualmente varios servicios fueron iniciados desde cuentas personales. Esto fue práctico para comenzar, pero no es la estructura correcta para una plataforma institucional.

La iglesia debe tener control sobre:

- repositorio de código;
- despliegue y hosting;
- base de datos;
- autenticación;
- almacenamiento de archivos;
- dominio;
- llaves API;
- correos transaccionales;
- proveedores externos;
- facturación;
- recuperación de cuentas;
- documentación técnica;
- accesos administrativos.

Riesgos de mantenerlo en cuentas personales:

- dependencia de una sola persona;
- dificultad para continuar si Alejandro deja el rol, se ausenta o no está disponible;
- dificultad para contratar otro desarrollador;
- riesgo de pérdida de acceso;
- facturación y propiedad mezcladas con cuentas personales;
- menor claridad sobre quién puede autorizar cambios;
- dificultad para auditar o recuperar servicios.

Beneficios de institucionalizarlo:

- continuidad operativa;
- gobierno claro;
- recuperación ante emergencias;
- posibilidad de delegar o contratar soporte;
- separación entre propiedad institucional y portafolio personal;
- mayor seguridad;
- mejor control de costos;
- mejor base para futuros procesos financieros.

---

## 7. Plan de propiedad institucional

La plataforma debe quedar organizada bajo cuentas institucionales con al menos dos administradores de la iglesia. Cada administrador debe usar su propia cuenta institucional y tener MFA activado.

### 7.1 Código fuente

El repositorio principal debe pasar a una organización de GitHub controlada por la iglesia.

La recomendación es:

- crear una organización de GitHub de Iglesia Alianza Puembo;
- transferir el repositorio principal a esa organización;
- mantener el historial completo del proyecto;
- proteger la rama principal;
- dar acceso de administrador solo a custodios institucionales;
- permitir acceso de desarrollo a quien corresponda;
- mantener un espejo personal para portafolio de Alejandro, sin secretos, datos, base de datos, comprobantes ni información sensible.

### 7.2 Hosting y despliegue

La decisión actual es evaluar y ejecutar el despliegue en Cloudflare Workers con OpenNext, en una cuenta institucional de la iglesia.

Razón:

- menor costo base esperado que Vercel Pro;
- buena capacidad para Next.js full-stack;
- mejor integración con Cloudflare R2;
- egress favorable;
- posibilidad de centralizar hosting, almacenamiento y seguridad en Cloudflare.

La aplicación debe probarse en Cloudflare antes de cortar producción. Se debe validar:

- sitio público;
- login;
- panel administrativo;
- formularios;
- inscripciones;
- carga de archivos;
- comprobantes;
- emails;
- tareas programadas;
- imágenes;
- permisos.

### 7.3 Base de datos y autenticación

Supabase debe mantenerse para base de datos y autenticación.

Razón:

- la aplicación ya está construida sobre Supabase;
- la base de datos actual es la fuente de verdad;
- migrar la base de datos y autenticación en esta etapa agregaría mucho riesgo;
- el uso actual de base de datos y usuarios todavía es bajo.

Acción recomendada:

- pasar la organización/proyecto de Supabase a control institucional;
- agregar administradores de la iglesia;
- rotar llaves;
- mantener migraciones desde el repositorio;
- evitar cambios manuales de esquema en producción;
- evaluar Supabase Pro solo si se necesitan backups, mayor almacenamiento de base de datos, mayor egress, soporte o más garantías operativas.

### 7.4 Almacenamiento de archivos

La decisión actual es optimizar todas las imágenes y migrar todos los buckets de Supabase Storage a Cloudflare R2.

Buckets actuales:

| Bucket | Uso principal | Público | Tamaño actual aproximado |
|---|---|---:|---:|
| `event-posters` | Posters de eventos | Sí | 385 MB |
| `news-images` | Imágenes de noticias | Sí | 98 MB |
| `forms` | Imágenes/PDFs usados en formularios | Sí | 67 MB |
| `finance_receipts` | Comprobantes financieros | No | 46 MB |
| `form_email_attachments` | Adjuntos de campañas de correo | No | <1 MB |
| `form_uploads` | Archivos subidos en formularios | No | <1 MB |
| `public-images` | Imágenes públicas generales | Sí | 0 MB |

Uso total actual aproximado: 626 MB.

Motivo de la decisión:

- Supabase Free incluye 1 GB de almacenamiento y el proyecto ya está alrededor del 60% de uso;
- el mayor consumo viene de imágenes públicas, especialmente posters de eventos;
- Cloudflare R2 ofrece más margen inicial y egress gratis;
- centralizar hosting y almacenamiento en Cloudflare simplifica costos y operación;
- optimizar imágenes antes de migrar reduce uso, carga más rápido el sitio y mejora experiencia de usuario.

Consideraciones técnicas:

- los archivos públicos son sencillos de servir desde R2;
- los archivos privados requieren implementación cuidadosa de URLs firmadas o acceso controlado;
- la migración debe preservar referencias existentes;
- no se deben perder comprobantes, adjuntos ni archivos históricos;
- se debe probar subida, descarga, visualización, permisos y expiración de enlaces.

### 7.5 Correos

Resend se usa para correos transaccionales y campañas relacionadas con formularios.

Debe pasar a una cuenta o equipo institucional, con:

- dominio verificado;
- administradores institucionales;
- llaves API rotadas;
- control de facturación;
- pruebas de entrega.

### 7.6 Google Cloud, Maps, YouTube y Gemini

Actualmente se usan servicios de Google para mapas, YouTube y funciones de IA.

La recomendación es:

- crear o institucionalizar el proyecto de Google Cloud;
- usar identidades institucionales, aunque la iglesia use Microsoft 365 para correo;
- no depender de cuentas Gmail personales;
- restringir llaves API por dominio y servicio;
- rotar llaves;
- mantener YouTube bajo gobernanza institucional;
- conservar los datos históricos de formularios que todavía tienen referencias antiguas a Google Sheets/Drive.

La integración vieja con Google Drive/Sheets ya fue retirada como dependencia activa. Sus referencias históricas se conservan para no perder contexto de formularios pasados.

### 7.7 Otros servicios

También deben revisarse o institucionalizarse:

- Cloudflare Turnstile;
- cron-job.org o mecanismo equivalente de tareas programadas;
- Meta/Facebook/Instagram;
- WhatsApp Business Platform/API;
- Pixieset;
- Google Business Profile;
- GoDaddy/dominio;
- Microsoft 365.

Dominio y Microsoft 365 ya están bajo control institucional. Deben documentarse administradores, recuperación y renovación.

---

## 8. Estructura de costos

Los valores son estimaciones de referencia revisadas en julio de 2026. Deben validarse nuevamente antes de contratar o migrar servicios. No incluyen impuestos, variaciones regionales ni comisiones de pagos con tarjeta.

### 8.1 Costo operativo esperado

| Servicio | Uso en el proyecto | Costo mensual esperado | Costo anual esperado | Comentario |
|---|---|---:|---:|---|
| Cloudflare Workers Paid | Hosting de la aplicación Next.js | $5 | $60 | Base recomendada para producción. Incluye margen suficiente según el uso actual observado. |
| Cloudflare R2 | Almacenamiento de buckets y archivos | $0 inicial esperado | $0 inicial esperado | El uso actual está muy por debajo de 10 GB. Si crece, Standard Storage cuesta aprox. $0.015 por GB-mes. |
| Cloudflare Turnstile | Protección anti-spam/captcha | $0 | $0 | Servicio gratuito para este caso de uso. |
| Supabase Free | Base de datos, Auth y APIs | $0 | $0 | Se mantiene mientras los límites sean suficientes. Storage se migraría a R2 para liberar presión. |
| GitHub Organization | Repositorio institucional | $0 esperado | $0 esperado | Suficiente para control de código y colaboración básica. |
| Codex / ChatGPT Plus | Desarrollo asistido, revisión de código, documentación y mantenimiento continuo | $20 | $240 | Herramienta de desarrollo activo. No es necesaria para servir la app, pero sí para acelerar evolución y soporte técnico. |
| Resend | Correos transaccionales y campañas | $0 esperado | $0 esperado | Mientras el volumen esté dentro del plan gratuito. Puede requerir upgrade si aumentan campañas. |
| WhatsApp Business Platform/API | Campañas, recordatorios y comunicaciones por WhatsApp | Variable; sin costo fijo esperado de plataforma | Variable | Meta cobra por mensaje entregado según país y categoría. El costo unitario suele ser bajo, pero debe presupuestarse por volumen. |
| Google Cloud / Maps / YouTube / Gemini | Mapa, videos/YouTube e IA | $0 esperado con uso bajo | $0 esperado con uso bajo | Requiere proyecto institucional y control de llaves. Puede generar consumo si sube el uso. |
| cron-job.org o equivalente | Ejecución de tareas programadas | $0 esperado | $0 esperado | Puede reemplazarse o integrarse con Cloudflare si conviene. |
| Dominio | `alianzapuembo.org` | Existente | Existente | Ya está bajo control institucional; costo depende de renovación del registrador. |
| Microsoft 365 | Correos institucionales | Existente | Existente | Ya está bajo control institucional; no se considera costo nuevo de la plataforma. |

Costo nuevo mínimo esperado para operar la plataforma:

```text
Cloudflare Workers Paid: $5/mes
Total operación mínima:  $5/mes
Total anual mínimo:      $60/año
```

Costo esperado si la iglesia mantiene desarrollo activo con Codex:

```text
Cloudflare Workers Paid: $5/mes
Codex / ChatGPT Plus:    $20/mes
Total con desarrollo:    $25/mes
Total anual estimado:    $300/año
```

Este total asume que Supabase, Resend, Google APIs y R2 se mantienen dentro de sus límites gratuitos o de bajo consumo. No incluye costos variables de WhatsApp, comisiones de pagos con tarjeta, ni eventuales upgrades por crecimiento.

### 8.2 Costos que pueden activarse con crecimiento

| Servicio | Cuándo puede generar costo adicional | Referencia de costo |
|---|---|---:|
| Cloudflare R2 | Si se superan 10 GB de almacenamiento o los límites gratuitos de operaciones | $0.015 por GB-mes en Standard Storage; operaciones según volumen |
| Cloudflare Workers | Si se superan requests o CPU incluidos en Workers Paid | overages por requests y CPU según pricing vigente |
| Supabase Pro | Si se requiere más margen, backups, soporte o no depender de Free | desde $25/mes |
| Resend | Si aumentan correos transaccionales/campañas | según volumen y plan vigente |
| WhatsApp Business Platform/API | Cuando se envíen campañas, recordatorios o plantillas iniciadas por la iglesia | costo por mensaje entregado según país/categoría; bajo al inicio si el volumen es bajo |
| Google Maps / Gemini | Si aumenta el uso de mapas o IA | según consumo del proyecto Google Cloud |
| Procesador de pagos con tarjeta | Cuando se implementen diezmos/ofrendas/donaciones con tarjeta | comisión por transacción según proveedor |

### 8.3 Uso actual relevante

Con base en los datos revisados:

- Supabase Storage está alrededor de 626 MB usados, aproximadamente 60% del límite gratuito de 1 GB.
- El bucket más pesado es `event-posters`, con aproximadamente 385 MB.
- La base de datos de Supabase todavía tiene uso bajo en comparación con el límite gratuito.
- El uso actual de Vercel observado cabe dentro del rango esperado de Cloudflare Workers Paid.
- Las imágenes deben optimizarse antes de migrar para reducir almacenamiento, mejorar carga y disminuir tráfico.

---

## 9. Seguridad, continuidad y gobernanza

Para que el proyecto quede correctamente en manos de la iglesia, no basta con mover archivos o cambiar contraseñas. Se necesita una estructura mínima de gobierno.

Recomendaciones:

- definir al menos dos administradores institucionales;
- usar cuentas individuales, no cuentas compartidas;
- activar MFA en todos los servicios;
- usar un gestor de contraseñas institucional;
- documentar recuperación de cuentas;
- rotar llaves y secretos al terminar la migración;
- separar accesos de producción y desarrollo;
- proteger la rama principal del repositorio;
- mantener historial de cambios;
- conservar respaldos y documentación;
- documentar cómo retirar accesos si alguien deja de servir.

Principio operativo:

Ningún servicio crítico debe depender de una sola persona o de una cuenta personal.

---

## 10. Decisiones institucionales requeridas

Para continuar ordenadamente, se recomienda aprobar:

1. Que la plataforma pase formalmente a control institucional de Iglesia Alianza Puembo.
2. Que se designen al menos dos administradores institucionales.
3. Que se cree o use una cuenta institucional de Cloudflare para hosting, R2 y Turnstile.
4. Que se autorice el costo base esperado de Cloudflare Workers Paid: $5/mes.
5. Que se autorice Codex/ChatGPT Plus como herramienta de desarrollo activo mientras se mantenga evolución continua de la plataforma: $20/mes.
6. Que se evalúe WhatsApp Business Platform/API para campañas y recordatorios, considerando consentimiento, plantillas aprobadas, baja de contactos y costo variable por mensaje entregado.
7. Que se migren los buckets de archivos a Cloudflare R2.
8. Que se optimicen las imágenes existentes antes o durante la migración.
9. Que Supabase se mantenga para base de datos y autenticación bajo control institucional.
10. Que se roten llaves, secretos y accesos personales después de cada migración.
11. Que los procesos Proceso Eventos y Proceso Pagos continúen como líneas de automatización administrativa y financiera.
12. Que cualquier futuro sistema de pagos con tarjeta se abra directamente a nombre legal de la iglesia, con cuenta bancaria, correo, facturación y recuperación institucional.

---

## 11. Resultado esperado

Al completar esta institucionalización, la iglesia tendrá:

- una plataforma web/app bajo su control;
- menor dependencia de cuentas personales;
- costos bajos y previsibles;
- mejor almacenamiento para crecer;
- control de datos y accesos;
- continuidad técnica;
- base sólida para automatizar procesos financieros;
- capacidad de contratar o incorporar otro desarrollador si fuera necesario;
- una herramienta que no solo comunica, sino que también ayuda a administrar mejor.

La meta final es que la tecnología sirva a la misión de la iglesia: comunicar mejor, cuidar mejor, administrar con más orden y liberar tiempo del equipo para enfocarse en el ministerio.
