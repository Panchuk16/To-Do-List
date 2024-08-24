import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

const db = new pg.Client({
  user: "postgres",
  password: "",
  database: "todo",
  host: "localhost",
  port: 5432,
});
db.connect();

async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  return items;
}

app.get("/", async (req, res) => {
  try {
  const items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  } catch (err) {
    console.log(err);
  };
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)",
    [item]);
  res.redirect("/");
    } catch (err) {
      console.log(err);
    };
});

app.post("/edit", async (req, res) => {
  const newTitle = req.body["updatedItemTitle"];
  const id = req.body["updatedItemId"];
  try {
  await db.query("UPDATE items SET title = ($1) WHERE id = ($2)",
    [newTitle, id]);
  res.redirect("/");
  } catch (err) {
    console.log(err);
  };
});


app.post("/delete", async (req, res) => {
  const id = req.body["deleteItemId"];
  await db.query("DELETE FROM items WHERE id = ($1)",
    [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
