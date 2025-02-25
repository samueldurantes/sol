import pg from 'pg';

import fila, { Job, JobPayload } from './src';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const job: Job = {
    name: 'my-job',

    execute: async (payload) => {
      console.log('payload', payload);
    },
  };

  const pool = new pg.Client({
    connectionString: 'postgresql://fila-js:fila-js-admin@localhost/postgres',
  });

  await pool.connect();

  const subscriber = new fila.Subscriber(pool);

  subscriber.register(job);
  await subscriber.start();

  const payload: JobPayload = {
    name: 'my-job',
    queue: 'default',
    payload: {
      hello: 'world',
    },
    attempts: 2,
  };

  await fila.send(payload, pool);
})();
