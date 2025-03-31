import express from "express";
import { v4 as uuidv4 } from "uuid";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const newId = uuidv4();
const OMDB_API_KEY = process.env.OMDB_API_KEY;

console.log(newId);
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: 5432,
});

// Express server setup
const port = process.env.PORT || 3601;
const app = express();

// Set up static file serving from the public directory
app.use(express.static("public"));
app.use(express.json()).use(express.urlencoded({ extended: true }));

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err));

const families = [];
const movies = [];

// Routes
app.get("/", async (req, res) => {
  try {
    const result = await db.query(`
          SELECT movies.title, movies.poster_url, users.username 
          FROM movies 
          JOIN users ON movies.added_by = users.id
          ORDER BY movies.watched_at DESC;
      `);
    res.render("index.ejs", { movies: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching movies");
  }
});

app.get("/search", async (req, res) => {
  const { username } = req.query;
  try {
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.send("User not found");
    }

    const movies = await db.query(
      "SELECT title FROM movies WHERE added_by = $1",
      [user.rows[0].id]
    );

    res.render("profile.ejs", { username, movies: movies.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error searching for user");
  }
});

app.get("/add-member", async (req, res) => {
  res.render("add-member.ejs");
});

app.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    // Find user
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.send("User not found");
    }

    // Get user's movies
    const movies = await db.query("SELECT * FROM movies WHERE added_by = $1", [
      user.rows[0].id,
    ]);

    res.render("profile.ejs", { username, movies: movies.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading profile");
  }
});

app.get("/search-movie", async (req, res) => {
  const { query } = req.query;
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`
    );
    const data = await response.json();
    if (data.Response === "True") {
      res.json(data.Search);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching movies");
  }
});

app.post("/add-movie", async (req, res) => {
  const { username, title, poster_url, imdb_id, review } = req.body;

  try {
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) return res.send("User not found");

    await db.query(
      "INSERT INTO movies (title, poster_url, imdb_id, added_by, review) VALUES ($1, $2, $3, $4, $5)",
      [title, poster_url, imdb_id, user.rows[0].id, review]
    );

    res.redirect(`/profile/${username}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding movie");
  }
});

app.get("/profile", async (req, res) => {
  const username = "Dhruv"; // Change this when adding authentication
  res.redirect(`/profile/${username}`);
});

app.post("/addfamily", async (req, res) => {
  const familyName = req.body.familyName;
  try {
    await db.query("INSERT INTO users (username) VALUES ($1);", [familyName]);
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
