import PostgresDatabase from "../lib";
import {
  PostgresDatabaseInterface,
  type PostgresDatabaseConfig,
} from "../lib/types";
import { type PostgresDatabaseFactory } from "./types";

const postgresDatabaseFactory =
  () =>{
  const create = ({ config }: { config: PostgresDatabaseConfig }) =>
  ({ logger }) =>
    new PostgresDatabase({ config, logger });
  return { create };
}
export default postgresDatabaseFactory;
