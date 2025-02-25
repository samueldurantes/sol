import pg from 'pg';

export type Db = pg.Client;

type Payload = unknown;

export type JobPayload = {
  name: string;
  queue: string;
  payload: Payload;
  attempts: number;
};

export type Job = {
  name: string;

  execute: (payload: Payload) => Promise<void>;
};
