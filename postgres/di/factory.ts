import PostgresDatabase from "../lib";
import { type PostgresDatabaseConfig } from "../lib/types";
import { type PostgresDatabaseFactory } from "./types";

//  NOTE: always register as Lifetime.SINGLETON
const postgresDatabaseFactory = ({ logger }): PostgresDatabaseFactory => {
  const register = ({
    config,
  }: {
    config: PostgresDatabaseConfig;
  }): PostgresDatabase => {
    const database = new PostgresDatabase({ config, logger });
    return database;
  };
  return { register };
};

export default postgresDatabaseFactory;
