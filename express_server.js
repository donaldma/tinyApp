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

const user = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "bobbobbob"
  }
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.post("/register", (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('<html><a href="https://http.cat/400">Error 400 (Please Enter a email/password)<a><br><br><a href="/register">[Return to register]</a></html>')
    return;
  }

  for (let eachuser in user) {
    if (user[eachuser].email === req.body.email){
      res.status(400).send('<html><a href="https://http.cat/400">Error 400 (Email already taken)<a><br><br><a href="/register">[Return to register page]</a></html>')
      return;
    }
  }

  var newID = ''
  let randomID = random();
  newID += randomID
  user[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  }

  res.cookie('userid', newID)
  res.redirect("/urls")
});

app.post("/login", (req,res) => {
  if(!req.body.email || !req.body.password){
    res.redirect('/login')
    return;
  }

  for (let eachuser in user) {
    if (req.body['email'] === user[eachuser]['email'] && req.body['password'] === user[eachuser]['password']) {
      res.cookie('userid', eachuser);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('<html>Email/Password incorrect, Please <a href="/login">try again</a> or click register to sign up for an account<br><br><a href="/register">[Register]</a><br><br><a href="/urls">[Return to home]</a></html>')
  return;
});

app.post("/logout", (req,res) => {
  res.clearCookie('userid', req.body.userid)
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

app.get("/login", (req, res) => {
  let templateVars = {
    users: user[req.cookies["userid"]],
  };
  res.render("urls_login")
});

app.get("/register", (req, res) => {
  let templateVars = {
    users: user[req.cookies["userid"]],
  };
  res.render("urls_register")
});

app.get("/urls", (req, res) => {
  let templateVars = {
    users: user[req.cookies["userid"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: user[req.cookies["userid"]],
  };
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: user[req.cookies["userid"]],
    shortURL: req.params.id,
    orgURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  var shortURL = random();
  var longURL = req.body.longURL;
  var newURL = 'http://localhost:8080/u/' + shortURL;
  urlDatabase[shortURL] = longURL;
  res.send(`<html><body>Your new short url is --> ${newURL}<p><a href= "${newURL}" target="_blank">[Open in new window/tab]</a><p><a href="/urls">[Return to home]</a></p></p></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
  console.log('... Success!')
});