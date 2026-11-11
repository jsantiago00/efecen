-- efecen-push: suscripciones de Web Push y las horas en que hay que despertarlas.
-- id es el SHA-256 de la dirección de la suscripción. No se guarda ningún dato de la cuenta ni el texto de los avisos.
CREATE TABLE IF NOT EXISTS subs (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  updated INTEGER NOT NULL,            -- última vez que la app la renovó (s epoch)
  fails INTEGER NOT NULL DEFAULT 0,    -- envíos fallidos seguidos
  tested INTEGER NOT NULL DEFAULT 0    -- último push de prueba (s epoch)
);
CREATE TABLE IF NOT EXISTS due (
  sub TEXT NOT NULL,
  at INTEGER NOT NULL,                 -- cuándo despertarla (s epoch, al minuto)
  PRIMARY KEY (sub, at)
);
CREATE INDEX IF NOT EXISTS due_at ON due (at);
