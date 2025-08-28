// routes/authRoutes.js
const express = require("express");
const  { auth, logout }  = require("../controllers/auth");

const router = express.Router();

router.get("/me", auth, (req, res) => {
  return res.json({
    authenticated: true,
    user: req.user,
  });
});

router.post("/logout", logout);
module.exports = router;
