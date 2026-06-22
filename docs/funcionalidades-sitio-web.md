# Funcionalidades del sitio web de Alianza Puembo

Documento para presentación a los diáconos

Presentado por: Alejandro Zambrano

Fecha: 17 de junio de 2026

## Propósito general

El sitio web de Alianza Puembo centraliza la presencia digital de la iglesia y reduce trabajo operativo manual. Permite informar a la comunidad, publicar eventos y noticias, recibir peticiones, administrar inscripciones, dar seguimiento a pagos y organizar comunicaciones desde un solo panel administrativo.

## Funcionalidades actuales

### Sitio público

- Página principal con información de la iglesia, accesos rápidos, ubicación y enlaces principales.
- Secciones de Conócenos, Equipo, Creencias, Involúcrate, Ministerios, Noticias, Recursos, Donaciones, Oración y Contacto.
- Calendario de eventos, listado de próximos eventos y páginas individuales para cada actividad.
- Recursos LOM: publicaciones devocionales para lectura, oración y meditación.
- Formularios públicos para contacto, peticiones de oración, registros e inscripciones.
- Página de donaciones con información bancaria para ofrendas, diezmos y aportes.

### Panel administrativo

- Acceso protegido por usuarios y permisos.
- Gestión de eventos, noticias, LOM, formularios, comunidad, comunicaciones, finanzas y procesos internos del staff.
- Papelera, restauración, búsqueda, filtros y ordenamiento en las áreas principales.
- Notificaciones internas en el panel y notificaciones por correo según permisos o suscripciones de administradores.

### Formularios e inscripciones

- Constructor dinámico de formularios con campos de texto, número, email, fecha, opciones, selección múltiple, párrafo, imagen, archivo y secciones.
- Vista previa, límite de cupos, formularios públicos e internos, enlaces compartibles y enlaces cortos útiles para WhatsApp o material impreso.
- Inscripciones con seguimiento privado por enlace, donde la persona puede consultar su estado y subir comprobantes adicionales.
- Formularios financieros con monto fijo o paquetes de precios, pagos únicos o por cuotas, comprobantes compartidos y cuenta bancaria de destino.
- Delegación de respuestas: ciertos usuarios pueden revisar respuestas de formularios específicos sin recibir acceso completo al panel.

### Finanzas

- Registro y revisión de comprobantes de pago enviados por formularios.
- Conciliación bancaria: carga de extractos en Excel/CSV y comparación contra pagos reportados.
- Uso de IA para ayudar a interpretar extractos y datos de comprobantes, reduciendo revisión manual.
- Manejo de pagos verificados, pendientes, rechazados, compartidos, en efectivo o registrados manualmente.
- Reportes, analíticas y exportaciones para seguimiento de inscripciones e ingresos.
- Recordatorios de pago por correo para inscripciones con saldo pendiente, según la frecuencia configurada en cada formulario.

### Comunicaciones

- Campañas de correo asociadas a formularios, con destinatarios basados en inscripciones, exclusiones manuales, adjuntos, pruebas, envíos y programación.
- Confirmaciones automáticas por correo cuando una persona completa una inscripción.
- Gestión de contactos, audiencias y consentimientos para comunicaciones.
- Notificaciones de WhatsApp para eventos en desarrollo: ya existe captación de interesados desde la página del evento, manejo de audiencias, borradores generados con Gemini, aprobación de mensajes, programación y registro de entregas. Falta terminar la configuración final del proveedor/plantillas de WhatsApp y cerrar pruebas de envío en producción.

### Comunidad y procesos internos

- Bandeja de mensajes de contacto con estados de lectura/respuesta y opción de contestar.
- Moderación de peticiones de oración para atenderlas y controlar su visibilidad.
- Formularios internos para procesos operativos del staff, separados de los formularios públicos.

## Procesos automatizados

- Publicación de contenido desde el panel hacia el sitio público.
- Recepción ordenada de mensajes, peticiones, formularios e inscripciones.
- Envío de correos de confirmación, seguimiento y campañas.
- Seguimiento de saldos pendientes y recordatorios de pago.
- Generación de enlaces privados para que cada persona revise su inscripción.
- Validación y conciliación asistida de comprobantes y extractos bancarios.
- Control de permisos, delegación de acceso y trazabilidad de acciones administrativas.
- Captación de contactos y consentimientos para futuras comunicaciones por WhatsApp.

## Mejoras logradas

- Menos dependencia de hojas de cálculo, mensajes sueltos y procesos manuales.
- Mejor experiencia para la comunidad: información clara, formularios accesibles, enlaces de seguimiento y confirmaciones automáticas.
- Mayor control financiero: estados de pago, conciliación, reportes y auditoría de comprobantes.
- Mejor organización interna: permisos por área, panel único y procesos separados para staff.
- Mayor capacidad de comunicación: campañas por correo, audiencias y base para recordatorios por WhatsApp.

## Planes a futuro

- Finalizar las notificaciones de WhatsApp para eventos: plantillas aprobadas, proveedor configurado, pruebas de envío, manejo de errores y reportes de entrega.
- Implementar pagos de ofrendas, diezmos y donaciones con tarjeta de crédito/débito desde la página de Donaciones.
- Integrar esos pagos en los reportes financieros para que transferencias, comprobantes y pagos con tarjeta convivan en un mismo flujo.
- Automatizar recibos o confirmaciones para donaciones realizadas en línea.
- Trabajar en campañas de compromiso de ofrendas.
- Seguir mejorando los procesos internos del staff con formularios, estados y reportes específicos.
