const express = require("express");
var app = express();
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

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

app.get("/urls", (req, res) => {
  res.render("urls_index", {
    URLid: urlDatabase[req.params.id],
    urls: urlDatabase
  });
});

app.get("/u/:shortURL", (req, res) => {
  var key = req.params.shortURL;
  let longURL = urlDatabase[key];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  console.log(`Listening on port ${PORT}...`);
  console.log('... Success!')
});