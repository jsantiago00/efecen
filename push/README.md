# efecen-push

Servicio que despierta a la app instalada a la hora de cada aviso. Es un Worker de Cloudflare con una base D1 y un cron que corre cada minuto. Está publicado en `https://push.efecen.com.ar` (y en `https://efecen-push.acordes.workers.dev`).

## Cómo funciona

1. Al activar los avisos, la app crea una suscripción de Web Push con la clave pública VAPID y le manda al servicio la dirección de esa suscripción y las horas de sus próximos avisos (`POST /subscribe`).
2. Cada minuto, el cron busca las horas que vencen y manda a cada suscripción un push **sin contenido**, firmado con la clave privada VAPID.
3. El service worker de la app recibe el push y arma la notificación con la lista que la app dejó guardada en el dispositivo (caché `efecen-avisos`).

El servicio no guarda el texto de los avisos, ni cuentas, ni claves de cifrado. Guarda la dirección de cada suscripción y las horas.

## Archivos

| Archivo | Qué es |
|---|---|
| `worker.js` | El Worker: la API, el envío con VAPID y el cron. |
| `schema.sql` | Las tablas de D1 (`subs` y `due`). |
| `wrangler.toml` | Configuración: dominio, cron, base y clave pública. |
| `test.mjs` | Tests contra una base SQLite en memoria y un servicio de push falso. |

## Comandos

Se corren desde esta carpeta, con `npx wrangler login` hecho en la cuenta de Cloudflare de efecen.com.ar.

```sh
node --no-warnings push/test.mjs                              # tests (desde la raíz del repo)
npx wrangler deploy                                           # publicar cambios
npx wrangler tail                                             # registros en vivo
npx wrangler d1 execute efecen-push --remote --command "SELECT COUNT(*) FROM subs"   # cuántos dispositivos hay
npx wrangler d1 execute efecen-push --remote --file schema.sql --yes                 # crear las tablas (ya está hecho)
```

## Claves

- **Pública (`VAPID_PUBLIC`):** está en `wrangler.toml` y en `index.html` (`PUSH.key`). Tienen que coincidir.
- **Privada (`VAPID_PRIVATE_JWK`):** es un secreto del Worker y no está en ningún archivo. Si se pierde o se filtra, hay que generar un par nuevo, cargar la privada con `npx wrangler secret put VAPID_PRIVATE_JWK` y cambiar la pública en los dos lugares. Cada dispositivo se vuelve a suscribir solo la próxima vez que abre la app.

## Límites y decisiones

- **Puntualidad.** Cloudflare corre el cron en cualquier momento del minuto, así que el Worker manda lo que vence en los próximos 45 s (`LIMITS.early`). El service worker acepta un aviso hasta 60 s antes de su hora. En la práctica llega dentro de los pocos segundos de la hora pedida.
- **Reintentos.** Si el servicio de push falla, se reintenta cada minuto. Un aviso con más de 6 h de atraso se descarta.
- **Bajas.** Si el servicio de push responde 404 o 410, la suscripción se borra. Las que no se renuevan en 120 días también.
- **Abuso.** Solo se aceptan pedidos de los orígenes de la app y direcciones de los servicios de push de los navegadores (Google, Mozilla, Microsoft y Apple). Hay topes de tamaño, de horas por suscripción y de frecuencia de las pruebas.
- **Costo.** Entra en el plan gratuito de Cloudflare: 1.440 corridas del cron por día y hasta 40 envíos por corrida (el plan permite 50 pedidos salientes por invocación). Si alguna vez hubiera más de 40 avisos en el mismo minuto, los que sobran salen al minuto siguiente.
