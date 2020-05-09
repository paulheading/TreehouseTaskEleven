
const express = require('express'),
      router  = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect("/api");
});

module.exports = router;
