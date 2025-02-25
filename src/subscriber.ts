import type { Notification as PgNotification } from 'pg';

import { PG_TOPIC_NAME } from './';
import type { Db, Job } from './types';
import { tryCatch } from './utils';

export class Subscriber {
  readonly db: Db;
  private jobs: Job[] = [];

  constructor(db: Db) {
    this.db = db;
  }

  public async start() {
    await this.db.query(`LISTEN ${PG_TOPIC_NAME}`);

    this.db.on('notification', (notification) =>
      this.handleNotification(notification)
    );
  }

  public async register(job: Job) {
    this.jobs.push(job);
  }

  private async handleNotification(notification: PgNotification) {
    const [, jobId] = notification?.payload?.split(':') ?? [];

    if (!jobId) {
      return;
    }

    const result = await tryCatch(
      this.db.query<{
        id: string;
        queue: string;
        state: string;
        name: string;
        payload: unknown;
        attempts: string;
        scheduled_at: string;
        finished_at: string;
      }>(
        `
        SELECT * FROM fila.jobs WHERE id = $1
      `,
        [jobId]
      )
    );

    if (!result.success) {
      return;
    }

    const job = result.data.rows[0];

    if (!job) {
      return;
    }

    const jobDefinition = this.jobs.find((j) => j.name === job.name);

    if (!jobDefinition) {
      return;
    }

    await jobDefinition.execute(job.payload);
  }
}
