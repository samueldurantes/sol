CREATE SCHEMA fila;

CREATE TYPE fila.job_status AS ENUM (
    'available',
    'processing',
    'successful',
    -- TODO: Add `failed` in the future.
    'cancelled'
);

CREATE TABLE fila.jobs (
    "id" UUID PRIMARY KEY,
    "queue" TEXT NOT NULL,
    "status" fila.job_status NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB,
    "attempts" SMALLINT,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "finished_at" TIMESTAMPTZ
);

COMMENT ON COLUMN fila.jobs.attempts IS
    'The number of finished executions, including the successful one, if any';

CREATE INDEX jobs_queue_status_idx
    ON fila.jobs ("queue", "status");

CREATE TABLE fila.failures (
    "id" UUID PRIMARY KEY,
    "job_id" UUID REFERENCES fila.jobs,
    "data" JSONB,
    "attempt" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL
);
