export type PostgresDatabaseConfig = {
  type?: "postgres";
  version?: number;
  port: number;
  name: string;
  host: string;
  username: string;
  password: string;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
  allowExitOnIdle?: boolean;
};
