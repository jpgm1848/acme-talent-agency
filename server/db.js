const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

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
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  );
  CREATE TABLE skills(
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
  );
  CREATE TABLE user_skills(
    id UUID PRIMARY KEY, 
    user_id UUID REFERENCES users(id) NOT NULL,
    skill_id UUID REFERENCES skills(id) NOT NULL,
    CONSTRAINT user_skill_unique UNIQUE (user_id, skill_id)
  );
  `;
  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 5);
  const SQL = `
    INSERT INTO users(id, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    hashedPassword, // Hashed password included in the parameter array
  ]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
  SELECT *
  FROM USERS
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createSkill = async ({ name }) => {
  const SQL = `
  INSERT INTO skills(id, name)
  VALUES ($1, $2)
  RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchSkills = async () => {
  const SQL = `
  SELECT *
  FROM SKILLS
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createUserSkill = async ({ user_id, skill_id }) => {
  const SQL = `
  INSERT INTO user_skills(id, user_id, skill_id)
  VALUES ($1, $2, $3)
  RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, skill_id]);
  return response.rows[0];
};

const fetchUserSkills = async (user_id) => {
  const SQL = `
  SELECT *
  FROM user_skills
  WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const destroyUserSkill = async ({ user_id, id }) => {
  const SQL = `
    DELETE FROM user_skills
    WHERE id = $1 AND user_id = $2
  `;
  const response = await client.query(SQL, [id, user_id]);

  if (response.rowCount === 0) {
    const error = new Error("No user skill found");
    error.status = 404; // Not found status code
    throw error;
  }
};

module.exports = {
  client,
  createTables,
  createUser,
  fetchUsers,
  createSkill,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  destroyUserSkill,
};
