const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const dotenv = require("dotenv");
const { customAlphabet } = require("nanoid");
const bcrypt = require("bcrypt");

dotenv.config();

app.use(express.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));

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

function htmlEscape(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function urlCleaning(url) {
  return url.replace(/https?(:\/\/)|www./g, "");
}

// Recupere le hash admin, le compare avec password puis renvoie la résolution de la promise avec true/false
async function checkIfAuthorized(password) {
  const sql = "SELECT hash from keys WHERE username LIKE '_admin'";

  return new Promise((resolve, reject) => {
    db.all(sql, async (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(bcrypt.compare(password, rows[0].hash));
      }
    });
  });
}

// http://expressjs.com/en/starter/basic-routing.html

// ROUTES
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.post("/new", (req, res) => {
  let url = htmlEscape(req.body.url);

  // suppression des http(s):// et www.
  url = urlCleaning(url);

  if (url.length != 0) {
    const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
    // 36^6 possibilités = 2 176 782 336

    const slug = nanoid();
    res.setHeader("content-type", "text/plain");

    res.json({ slug: `/${slug}` });

    db.run(`INSERT INTO urls (slug, redirectUrl) VALUES ("${slug}","${url}")`);
  }
});

app.get("/:slug", (req, res, next) => {
  // récupèrer le slug dans l'url avec req.params.slug
  const slug = htmlEscape(req.params.slug);

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
        req.url = "/404";
        next();
      }
    });
  }
});

app.get("/404", (req, res) => {
  res.sendFile(`${__dirname}/dist/404.html`);
});

app.delete("/clean", async (req, res) => {
  const password = req.body.key;
  if (!password) res.status(500).send("You don't have the right to do that !");

  checkIfAuthorized(password).then((right) => {
    if (right) {
      // Deleting all short links
      db.run("DELETE FROM urls", (err) => {
        if (err) {
          res.sendStatus(500);
        } else {
          // Reseting the AUTO_INCREMENT index
          db.run(
            "UPDATE sqlite_sequence SET seq = 0 WHERE name LIKE 'urls'",
            (err) => {
              if (err) {
                res.sendStatus(500);
              } else {
                res.sendStatus(200);
              }
            }
          );
        }
      });
    } else {
      res.status(500).send("You don't have the right to do that !");
    }
  });
});

app.post("/list", async (req, res) => {
  const password = req.body.key;
  if (!password) res.status(500).send("You don't have the right to do that !");

  checkIfAuthorized(password).then((right) => {
    if (right) {
      db.all("SELECT * from urls", (err, rows) => {
        if (err) {
          res.sendStatus(500);
        }
        if (rows.length === 0) {
          res
            .set("Content-Type", "text/plain")
            .status(200)
            .send("Database is empty");
        } else {
          res
            .set("Content-Type", "application/json")
            .json(rows)
            .status(200)
            .send();
        }
      });
    } else {
      res.status(500).send("You don't have the right to do that !");
    }
  });
});

// requests listening
var listener = app.listen(process.env.PORT || 80, () => {
  console.log(`Listening on http://localhost:${listener.address().port} ...\n`);
});
