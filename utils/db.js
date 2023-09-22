const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const dbUrl = "mongodb+srv://sureshabbi2:bPsMSPVANr0f74Ty@crush.srljszg.mongodb.net/crushOffline?retryWrites=true&w=majority"; //TODO
const connect = async () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = mongoose.connection;
        db.on("error", (err) => {
            console.log("could not connect", err);
            return reject(err);
        });
        db.once("open", () => {
            console.log("> Successfully connected to database");
            return resolve(db);
        });
    })

};
module.exports = { connect };