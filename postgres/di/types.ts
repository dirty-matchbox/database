import PostgresDatabase from "../lib";
import { PostgresDatabaseConfig, PostgresDatabaseInterface } from "../lib/types";

export type PostgresDatabaseFactory = ({
  config,
}: {
  config: PostgresDatabaseConfig;
}) => () => ({ logger }) => PostgresDatabaseInterface;

export interface PostgresDatabaseInjections {
  postgresDatabaseFactory: PostgresDatabaseFactory;
}
