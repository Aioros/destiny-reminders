var express = require("express");
var router = express.Router();
const passport = require("passport");

const db = require("../db.js");
var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.sendStatus(401);
}

router.get("/reminders/", isLoggedIn, async function(req, res, next) {
    res.json(await helpers.getUserReminders(req.user.bungieNetUser.membershipId));
});

router.post("/reminders/", isLoggedIn, async function(req, res, next) {
    var newReminder = {
        user: req.user.bungieNetUser.membershipId,
        category: req.body.category,
        choice: req.body.choice,
        email: req.body.email
    };
    try {
        var [result,] = await db.query("INSERT INTO reminder SET ? ON DUPLICATE KEY UPDATE id=id", newReminder);
        res.json({status: "ok", reminder: {id: result.insertId, ...newReminder}});
    } catch (ex) {
        console.log("error: ", ex);
        res.json(ex);
    }
});

router.delete("/reminders/:id", isLoggedIn, async function(req, res, next) {
    try {
        await db.query("DELETE FROM reminder WHERE id = ? AND user = ?", [req.params.id, req.user.bungieNetUser.membershipId]);
        res.json({status: "ok"});
    } catch (ex) {
        console.log("error: ", ex);
        res.json(ex);
    }
});

router.get("/current/:category", async function(req, res, next) {

    await helpers.updateDbInfo();

    var activityInfo = await getActivityInfo();

    res.json(activityInfo.current[req.params.category]);

});

module.exports = router;
