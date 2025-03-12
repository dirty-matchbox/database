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
  migrations?: {
    directory: string;
  };
};

export type PostgresDatabaseQuery = {
  raw: string;
  values?: any[];
};

type PostgresDatabaseQueryResult<Result> = {
  rows: Result[];
  count: number;
};

export type QueryFunction = <Result>(
  query: PostgresDatabaseQuery
) => Promise<PostgresDatabaseQueryResult<Result>>;

export type PostgresDatabaseInterface = {
  init: () => Promise<void>;
  disconnect(): void;
  query: QueryFunction;
  healthCheck: () => Promise<void>;
  transaction<T>(
    callback: TransactionCallback<T>
  ): Promise<T>;
};

export type Transaction = <T>(
  callback: TransactionCallback<T>
) => Promise<T>;

export type TransactionCallback<T> = (query: QueryFunction) => Promise<T>;
