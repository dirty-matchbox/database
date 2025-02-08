import { PostgresDatabaseConfig, PostgresDatabaseInterface } from "./types";
import { Pool, PoolClient } from "pg";

const HEALTH_CHECK_QUERY = "SELECT NOW();";

class PostgresDatabase implements PostgresDatabaseInterface {
  private pool: Pool | undefined = undefined;
  private logger = console;
  private config: PostgresDatabaseConfig;
  private client: PoolClient;
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
      this.addListeners();
      this.client = await this.pool.connect();
    } catch (error) {
      this.logger.error(
        `Failed to initialize Postgres Database ${this.config.name}`,
        error
      );
    }
  }

  private addListeners() {
    this.pool.on("connect", () => {
      this.logger.info(
        `Postgres Database ${this.config.name} successfully connected`
      );
    });
    this.pool.on("release", () => {
      this.logger.info(
        `Postgres Database ${this.config.name} connection release`
      );
    });
    this.pool.on("error", (error) => {
      this.logger.info(`Postgres Database ${this.config.name} error`, error);
    });
  }

  disconnect() {
    try {
      if (this.client) {
        this.client.release();
      }
      if (this.pool) {
        this.pool.end();
      }
    } catch (error) {
      this.logger.error("Cannot close connections", error);
    }
  }

  async query<Result>({ raw, values }: { raw: string; values?: any[] }) {
    try {
      if (!this.client) {
        throw new Error("Client is not initialized");
      }
      const result = await this?.client.query<Result>(raw, values);
      return { rows: result.rows, count: result.rowCount };
    } catch (error) {
      this.logger.error("Cannot run query", raw);
      throw error;
    }
  }

  healthCheck = async () => {
    await this.query({ raw: HEALTH_CHECK_QUERY });
    console.info("Health check passed at ", new Date().toISOString());
  };
}

export default PostgresDatabase;
