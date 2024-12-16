import PostgresDatabase from "../lib";
import { PostgresDatabaseConfig } from "../lib/types";

export type PostgresDatabaseFactory = ({
  config,
}: {
  config: PostgresDatabaseConfig;
}) => ({ logger }) => PostgresDatabase;

export interface PostgresDatabaseInjections {
  postgresDatabaseFactory: PostgresDatabaseFactory;
}
