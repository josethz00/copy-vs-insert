import { Worker } from 'worker_threads';
import path from 'path';

export function runWorker(prefix: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'worker.ts'));
        worker.postMessage(`out_${prefix}`);
        
        worker.on('message', (message) => {
            if (message === 'done') {
                resolve();
            } else if (message.startsWith('Error:')) {
                reject(new Error(message));
            }
        });
        
        worker.on('error', (error) => {
            reject(error);
        });
    });
}