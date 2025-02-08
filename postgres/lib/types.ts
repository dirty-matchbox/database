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


export type PostgresDatabaseInterface = {
  init: () => Promise<void>;
  disconnect(): void;
  query<Result>({ raw, values }: { raw: string; values?: any[] }): Promise<{
    rows: Result[];
    count: number;
  }>;
  healthCheck: () => Promise<void>;
};
