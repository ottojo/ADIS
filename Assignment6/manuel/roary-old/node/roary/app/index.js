// ######################################################################################## //
//                                    imports                                               //
// ######################################################################################## //
const path = require('path')
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3');

// ######################################################################################## //
//                                    application setup                                     //
// ######################################################################################## //
const app = express()                                                             // app instance
const port = 3000                                                                 // port
const urlencParser = express.urlencoded({extended: false});                       // middleware for urlencoded bodies
const textParser = express.text();                                                // middleware for plaintext bodies
const DB = new sqlite3.Database(path.join(__dirname, "..", "data", "roary.db"));  // database connection, single instance voids reopening constantly

// static files middleware
app.use("/", express.static(path.join(__dirname, "..", "public")));

// sessions middleware
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'sfa75$643n&35#asf45gd§lkjfda5%6'
}));

// ######################################################################################## //
//                                      database setup                                      //
// ######################################################################################## //
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
const ADD_LIKE = DB.prepare('INSERT OR IGNORE INTO likes VALUES ($uid, $rid)');
const REMOVE_LIKE = DB.prepare('DELETE FROM likes WHERE UID = $uid AND RID = $rid');
const ADD_USER = DB.prepare('INSERT INTO user VALUES (null, $email, $name, $pwd)');
const ADD_ROAR = DB.prepare('INSERT INTO roar VALUES (null, $author, $time, $msg)');
const GET_USER = DB.prepare('SELECT * FROM user WHERE email = $email OR name=$name OR UID = $uid');
const GET_ROARS = DB.prepare(`
    SELECT
        roar.RID as RID,
        name AS username, 
        time AS date, 
        message AS message, 
        COUNT(likes.UID) AS likes, 
        CASE WHEN MAX(likes.UID = $uid) THEN 1 ELSE 0 END AS liked
    FROM roar 
    JOIN user ON roar.author=user.UID
    LEFT JOIN likes ON roar.RID=likes.RID
    WHERE roar.time > $baseTime 
    GROUP BY roar.RID
    ORDER BY time ASC
    LIMIT $maxRows
`);


// ######################################################################################## //
//                                      route handlers                                      //
// ######################################################################################## //

// Get list of roars
app.get("/api/getRoars", function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // UID from session, time and max row count from url parameters
    const UID = req.session.UID;
    const time = isNaN(parseInt(req.query.upTo)) ? 0 : parseInt(req.query.upTo);
    const maxRows = isNaN(parseInt(req.query.limit)) ? 0 : parseInt(req.query.limit);

    if (UID === undefined) {
        res.status(403).send("Not logged in");
        return;
    }

    DB.serialize(() => {
        // JSON output written "by hand": Write opening bracket for JSON array
        res.write("[");
        let first = true;

        GET_ROARS.each(
            {$uid: UID, $baseTime: Math.max(0, time), $maxRows: Math.max(0, maxRows)}, // statement bindings
            (err, row) => {
                if (err) {console.log(err); return;}

                if (!first) res.write(",");
                else first = false;

                // write Roar object (== result row!)
                res.write(JSON.stringify(row));
            },
            (err, numRows) => {
                // JSON output written "by hand": Write closing bracket for JSON array and terminate response
                res.write("]");
                res.end();
            }
        );
        // reset the statement
        GET_ROARS.reset();
    });
})

// Post new Roar (request body = message to post)
app.post("/api/postRoar", textParser, function(req, res) {
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
        DB.serialize(() => {
            ADD_ROAR.run(
                {$author: UID, $time: Date.now(), $msg: msg}, // statement bindings
                err => {
                    if (err) {
                        console.log(err);
                        res.send('{"error": true, "errMsg": "DB insert"}');
                    } else {
                        res.send('{"error": false}');
                    }
                }
            );
            // reset statement
            ADD_ROAR.reset();
        });
    }
})

// Login route
app.post("/api/login", urlencParser, function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // Both email and password via the request body (urlencoded middleware)
    const mail = req.body.email;
    const pwd = req.body.password;

    DB.serialize(() => {
        GET_USER.get(
            {$email: mail, $name: null, $uid: null}, // statement bindings
            (err, row) => {
                if (err) {
                    // database error
                    console.log(err);
                    res.send('{"error": true, "errMsg": "DB query error"}');
                } else if (row) {
                    // user exists => compare password
                    bcrypt.compare(pwd, row.pwd, (bcErr, result) => {
                        if (bcErr || !result) res.send('{"error": true, "errMsg": "Invalid password"}');
                        else {
                            req.session.UID = row.UID;
                            res.send('{"error": false, "username": "' + row.name + '"}')
                        }
                    });
                } else {
                    // user doesn't exist
                    res.send('{"error": true, "errMsg": "user doesn\'t exist"}');
                }
            }
        )
        // reset statement
        GET_USER.reset();
    });
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

    // sperate function for actually adding the new user. Seperated out into
    // extra function to avoid too much nesting. Called when the username is not already in use
    addUser = () => bcrypt.hash(pwd, 10, (bcErr, hash) => {
        if (bcErr) {
            console.log(bcErr);
            res.send('{"error": true, "errMsg": "password hashing error"}');
            return;
        }
        DB.serialize(() => {
            ADD_USER.run(
                {$email: mail, $name: username, $pwd: hash}, // statement bindings
                err => {
                    if (err) {
                        console.log(err);
                        res.send('{"error": true, "errMsg": "DB insert error"}');
                    } else {
                        res.send('{"error": false}');
                    }
                }
            )
            // reset statement
            ADD_USER.reset();
        });
    });

    // Check if the user doesn't already exist. If no, then call addUser()
    DB.serialize(() => {
        GET_USER.get(
            {$email: mail, $name: username, $uid: null}, // statement bindings
            (err, row) => {
                if (err) {
                    console.log(err);
                    res.send('{"error": true, "errMsg": "DB query error"}');
                } else if (row) {
                    res.send('{"error": true, "errMsg": "user already exists"}');
                } else {
                    addUser();
                }
            }
        )
        // reset statement
        GET_USER.reset();
    });
})

// change like state
app.post("/api/setFavState", urlencParser, function(req, res) {
    // all data sent via post body (urlencoded middleware!)
    const UID = req.session.UID;
    const like = parseInt(req.body.fav);
    const RID = parseInt(req.body.rid);

    if (UID === undefined) {
        res.sendStatus(403);
        return;
    } else if (isNaN(like) || isNaN(RID)) {
        res.sendStatus(400); // bad data: fav and RID not numbers!
        return;
    }

    // callback for DB action
    const cb = err => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    };

    // set the like state in the database
    DB.serialize(() => {
        if (like) ADD_LIKE.run({$uid: UID, $rid: RID}, cb).reset();
        else REMOVE_LIKE.run({$uid: UID, $rid: RID}, cb).reset();
    });
});

// ######################################################################################## //
//                                      start the app                                       //
// ######################################################################################## //

app.listen(port, () => {
    console.log(`Roary app listening at http://localhost:${port}`)
})
