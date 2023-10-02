# copy-vs-insert

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run main.ts
```

## To compare the performance between COPY and INSERT

`bun run main-simple.ts`

## To compare the performance between (parallel) COPY and INSERT

`bun run main-with-workers.ts`

The "parallel" COPY version was made with worker threads, 20 workers are spawned, and they share the COPY transactions

## Building and running

If you want to build the Typescript code to JS, you can run:

`bun build --target=bun main-with-workers.ts --outfile=main-with-workers.js`

and then

`bun run main-with-workers.js`

The same applies to the version without threads:

`bun build --target=bun main-simple.ts --outfile=main-simple.js`

and then

`bun run main-simple.js`
