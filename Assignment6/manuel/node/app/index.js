// ######################################################################################## //
//                                    imports                                               //
// ######################################################################################## //
const path = require('path')
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')
const Database = require('better-sqlite3');

const redis = require('redis')
const RedisStore = require('connect-redis')(session)

// ######################################################################################## //
//                                    application setup                                     //
// ######################################################################################## //
const app = express()                                                             // app instance
const port = process.env.PORT || 3000                                             // port
const urlencParser = express.urlencoded({extended: false});                       // middleware for urlencoded bodies
const textParser = express.text();                                                // middleware for plaintext bodies
const DB = new Database(path.join(__dirname, "..", "data", "roary.db"));  // database connection, single instance avoids reopening constantly

// static files middleware. Should never be actually used for Assignment 5 since we have
// an nginx reverse proxy serving static files. This acts only as a fallback mechanism.
app.use("/", express.static(path.join(__dirname, "..", "public")));

// sessions middleware
app.use(session({
  store: new RedisStore({client: redis.createClient()}),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'sfa75$643n&35#asf45gd§lkjfda5%6'
}));

// ######################################################################################## //
//                                      database setup                                      //
// ######################################################################################## //
const fs = require('fs');
DB.pragma('journal_mode = WAL')    // https://www.sqlite.org/pragma.html#pragma_journal_mode
DB.pragma('synchronous = NORMAL')  // https://www.sqlite.org/pragma.html#pragma_synchronous

// Restart the write-ahead log when it grows beyond 10MB (checked every 5min)
setInterval(
    () => fs.stat(path.join(__dirname, "..", "data", "roary.db-wal"), (err, stats) => {
        if (!err && stats.size > 10_000_000)
            DB.pragma('wal_checkpoint(RESTART)')
    }),
5*60*1000).unref()

// database schema
DB.exec(`
    CREATE TABLE IF NOT EXISTS user (
        UID INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT UNIQUE,
        pwd TEXT
    );
    CREATE TABLE IF NOT EXISTS roar (
        RID INTEGER PRIMARY KEY AUTOINCREMENT,
        author INTEGER REFERENCES user(UID),
        time INTEGER,
        message TEXT
    );
    CREATE TABLE IF NOT EXISTS likes (
        UID INTEGER REFERENCES user(UID),
        RID INTEGER REFERENCES roar(RID),
        PRIMARY KEY (UID, RID)
    );
`)

// prepared statements for modifying the database
const ADD_LIKE = DB.prepare('INSERT OR IGNORE INTO likes VALUES (:uid, :rid)');
const REMOVE_LIKE = DB.prepare('DELETE FROM likes WHERE UID = :uid AND RID = :rid');
const ADD_USER = DB.prepare('INSERT INTO user VALUES (null, :email, :name, :pwd)');
const ADD_ROAR = DB.prepare('INSERT INTO roar VALUES (null, :author, :time, :msg)');
const GET_USER = DB.prepare('SELECT * FROM user WHERE email=:email OR name=:name OR UID = :uid');
const GET_ROARS = DB.prepare(`
    SELECT
        roar.RID as RID,
        name AS username, 
        time AS date, 
        message AS message, 
        COUNT(likes.UID) AS likes, 
        CASE WHEN MAX(likes.UID = :uid) THEN 1 ELSE 0 END AS liked
    FROM roar 
    JOIN user ON roar.author=user.UID
    LEFT JOIN likes ON roar.RID=likes.RID
    WHERE roar.RID > :baseRID 
    GROUP BY roar.RID
    ORDER BY time ASC
    LIMIT :maxRows
`);


// ######################################################################################## //
//                                      route handlers                                      //
// ######################################################################################## //

// Get list of roars
app.get("/api/roar", function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // UID from session, RID and max row count from url parameters
    const UID = req.session.UID;
    const RID = isNaN(parseInt(req.query.upTo)) ? 0 : parseInt(req.query.upTo);
    const maxRows = isNaN(parseInt(req.query.limit)) ? 0 : parseInt(req.query.limit);

    if (UID === undefined) {
        res.status(403).send("Not logged in");
        return;
    }

    try {
        let first = true;
        let itr = GET_ROARS.iterate({uid: UID, baseRID: Math.max(0, RID), maxRows: Math.max(0, maxRows)})

        // JSON output written "by hand": Write opening bracket for JSON array    
        res.write("[");
        
        for (const row of itr) {
            res.write((first ? "" : ",") + JSON.stringify(row));
            first = false;
        }

        res.write("]");
        res.end();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
})

// Post new Roar (request body = message to post)
app.post("/api/roar", textParser, function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // UID from session, message is request body (textParser middleware!)
    const UID = req.session.UID;
    const msg = String(req.body);

    if (UID === undefined) {
        res.status(403).send("Not logged in");
        return;
    }

    // server side check for maximum message length
    if (!msg || msg.length > 128) {
        res.send('{"error": true, "errMsg": "Max. 128 characters allowed"}');
    }
    else {
        try {
            ADD_ROAR.run({author: UID, time: Date.now(), msg: msg});
            res.send('{"error": false}');
        }
        catch (err) {
            console.error(err);
            res.send('{"error": true, "errMsg": "DB insert"}');
        }
    }
});


// change like state
app.put("/api/roar/:id/like", (req, res) => setLikeState(req, res, req.params.id, true));
app.put("/api/roar/:id/dislike", (req, res) => setLikeState(req, res, req.params.id, false));

function setLikeState(req, res, rid, like) {
    const UID = req.session.UID;
    const RID = parseInt(rid);

    if (UID === undefined) {
        res.sendStatus(403);
        return;
    } else if (isNaN(like) || isNaN(RID)) {
        res.sendStatus(400); // bad data: fav or RID not numbers!
        return;
    }

    try {
        if (like) ADD_LIKE.run({uid: UID, rid: RID});
        else REMOVE_LIKE.run({uid: UID, rid: RID});

        res.sendStatus(200);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

// Login route
app.post("/api/login", urlencParser, function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // Both email and password via the request body (urlencoded middleware)
    const mail = req.body.email;
    const pwd = req.body.password;

    try {
        const user = GET_USER.get({email: mail, name: null, uid: null});

        if (user) {
            bcrypt.compare(pwd, user.pwd, (bcErr, result) => {
                if (bcErr || !result) res.send('{"error": true, "errMsg": "Invalid password"}');
                else {
                    req.session.UID = user.UID;
                    res.send('{"error": false, "username": "' + user.name + '"}')
                }
            });
        } else {
            res.send('{"error": true, "errMsg": "user doesn\'t exist"}');
        }
    }
    catch (err) {
        // database error
        console.error(err);
        res.send('{"error": true, "errMsg": "DB query error"}');
    }
})

// lgout route: simple delete the session user ID
app.post("/api/logout", function(req, res) {
    delete req.session.UID;
    res.setHeader("Content-Type", "application/json");
    res.send('{"error": false}');
})

// register new user
app.post("/api/register", urlencParser, function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // all data sent via post body (urlencoded middleware!)
    const mail = req.body.email;
    const username = req.body.username;
    const pwd = req.body.password;

    try {
        const user = GET_USER.get({email: mail, name: username, uid: null});

        if (user) {
            res.send('{"error": true, "errMsg": "user already exists"}');
        } else {
            bcrypt.hash(pwd, 10, (bcErr, hash) => {
                if (bcErr) {
                    console.error(bcErr);
                    res.send('{"error": true, "errMsg": "password hashing error"}');
                    return;
                }

                try {
                    ADD_USER.run({email: mail, name: username, pwd: hash});
                    res.send('{"error": false}');
                }
                catch (err) {
                    console.error(err);
                    res.send('{"error": true, "errMsg": "DB insert error"}');
                }
            });
        }
    }
    catch (err) {
        console.log(err);
        res.send('{"error": true, "errMsg": "DB query error"}');
    }
});

// ######################################################################################## //
//                                      start the app                                       //
// ######################################################################################## //

app.listen(port, () => {
    console.log(`Roary app listening at http://localhost:${port}`)
})
