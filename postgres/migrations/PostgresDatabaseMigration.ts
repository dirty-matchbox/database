import PostgresDatabase from "../lib";
import {
  PostgresDatabaseConfig,
  PostgresDatabaseInterface,
} from "../lib/types";
import {
  PostgresDatabaseMigrationItem,
  PostgresDatabaseMigrationInterface,
  MigrationEntry,
} from "./types";

class PostgresDatabaseMigration implements PostgresDatabaseMigrationInterface {
  private postgresDatabase: PostgresDatabaseInterface;
  private config: PostgresDatabaseConfig;
  private logger: typeof console;
  private migrations: PostgresDatabaseMigrationItem[] = [];
  constructor({
    config,
    logger = console,
    migrations = [],
  }: {
    config: PostgresDatabaseConfig;
    logger?: typeof console;
    migrations: PostgresDatabaseMigrationItem[];
  }) {
    try {
      this.logger = logger;
      this.config = config;
      this.migrations = migrations;
      if (!this.migrations) {
        throw new Error(
          "No migrations created for " +
            this.config.name +
            ". Please check migration scripts"
        );
      }
      this.postgresDatabase = new PostgresDatabase({ config, logger });
    } catch (error) {
      console.log(error);
      console.log(this.logger);
      this.logger.error(
        `Failed start Migration instance ${this.config.name}`,
        error
      );
      throw error;
    }
  }

  async init() {
    try {
      if (!this.migrations) {
        throw new Error(
          "No migrations directory specified for " + this.config.name
        );
      }
      await this.postgresDatabase.init();
      await this.postgresDatabase.healthCheck();

      await this.createMigrationTableIfNotExists();
    } catch (error) {
      this.logger.error(
        `Failed start Migration instance ${this.config.name}`,
        error
      );
      throw error;
    }
  }

  async finish() {
    await this.postgresDatabase.disconnect();
  }

  createMigrationTableIfNotExists = async () => {
    await this.postgresDatabase.query({
      raw: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY, 
        title TEXT NOT NULL, 
        description TEXT, 
        "createdAt" TIMESTAMP DEFAULT NOW(), 
        pointer BOOLEAN DEFAULT false);
        `,
    });
  };

  private createDescription = (title: string) => {
    const result = title.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  private async getEntries() {
    const { rows: entries } = await this.postgresDatabase.query<MigrationEntry>(
      {
        raw: "SELECT * FROM migrations;",
      }
    );
    return this.sort(entries, "title");
  }

  private sort<T>(items: T[], field: string) {
    return items.sort((a, b) => a[field].localeCompare(b[field]));
  }

  private addMigrationEntry = async (
    migration: PostgresDatabaseMigrationItem
  ) => {
    const values = [
      migration.title,
      migration.title.split("_")[0],
      this.createDescription(migration.title.split("_")[1]),
    ];
    console.log("ENTRY", migration, values);
    await this.postgresDatabase.query({
      raw: `INSERT INTO migrations (title, "createdAt", description) VALUES ($1, $2, $3);`,
      values,
    });
  };

  private updateDatabaseMigrations = async () => {
    const entries = await this.getEntries();
    // order migrations by title
    const sortedMigrations = this.sort(this.migrations, "title");
    // order entries by title
    const sortedEntries = this.sort(entries, "title");
    // check if there is any missing migration
    for (let i = 0; i < sortedMigrations.length; i++) {
      const migration = sortedMigrations[i];
      const entry = sortedEntries.find(
        (entry) => entry.title === migration.title
      );
      if (!entry) {
        await this.addMigrationEntry(migration);
      }
    }
  };

  getMigration = (title: string) => {
    console.log("SEARCH", title, this.migrations);
    return this.migrations.find((migration) => migration.title === title);
  };

  async setTableMarker(name) {
    await this.postgresDatabase.query({
      raw: `
      UPDATE migrations SET pointer = false;
      `,
    });

    await this.postgresDatabase.query({
      raw: `UPDATE migrations SET pointer = true WHERE title = $1;`,
      values: [name],
    });
  }

  public async up() {
    console.log("UP", this.config);
    await this.postgresDatabase.transaction(async (query) => {
      await this.updateDatabaseMigrations();
      const entries = await this.getEntries();
      if (!entries.length) {
        throw new Error("No migration entries found");
      }
      const currentIndex = entries.findIndex((entry) => entry.pointer);
      const current = entries[currentIndex];

      if (!current) {
        console.log("ENTRIES", entries);
        const firstEntry = entries[0];
        const firstMigration = this.getMigration(firstEntry.title);
        if (!firstMigration) {
          throw new Error("No migration found for entry " + firstEntry.title);
        }
        await query(firstMigration.up.query);
        await this.setTableMarker(firstEntry.title);
      } else {
        if (entries.length <= currentIndex + 1) {
          this.logger.info("All migrations are up to date");
          return;
        } else {
          const upperEntry = entries[currentIndex + 1];
          const upperMigration = this.getMigration(upperEntry.title);
          if (!upperMigration) {
            throw new Error("No migration found for entry " + upperEntry.title);
          }
          await query(upperMigration.up.query);
          await this.setTableMarker(upperEntry.title);
        }
      }
    });
  }

  public async down() {
    await this.postgresDatabase.transaction(async (query) => {
      await this.updateDatabaseMigrations();
      const entries = await this.getEntries();
      if (!entries.length) {
        throw new Error("No migration entries found");
      }
      const currentIndex = entries.findIndex((entry) => entry.pointer);
      const current = entries[currentIndex];
      if (!current) {
        throw new Error("No pointer on any migration entry");
      } else {
        if (currentIndex === 0) {
          this.logger.info("All migrations are down to date");
          return;
        } else {
          const lowerEntry = entries[currentIndex - 1];
          const currentMigration = this.getMigration(current.title);
          if (!currentMigration) {
            throw new Error("No migration found for entry " + lowerEntry.title);
          }
          await query(currentMigration.down.query);
          await this.setTableMarker(lowerEntry.title);
        }
      }
    });
  }

  public async syncAll() {
    await this.postgresDatabase.transaction(async (query) => {
      await this.updateDatabaseMigrations();
      const entries = await this.getEntries();
      const sortedMigrations = this.sort(this.migrations, "title");
      const indexOfCurrent = entries.findIndex((entry) => entry.pointer);
      const timesToGoUp = this.migrations.length - indexOfCurrent;
      for (let i = 0; i < timesToGoUp; i++) {
        await this.up();
      }
    });
  }
}

export default PostgresDatabaseMigration;
