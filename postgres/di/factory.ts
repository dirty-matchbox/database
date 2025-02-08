import PostgresDatabase from "../lib";
import {
  PostgresDatabaseInterface,
  type PostgresDatabaseConfig,
} from "../lib/types";
import { type PostgresDatabaseFactory } from "./types";

const postgresDatabaseFactory: PostgresDatabaseFactory =
  () =>
  ({ config }: { config: PostgresDatabaseConfig }) =>
  ({ logger }) =>
    new PostgresDatabase({ config, logger });

export default postgresDatabaseFactory;
