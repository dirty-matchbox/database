import PostgresDatabase from "../lib";
import { type PostgresDatabaseConfig } from "../lib/types";
import { type PostgresDatabaseFactory } from "./types";

const postgresDatabaseFactory: PostgresDatabaseFactory =
  ({ config }: { config: PostgresDatabaseConfig }) =>
  ({ logger }): PostgresDatabase => {
    const database = new PostgresDatabase({ config, logger });
    return database;
  };

export default postgresDatabaseFactory;
