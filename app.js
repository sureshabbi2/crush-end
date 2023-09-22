require("dotenv").config()
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 8888; //TODO
const db = require("./utils/db");

require("./utils/passportConfig")(passport); //Initialize passport


//Models
const Note = require('./models/Note');
const defaultLogger = ({ req, type = 'INFO', message }) => {
    console.log({
        path: req.path,
        method: req.method,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        type: type,
        message: message
    })
}

async function main() {
    await db.connect(); //Initialize db connection

    // Start the server
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });

    // App configuration
    app.use(express.json());

    //API Request details logger
    app.use((req, res, next) => {
        defaultLogger({ req });
        next();
    });

    // Public Routes
    // Redirect the user to the Google signin page
    app.get(
        "/auth/google",
        passport.authenticate("google", { scope: ["email", "profile"] })
    );
    // Retrieve user data using the access token received
    app.get(
        "/auth/google/callback",
        passport.authenticate("google", { session: false }),
        (req, res) => {
            jwt.sign(
                { user: req.user },
                "secretKey",
                { expiresIn: "1h" },
                (err, token) => {
                    if (err) {
                        return res.json({
                            token: null,
                        });
                    }
                    res.json({
                        token,
                    });
                }
            );
        }
    );
    // profile route after successful sign in
    app.get(
        "/profile",
        passport.authenticate("jwt", { session: false }),
        (req, res, next) => {
            const { name, email } = { ...req.user };
            const copy = { name, email };
            return res.status(200).send(copy);
        }
    );

    // Private Routes
    app.post('/notes', passport.authenticate("jwt", { session: false }),
        async (req, res, next) => {
            try {
                const { title, description } = { ...req.body };
                const copy = { title, description, userAgent: req.headers['user-agent'], createdBy: req.user.email }
                const note = new Note(copy);
                await note.save();
                return res.status(200).send(note);
            } catch (err) {
                return next(err);
            }
        });

    app.get('/notes', passport.authenticate("jwt", { session: false }),
        async (req, res, next) => {
            const notes = await Note.find({ createdBy: req.user.email });
            return res.status(200).send(notes);
        });

    app.delete('/notes/:id', passport.authenticate("jwt", { session: false }),
        async (req, res, next) => {
            const id = req.params.id;
            const response = await Note.findOneAndDelete({ _id: id });
            if (!response) {
                return res.status(400).send({
                    message: 'not found',
                    id
                })
            }
            return res.status(200).send({
                message: 'deleted',
                id
            });
        });


    //Default Error handler
    function logErrors(err, req, res, next) {
        console.log('Debug: Log error is', { stack: err.stack, message: err.message });
        defaultLogger({
            req,
            type: 'error',
            message: (err.message || err.stack)
        });
        console.log('Debug: sending next');
        next(err)
    }

    function errorHandler(err, req, res, next) {
        console.log('Debug: sending response back to user', err);
        return res.status(500).send({ message: err.message })
    }

    app.use(logErrors);
    app.use(errorHandler);
}

main();
// process.on('uncaughtException', function(err) {
//     console.log('Caught exception: ' + err);
//   });