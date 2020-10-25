const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const fs = require("fs");
const dotenv = require("dotenv");
const { customAlphabet } = require("nanoid");

dotenv.config();

app.use(express.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbPath = path.resolve(__dirname, "sqlite.db");
const exists = fs.existsSync(dbPath);

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbPath);

// DB initialization
db.serialize(function () {
  if (!exists) {
    db.run(
      "CREATE TABLE urls (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, redirectUrl TEXT)"
    );
    console.log("New table urls created!");
  }
});

// http://expressjs.com/en/starter/basic-routing.html

// ROUTES
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.post("/new", (req, res) => {
  const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
  // 36^6 possibilités = 2 176 782 336

  let url = req.body.url;

  const slug = nanoid();
  res.setHeader("content-type", "text/plain");

  res.json({ slug: `/${slug}` });

  db.run(`INSERT INTO urls (slug, redirectUrl) VALUES ("${slug}","${url}")`);
});

app.get("/:slug", (req, res) => {
  // récupèrer le slug dans l'url avec req.params.slug
  const slug = req.params.slug;

  // vérifier la taille du slug
  if (slug.length == 6) {
    // chercher dans la db la présence du slug
    db.all(`SELECT * FROM urls WHERE slug LIKE '${slug}'`, (err, rows) => {
      if (err) {
        throw err;
      }
      if (rows.length > 0) {
        // si slug trouvé, redirection vers l'url originale
        res.redirect(`https://www.${rows[0].redirectUrl}`);
      } else {
        // si slug non trouvé, redirigé vers une page "404, slug non trouvé"
        // res.redirect("https://localhost/404");
      }
    });
  }
});

app.delete("/clean", (req, res) => {
  // Deleting all short links
  db.run("DELETE FROM urls", (err) => {
    if (err) return console.error(err.message);
    else console.log("Shorturls erased !");
  });

  // Reseting the AUTO_INCREMENT index
  db.run("UPDATE sqlite_sequence SET seq = 1 WHERE name LIKE 'urls'", (err) => {
    if (err) return console.error(err.message);
    else console.log(`Index have been reset to 1 !`);
  });

  res.sendStatus(200);
});

// requests listening
var listener = app.listen(process.env.PORT || 80, () => {
  console.log(`Listening on http://localhost:${listener.address().port} ...\n`);
});
