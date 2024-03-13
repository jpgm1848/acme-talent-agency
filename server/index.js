const {
  client,
  createTables,
  createUser,
  fetchUsers,
  createSkill,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  destroyUserSkill,
} = require("./db");

const express = require("express");
const app = express();

app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [
    paul,
    leto,
    jessica,
    weirding,
    voice,
    shieldcombat,
    mentatcomputation,
  ] = await Promise.all([
    createUser({ username: "paul", password: "atreides" }),
    createUser({ username: "gurney", password: "halleck" }),
    createUser({ username: "thufir", password: "hawat" }),
    createSkill({ name: "weirding" }),
    createSkill({ name: "voice" }),
    createSkill({ name: "shieldcombat" }),
    createSkill({ name: "mentatcomputation" }),
  ]);
  console.log(await fetchUsers());
  console.log(await fetchSkills());

  const [paulWeirds, paulVoices] = await Promise.all([
    createUserSkill({ user_id: paul.id, skill_id: weirding.id }),
    createUserSkill({ user_id: paul.id, skill_id: voice.id }),
  ]);
  console.log(await fetchUserSkills(paul.id));

  await destroyUserSkill(paulVoices);

  console.log(await fetchUserSkills(paul.id));

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log(`curl localhost:${port}/api/skills`);
    console.log(`curl localhost:${port}/api/users`);
    console.log(`curl localhost:${port}/api/users/${paul.id}/userSkills`);
  });
};

init();
