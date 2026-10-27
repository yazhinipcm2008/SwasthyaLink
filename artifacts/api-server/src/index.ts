import app from "./app";
import { logger } from "./lib/logger";
import { seedInitialData } from "./lib/seed";

const rawPort = process.env["PORT"] || '5000';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  try {
    await seedInitialData();
  } catch (err) {
    logger.error({ err }, "Failed during seedInitialData");
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});

