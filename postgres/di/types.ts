import {
  PostgresDatabaseConfig,
  PostgresDatabaseInterface,
} from "../lib/types";

export type PostgresDatabaseFactory = () => {
  create: ({
    config,
  }: {
    config: PostgresDatabaseConfig;
  }) => ({ logger }) => PostgresDatabaseInterface;
};
export interface PostgresDatabaseInjections {
  postgresDatabaseFactory: PostgresDatabaseFactory;
}
