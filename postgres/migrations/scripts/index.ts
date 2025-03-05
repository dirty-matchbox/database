#!/usr/bin/env ts-node
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import PostgresDatabaseMigration from "../PostgresDatabaseMigration";
import { PostgresDatabaseConfig } from "../../lib/types";
import { PostgresDatabaseMigrationItem } from "../types";

type Argv = { [key: string]: any };

type MigrationMode = "up" | "down" | "syncAll";
const VALID_MIGRATION_MODES: MigrationMode[] = ["up", "down", "syncAll"];

const argv = yargs(hideBin(process.argv))
  .command("init", "Initial migration script", (inner: typeof yargs) => {
    return inner
      .option("path", {
        demandOption: true,
        alias: "p",
        type: "string",
        description: `Set the path to the migration folder.`,
      })
      .option("database", {
        demandOption: true,
        alias: "d",
        type: "string",
        description: "Name of database",
      });
  })
  .command("migrate", "Migration script", (inner: typeof yargs) => {
    return inner
      .option("mode", {
        alias: "m",
        type: "string",
        description: `Set the mode (${VALID_MIGRATION_MODES.join(", ")})`,
        demandOption: true,
      })
      .check((argv) => {
        const mode = argv.mode;
        return mode && VALID_MIGRATION_MODES.includes(mode);
      })
      .option("path", {
        alias: "p",
        type: "string",
        description: `Set the path to the migration folder.`,
        demandOption: true,
      })
      .option("database", {
        alias: "d",
        type: "string",
        description: "Name of database",
        demandOption: true,
      })
      .option("config", {
        alias: "c",
        type: "string",
        description: "Config file name",
        demandOption: false,
        default: "config",
      });
  })
  .command("make", "Create migration file", (inner: typeof yargs) => {
    return inner
      .option("title", {
        alias: "t",
        type: "string",
        description: "Title of migration file",
        demandOption: true,
      })
      .option("path", {
        alias: "p",
        type: "string",
        description: `Set the path to the migration folder.`,
        demandOption: true,
      })
      .option("database", {
        alias: "d",
        type: "string",
        description: "Name of database",
        demandOption: true,
      });
  })
  .help().argv;

const command = argv._[0];

const getOption = <T = string>(option: string): T => {
  const value = argv[option] as T;
  if (!value) {
    throw new Error(`Option ${option} is required. Use --help for usage.`);
  }
  return value;
};
const fileNamePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z+_[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/;
const matchesFileNamePattern = (string: string) => fileNamePattern.test(string);

const getMigrations = async (path: string) => {
  const fileNames = fs.readdirSync(path);
  const migrations: PostgresDatabaseMigrationItem[] = [];
  for (const fileName of fileNames) {
    if (matchesFileNamePattern(fileName)) {
      const migration = require(`${process.cwd()}/${path}/${fileName}`).default;
      migrations.push(migration);
    }
  }
  return migrations;
};

const handleMigrate = async () => {
  const mode = getOption<MigrationMode>("mode");
  const path = getOption("path");
  const database = getOption("database");
  const configPath = getOption("config");
  const migrationsPath = `${path}/${database}`;
  const config = (
    await import(`${process.cwd()}/${migrationsPath}/${configPath}.ts`)
  ).default as PostgresDatabaseConfig;
  const migrations = await getMigrations(migrationsPath);
  const migrationHandler = new PostgresDatabaseMigration({
    config,
    migrations,
  });
  await migrationHandler.init();
  await migrationHandler[mode]();
  await migrationHandler.finish();
};

const toCamelCase = (string: string) =>
  string
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");

const createFileName = (name: string) => {
  const date = new Date();
  const prefix = date.toISOString();
  const suffix = toCamelCase(name);
  return prefix + "_" + suffix;
};

const createInitialDatabaseConfigTemplate = ({
  database,
}: {
  database: string;
}) => `
const config = {
  version: "0.0.1",
  type: "postgres",
  host: "localhost", // Read from env,
  name: "${database}", // Read from env
  port: 5432, // Read from env
  username: "username", // Read from env
  password: "password", // Read from env
};

export default config;
`;

const handleInit = async () => {
  const path = getOption("path");
  const database = getOption("database");
  const databasePath = `${path}/${database}`;
  const databaseConfigPath = `${databasePath}/config.ts`;
  if (!fs.existsSync(path)) {
    await fs.mkdirSync(path);
  }
  if (!fs.existsSync(databasePath)) {
    await fs.mkdirSync(databasePath);
  }
  await fs.writeFileSync(
    databaseConfigPath,
    createInitialDatabaseConfigTemplate({ database }),
    { flag: "w" }
  );
};

const createMigrationScriptTemplate = ({ title }: { title: string }) => `
const migration = {
  title: "${title}",
  up: {
    query: {
      raw: "--insert-up-query--",
    },
  },
  down: {
    query: {
      raw: "--insert-down-query--",
    },
  },
};

export default migration;
`;

const handleMake = async () => {
  const path = getOption("path");
  const database = getOption("database");
  const databasePath = `${path}/${database}`;
  const title = getOption("title");
  const fileName = createFileName(title);
  const databaseConfigPath = `${databasePath}/${fileName}.ts`;
  if (!fs.existsSync(databasePath)) {
    await fs.mkdirSync(databasePath);
  }
  await fs.writeFileSync(
    databaseConfigPath,
    createMigrationScriptTemplate({ title: fileName }),
    { flag: "w" }
  );
};

switch (command) {
  case "init":
    handleInit();
    break;
  case "make":
    handleMake();
    break;
  case "migrate":
    handleMigrate();
    break;
  default:
    console.log("Unknown command. Use --help for usage.");
}
