import PostgresDatabase from "../lib";

const database = new PostgresDatabase({
  config: {
    type: "postgres",
    host: "localhost",
    port: 5432,
    name: "dirty_matchbox_example",
    password: "password",
    username: "dirty_matchbox_example_user",
  },
  logger: console,
});

const start = async () => {
  console.info("Starting the example");
  console.info("Postgres database booting up");
  await database.init();
  console.info("Postgres database connected");
  await database.healthCheck();
  const output = await database.query<{now: string}>({ raw: `SELECT NOW();` });
  console.info("Postgres query executed with output", output);
  await database.disconnect();
  console.info("Postgres database is ready to use");
};

start().catch((error) => {
  console.log("Error happened running the example", error);
}).finally(() => {console.log("Completed running example")});
