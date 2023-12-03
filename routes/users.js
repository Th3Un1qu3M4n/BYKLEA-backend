const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../auth/jwt");
const sendEmail = require("../util/mail");

router.post("/signup", async function (req, res, next) {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const uemail = await User.findOne({ email: req.body.email });
    if (uemail) {
      return res.status(409).json();
    }
    // console.log(req.body);
    // const contact = await User.findOne({ phone_number: req.body.phone_number });
    // if (contact) {
    //   return res.status(409).json();
    // }

    const verifycode = parseInt(
      Date.now() + (Math.random() * 100).toString(),
      16
    );
    const UserModal = new User({ ...req.body, verifycode });
    const UserSave = await UserModal.save();
    const url = `http://localhost:3000/verify/${verifycode}`;
    await sendEmail(req.body.email, "Verify User", url);
    console.log("send email to ", req.body.email);
    res.status(200).json(UserSave);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const Loginuser = async (req, res, next) => {
  console.log("Request received");
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Credentials Dont Match", error: true });
    }
    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isPassword) {
      return res
        .status(401)
        .json({ message: "Credentials Dont Match", error: true });
    }

    if (!user.isverified) {
      return res
        .status(401)
        .json({ message: "Please Verify Your Email", error: true });
    }

    const token = jwt.sign({ id: user._id }, "Secret", { expiresIn: "1h" });

    res
      .status(201)
      .send({ token: token, name: user.name, id: user._id, role: user.role });

    //  res.cookie("access_token", token, {httpOnly: true}).status(201).send("User Authenticated and Logged In!!!")
  } catch (error) {
    console.log(error);
    return next(new Error());
  }
};

router.post("/signin", (req, res, next) => Loginuser(req, res, next));

router.get("/getid", verifyToken, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await User.find({ userid: req.user.id });
    return res.status(200).json({ user_id: req.user.id, user });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/get", async (req, res, next) => {
  try {
    const user = await User.find();
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
