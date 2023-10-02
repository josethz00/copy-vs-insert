import { parentPort } from 'worker_threads';
import { Client } from 'pg';
import { pipeline } from 'node:stream/promises';
import { from as copyFrom } from 'pg-copy-streams';
import fs from 'fs';

const pgConn = new Client({
  database: "copy-insert-db",
  host: "localhost",
  user: "copy-insert-db",
  password: "copy-insert-db",
  port: 6472
});

parentPort?.on('message', async (filename) => {
  await pgConn.connect();
  try {
    const fileStream = fs.createReadStream(filename);
    const copyPsqlStream = pgConn.query(copyFrom(`COPY test_table (data, time_added) FROM STDIN WITH (FORMAT CSV)`));
    await pipeline(fileStream, copyPsqlStream);
    parentPort?.postMessage('done');
  } catch (err) {
    console.log(err)
    parentPort?.postMessage(`Error: ${err}`);
  }
});