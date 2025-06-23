import express from "express";
import bodyParser from "body-parser";

import fs from "fs";
// NEW
import dotenv from "dotenv";
import pg from "pg";
import { get } from "http";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// NEW
const db = new pg.Client({
  user: process.env.user,
  password: process.env.password,
  host: process.env.host,
  port: process.env.port,
  database: process.env.database,
});
db.connect();

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

async function getBlogs() {
  const result = await db.query("SELECT * FROM blogs;");
  return result.rows;
}

app.get("/", async (req, res) => {
  // NEW
  const posts = await getBlogs();

  res.render("./index.ejs", { posts });
});

app.post("/submit", async (req, res) => {
  const d = new Date();
  // const post = {
  //   id: count,
  //   title: req.body["title"],
  //   description: req.body["description"],
  //   content: req.body["content"],
  //   date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
  //   time: `${d.getHours()}:${d.getMinutes()}`,
  // };
  const title = req.body.title;
  const description = req.body.description;
  const content = req.body.content;
  const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const time = `${d.getHours()}:${d.getMinutes()}`;

  if (title !== "" && content !== "") {
    await db.query(
      "INSERT INTO blogs (title, description, blog_content, blog_date, blog_time) VALUES ($1, $2, $3, $4, $5);",
      [title, description, content, date, time]
    );

    // count++;
    // posts.push(post);
    // fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  }

  res.redirect("/");
});

app.get("/edit/:id", async (req, res) => {
  const requestedId = req.params.id;

  const posts = await getBlogs();
  const post = posts.find((p) => p.id == requestedId);

  res.render("index.ejs", { posts, editPost: post });
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);

  // const posts = await getBlogs();
  // const index = posts.findIndex((p) => p.id == id) + 1;

  await db.query(
    "UPDATE blogs SET title=$1, description=$2, blog_content=$3 WHERE id=$4",
    [req.body.title, req.body.description, req.body.content, id]
  );

  res.redirect("/");
  // posts[index].title = req.body.title;
  // posts[index].description = req.body.description;
  // posts[index].content = req.body.content;

  // fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  // const index = posts.findIndex((p) => p.id == id);
  // posts.splice(index, 1);

  await db.query("DELETE FROM blogs where id=$1", [id]);

  // posts = posts.filter((p) => p.id != req.params.id);
  // fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));

  res.redirect("/");
});

app.get("/view/:id", async (req, res) => {
  const id = req.params.id;
  const posts = await getBlogs();
  const post = posts.find((p) => p.id == id);

  res.render("index.ejs", { posts, viewPost: post });
});

app.listen(port, (req, res) => {
  console.log("Server running");
});

// let posts = [];
// try {
//   const data = fs.readFileSync("posts.json", "utf-8");
//   posts = JSON.parse(data);
// } catch (err) {
//   console.log("No posts.json file found or it's empty, starting fresh.");
// }

// let count = posts.length + 1;
