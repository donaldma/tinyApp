const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['fuckoff']
}));

app.use((req, res, next) => {
  res.locals.userid = req.session.userid;
  next();
});

app.use('/urls',(req, res, next) => {
  if(req.session.userid) {
    next();
  } else {
    res.status(403).send('Must be logged in to access this page<br><br><a href="/login">Go to Login page</a> / <a href="/register">Go to Register page</a>')
  }
})

var urlDatabase = {
  "b2xVn2": {'longURL': "http://www.lighthouselabs.ca", 'userID': "userRandomID"},
  "9sm5xK": {'longURL': "http://www.google.com", 'userID': "user2RandomID"}
};

const user = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "b"
  }
}

const random = function generateRandomString() {
  var newID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < 6; i++) {
    newID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return newID;
};

function urlsForUser(id) {
  var filteredURLs = {};
  for(var key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredURLs[key] = urlDatabase[key]
    }
  }
  return filteredURLs;
}

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
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  let randomID = random();
  newID += randomID
  user[newID] = {
    id: newID,
    email: req.body.email,
    password: hashed_password
  }
  req.session.userid = newID;
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  let templateVars = {
    users: user[req.session.userid],
  };
  res.render("urls_register")
});

app.post("/login", (req,res) => {
  if(!req.body.email || !req.body.password){
    res.redirect('/login')
    return;
  }

  for (let eachuser in user) {
    if (req.body['email'] === user[eachuser]['email'] && bcrypt.compareSync(req.body.password, user[eachuser]['password'])) {
      req.session.userid = eachuser;
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('<html>Email/Password incorrect, Please <a href="/login">try again</a> or click register to sign up for an account<br><br><a href="/register">[Register]</a><br><br><a href="/urls">[Return to home]</a></html>')
  return;
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls")
});

app.post("/urls", (req, res) => {
  var shortURL = random();
  var longURL = req.body.longURL;
  let userID = req.session.userid;
  urlDatabase[shortURL] = {longURL: longURL, userID: userID};
  console.log(urlDatabase[shortURL]);
  res.redirect("/urls/" + shortURL)
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.userid)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: user[req.session.userid],
  };
  res.render("urls_new", templateVars)
});

app.get("/u/:id", (req, res) => {
  for(var key in urlDatabase) {
    if(req.params.id === key) {
      let orgURL = urlDatabase[req.params.id].longURL;
      res.redirect(orgURL);
      return;
    }
  }
  res.status(404).send('Link not found<br><br><a href="/">Go to TinyApp page</a>')
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: user[req.session.userid],
    shortURL: req.params.id,
    orgURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars)
});

app.get("/", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls")
  } else {
    res.send('<h1>Welcome to TinyApp Wannabe</h1><p><a href="/login">Login</a> / <a href="/register">Register</a>')
  }
});

app.post("/urls/:id/update", (req,res) => {
  let users = req.session.userid
  if (urlDatabase[req.params.id].userID === users) {
    urlDatabase[req.params.id].longURL = req.body.longURL
    res.redirect("/urls")
  } else {
    res.send('Cannot edit URL.. does not belong to you! <br><br><html><a href="/urls">[Return to home]</a></html>')
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let users = req.session.userid
  if (urlDatabase[req.params.id].userID === users) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls")
  } else {
    res.send('Cannot delete URL.. does not belong to you! <br><br><html><a href="/urls">[Return to home]</a></html>')
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
  console.log('... Success!')
});