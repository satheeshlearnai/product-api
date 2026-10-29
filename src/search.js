// Demo route for the review lab. It has no input validation and no tests. 
const express = require("express"); 
const router = express.Router();
 router.get("/search", (req, res) => { 
    const term = req.query.q.toLowerCase();
     res.json({ term }); }
    ); 
module.exports = router;