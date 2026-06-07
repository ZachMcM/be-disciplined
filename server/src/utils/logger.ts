import Logger from "node-json-logger";

// @ts-ignore - node-json-logger has loose types
export const logger = new Logger({ level: process.env.LOGGER_LEVEL });
