import { v7 as uuidv7 } from 'uuid';

import { PG_TOPIC_NAME } from './';
import type { JobPayload, Db } from './types';
import { tryCatch, type Result } from './utils';

type SendResult = Result<{ jobId: string }, string>;

export const send = async (job: JobPayload, db: Db): Promise<SendResult> => {
  // TODO: Maybe the user be able to set your own id.
  let id = uuidv7();

  const result = await tryCatch(
    db.query(
      `
      WITH insert AS (
        INSERT INTO fila.jobs
          (id, queue, name, payload, attempts, state, scheduled_at)
        VALUES ($1, $2, $3, $4::JSONB, $5, 'available', now())
      )
      SELECT pg_notify($6, 'j:' || $1);
    `,
      [id, job.queue, job.name, job.payload, job.attempts, PG_TOPIC_NAME]
    )
  );

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error.message,
    };
  }

  return {
    success: true,
    data: {
      jobId: id,
    },
    error: null,
  };
};
