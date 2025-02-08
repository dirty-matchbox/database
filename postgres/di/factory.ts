import PostgresDatabase from "../lib";
import { PostgresDatabaseInterface, type PostgresDatabaseConfig } from "../lib/types";
import { type PostgresDatabaseFactory } from "./types";

const postgresDatabaseFactory: PostgresDatabaseFactory =
  ({ config }: { config: PostgresDatabaseConfig }) =>
  () =>
  ({ logger }) => {
    const database = new PostgresDatabase({ config, logger });
    return database;
  };

export default postgresDatabaseFactory;
