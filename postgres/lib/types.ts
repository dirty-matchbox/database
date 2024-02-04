export type PostgresDatabaseConfig = {
  type?: "postgress";
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
