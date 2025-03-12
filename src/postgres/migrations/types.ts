import { PostgresDatabaseQuery } from "../lib/types";

export type PostgresDatabaseMigrationInterface = {
  init: () => Promise<void>;
  up(): void;
  down(): void;
};

export type PostgresDatabaseMigrationItemStep = {
  query: PostgresDatabaseQuery;
};

export type PostgresDatabaseMigrationItem = {
  title: string;
  up: PostgresDatabaseMigrationItemStep;
  down: PostgresDatabaseMigrationItemStep;
};

export type MigrationEntry = {
  id: string;
  title: string;
  createdAt: string;
  pointer: boolean;
}