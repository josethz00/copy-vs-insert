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
    const chunkSize = 1000;
    const startTime = Date.now();

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const placeholders = chunk.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(',');
        const values = chunk.flat();

        const insertQuery = `
            INSERT INTO test_table (data, time_added) VALUES ${placeholders}
        `;

        await client.query(insertQuery, values);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Multi-line INSERT took: ${duration} seconds`);
}


async function measureCopy() {
    return new Promise<void>((resolve, reject) => {
        const writableStream = fs.createWriteStream("data.csv");

        writableStream.on("finish", async () => {
            try {
                const startTime = Date.now();
                const stream = fs.createReadStream("data.csv");
                const copyPsqlStream = client.query(copyFrom('COPY test_table (data, time_added) FROM STDIN WITH (FORMAT CSV)'));
                await pipeline(stream, copyPsqlStream);
                const duration = (Date.now() - startTime) / 1000;
                console.log(`COPY took: ${duration} seconds`);
                resolve();
            } catch (err) {
                reject(err);
            }
        });

        data.forEach(d => writableStream.write(d.join(',') + '\n'));
        writableStream.end();
    });
}

async function main() {
    await client.connect();

    await measureInsert();
    await measureCopy();

    await client.end();
}

main();
