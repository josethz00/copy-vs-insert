import { Client } from 'pg';
import fs from 'fs';
import { from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';

const client = new Client({
    host: 'localhost',
    port: 6472,
    user: 'copy-insert-db',
    password: 'copy-insert-db',
    database: 'copy-insert-db'
});

const numRecords = 100000;
const data = Array.from({ length: numRecords }, (_, i) => [`data_${i}`, new Date()]);

async function measureInsert() {
    const insertQuery = `
        INSERT INTO test_table (data, timestamp) VALUES 
        ${data.map(() => '(($1, $2))').join(',')}
    `;

    const startTime = Date.now();
    await client.query(insertQuery, data.flat());
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Multi-line INSERT took: ${duration} seconds`);
}

async function measureCopy() {
    const writableStream = fs.createWriteStream("data.csv");

    writableStream.on("finish", async () => {
        const startTime = Date.now();
        const stream = fs.createReadStream("data.csv");
        const copyPsqlStream = client.query(copyFrom('COPY test_table (data, timestamp) FROM STDIN CSV'));
        await pipeline(stream, copyPsqlStream);
        const duration = (Date.now() - startTime) / 1000;
        console.log(`COPY took: ${duration} seconds`);
    });

    data.forEach(d => writableStream.write(d.join(',') + '\n'));
    writableStream.end();
}

async function main() {
    await client.connect();

    await measureInsert();
    await measureCopy();

    await client.end();
}

main();
