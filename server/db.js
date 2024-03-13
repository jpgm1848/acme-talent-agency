const pg = require("pg");

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_talent_gh_db"
);

const createTables = async () => {
  const SQL = `
  DROP TABLE IF EXISTS user_skills;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS skills;
  CREATE TABLE users(
    id UUID PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL
  );
  CREATE TABLE skills(
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
  );
  CREATE TABLE user_skills(
    id UUID PRIMARY KEY, 
    user_id UUID REFERENCES users(id) NOT NULL,
    skill_id UUID REFERENCES users(id) NOT NULL
  );
  `;
  await client.query(SQL);
};

module.exports = {
  client,
  createTables,
};
