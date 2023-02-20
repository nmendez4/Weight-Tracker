const router = require("express").Router();
const Change = require("../models/change.js");

router.post("/api/change", ({bosy}, res) => {
    Change.create(body)
    .then(dbChange => {
        res.json(dbChange);
    })
    .catch(err => {
        res.status(404).json(err);
    });
});

router.post("/api/change/bulk", ({body}, res) => {
    Change.insertMany(body)
    .then(dbChange => {
        res.json(dbChange);
    })
    .catch(err => {
        res.status(404).json(err);
    });
});

router.get("/api/change", (req, res) => {
    Change.find({}).sort({ date: -1})
    .then(dbChange => {
        res.json(dbChange);
    })
    .catch(err => {
        res.status(404).json(err);
    });
});

module.exports = router;