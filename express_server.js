const express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var newID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i <= 6; i++) {
    newID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
    return newID;
}

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {
    urls: urlDatabase
  });
});

app.get("/urls/:id", (req, res) => {
  let valueofDb = urlDatabase[req.params.id];
  res.render("urls_show", {
    shortURL: req.params.id,
    orgURL: valueofDb
  });
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});