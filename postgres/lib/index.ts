import { PostgresDatabaseConfig } from "./types";
import { Pool } from "pg";

//  TODO: add to README.md https://node-postgres.com/apis/pool
const HEALTH_CHECK_QUERY = "SELECT NOW();";

class PostgresDatabase {
  pool: Pool | undefined = undefined;
  logger = console;
  config: PostgresDatabaseConfig;
  constructor({
    config,
    logger = console,
  }: {
    config: PostgresDatabaseConfig;
    logger: typeof console;
  }) {
    this.logger = logger;
    this.config = config;
  }
  async init() {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.name,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        max: this.config.max,
        allowExitOnIdle: this.config.allowExitOnIdle,
      });
      this.pool.on("connect", () =>
        this.logger.info(
          `Postgress Database ${this.config.name} successfully connected`
        )
      );
      this.pool.on("error", (error) =>
        this.logger.info(
          `Postgress Database ${this.config.name} failed to connect`,
          error
        )
      );
      await this.healthCheck();
    } catch (error) {
      this.logger.error(
        `Failed to initialize Postgres Database ${this.config.name}`,
        error
      );
      throw error;
    }
  }

  async query<Result>({ raw, values }: { raw: string; values?: any[] }) {
    try {
      const client = await this.pool.connect();
      const result = await client.query<Result>(raw, values);
      await client.release();
      return result;
    } catch (error) {
      this.logger.error("Cannot run query", raw);
    }
  }

  healthCheck = async () => {
    this.query({ raw: HEALTH_CHECK_QUERY });
  };
}

export default PostgresDatabase;
