# Cron externo para campañas de correo

Las campañas de correo programadas necesitan ejecutarse con más frecuencia que una vez al día. En Vercel Hobby el cron diario es suficiente para recordatorios de pago, pero no para envíos programados por hora/minuto.

Configurar en cron-job.org:

- URL: `https://<dominio-produccion>/api/cron/form-email-campaigns`
- Método: `GET`
- Frecuencia sugerida: cada 5 o 15 minutos
- Header: `Authorization: Bearer <CRON_SECRET>`
- Timeout: 30 segundos o más

El mismo endpoint también acepta `x-cron-secret: <CRON_SECRET>` si el proveedor no permite configurar el header `Authorization`.

Mantener `CRON_SECRET` sincronizado con la variable de entorno de producción. El endpoint procesa campañas con `status = scheduled` y `scheduled_at <= now`, así que es seguro ejecutarlo varias veces por hora.
