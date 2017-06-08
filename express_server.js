const express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const random = function generateRandomString() {
  var newID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < 6; i++) {
    newID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return newID;
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.post("/logout", (req,res) => {
  res.clearCookie('username', req.body.username)
  res.redirect("/urls")
});

app.post("/login", (req,res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
});

app.post("/urls/:id/update", (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});


app.get("/u/:shortURL", (req, res) => {
  var key = req.params.shortURL;
  let longURL = urlDatabase[key];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars)
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  var shortURL = random();
  var longURL = req.body.longURL;
  var newURL = 'http://localhost:8080/u/' + shortURL;
  urlDatabase[shortURL] = longURL;
  res.send(`<html><body>Your new short url is --> ${newURL}<p><a href= "${newURL}" target="_blank">[Open in new window/tab]</a><p><a href="/urls">[Return to home]</a></p></p></body></html>`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    orgURL: valueofDb
  };
  let valueofDb = urlDatabase[req.params.id];
  res.render("urls_show", templateVars)
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
  console.log(`Listening on port ${PORT}...`);
  console.log('... Success!')
});