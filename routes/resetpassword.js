const router = require("express").Router();
const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../util/mail");
const bcrypt = require("bcrypt");

// send password link
router.post("/", async (req, res) => {
  try {
    const USER = await User.findOne({ email: req.body.email });
    if (!USER) {
      return res.status(404).json();
    }
    let token = await Token.findOne({ userId: USER._id });
    if (!token) {
      token = await new Token({
        userId: USER._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const url = `http://localhost:3000/resetpassword/${USER._id}/${token.token}/`;
    await sendEmail(USER.email, "Password Reset", url);

    res.status(200).json();
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// verify password reset link
router.get("/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    res.status(200).send("Valid Url");
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//  set new password
router.post("/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });
    user.password = req.body.password;
    await user.save();
    await token.remove();

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
