import PostgresDatabase from "../lib";
import { PostgresDatabaseConfig } from "../lib/types";

export interface PostgresDatabaseFactory {
  register: ({
    config,
  }: {
    config: PostgresDatabaseConfig;
  }) => PostgresDatabase;
}

export interface PostgresDatabaseInjections {
  postgresDatabaseFactory: PostgresDatabaseFactory;
}
