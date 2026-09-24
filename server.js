require("dotenv").config()

const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// information we put into the session to represent this user
passport.serializeUser(function(user, done) {
    done(null, user); // put the user object into the session
});

// when a request comes in with a session, turn the stored session information back into a user.
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Oauth w github authentication
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done) {
    done(null, profile);
}));

// use sessions for this application
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// use passport for authentication
app.use(passport.initialize());
app.use(passport.session());


const requireLogin = function(request, response, next) {
    if (request.isAuthenticated()) {
        next();
    }
    else {
        response.redirect("/");
    }
};

//when someone visits it, passport sends them to github to log in
app.get("/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/auth/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/"
    }),
    function(request, response) {
        response.redirect("/");
    }
);

app.get("/logout", function(request, response) {
    request.logout(function(error) {
        if (error) {
            return response.status(500).send("Logout failed");
        }

        response.redirect("/");
    });
});

app.get("/auth/status", function(request, response) {
    response.json({
        loggedIn: request.isAuthenticated()
    });
});


const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("a3-grocery");
const items = db.collection("items");

client.connect()
    .then(function() {
        console.log("Connected to MongoDB");
    })
    .catch(function(error) {
        console.error("MongoDB connection error:", error);
    });

// Parse JSON request bodies
app.use(express.json());

// Serve files from the public folder (GET)
// false stops Express from automatically serving index.html at /
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.get("/", function(request, response) {
    if (request.isAuthenticated()) {
        response.sendFile(path.join(__dirname, "public", "index.html"));
    }
    else {
        response.sendFile(path.join(__dirname, "public", "login.html"));
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

//ENDPOINTS
app.post("/submit", requireLogin, function(request, response) {
  console.log(request.headers);
  console.log(request.body);
  handleSubmit(request, response);
});

app.post("/update", requireLogin, function(request, response) {
    console.log(request.headers);
    console.log(request.body);
    handleUpdate(request, response);
})

app.post("/delete", requireLogin, function(request, response) {
  handleDelete(request, response);
})

app.get("/items",requireLogin,  async function(request, response) {
    const groceryList = await items.find({ userId: request.user.id }).toArray()
    response.status(200).json(groceryList)
})


const description = function( item ) {
   return item.description = item.quantity + " " + item.item
}

const handleSubmit = async function( request, response ) {

  console.log(request.body);

    const listItem = request.body
    listItem.userId = request.user.id // attaches user id to item before MongoDB saves it

    // add a unique id to the item
    const lastItem = await items.find().sort({ id: -1 }).limit(1).toArray();
    listItem.id = lastItem.length > 0 ? lastItem[0].id + 1 : 1;

    listItem.description = description( listItem )
    console.log( listItem )

    await items.insertOne( listItem )

    const groceryList = await items.find({ userId: request.user.id }).toArray()

    response.status(200).json(groceryList)
}

const handleUpdate = async function (request, response) {
    const update = request.body

    await items.updateOne(
        { id: update.id, userId: request.user.id }, // find the item that matches the id of the checked/unchecked item
        { $set: { is_purchased: update.is_purchased } } // update the is_purchased property of the item
    )

    const groceryList = await items.find({ userId: request.user.id }).toArray()

    console.log(groceryList)

    response.status(200).json(groceryList)
}

const handleDelete = async function (request, response) {

    const deleted = request.body

    await items.deleteOne({ id: deleted.id, userId: request.user.id })

    const groceryList = await items.find({ userId: request.user.id }).toArray()

    console.log(groceryList)

    response.status(200).json(groceryList)
}

