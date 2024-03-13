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

app.use(express.json());

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

app.delete("/api/users/:userId/userSkills/:id", async (req, res, next) => {
  try {
    await destroyUserSkill({
      user_id: req.params.userId,
      id: req.params.id,
    });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

app.post("/api/users/:userId/userSkills", async (req, res, next) => {
  try {
    const userSkill = await createUserSkill({
      user_id: req.params.userId,
      skill_id: req.body.skill_id,
    });
    res.status(201).send(userSkill);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [
    paul,
    gurney,
    thufir,
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
    console.log(
      `curl -X DELETE localhost:${port}/api/users/${paul.id}/userSkills/${paulVoices.id}`
    );
    console.log(
      `curl -X POST localhost:${port}/api/users/${gurney.id}/userSkills -d '{"skill_id": "${shieldcombat.id}"}' -H "Content-Type:application/json"`
    );
  });
};

init();
