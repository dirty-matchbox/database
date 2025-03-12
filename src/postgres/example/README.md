# Dirty Matchbox Postgres Database example

## Usage
Create database
```
CREATE DATABASE dirty_matchbox_example; 
CREATE USER dirty_matchbox_example_user;
GRANT ALL PRIVILEGES ON DATABASE dirty_matchbox_example TO dirty_matchbox_example_user;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

