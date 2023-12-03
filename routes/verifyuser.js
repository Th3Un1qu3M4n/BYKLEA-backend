const router = require("express").Router();
const { User } = require("../models/user");

router.get("/:verifycode", async (req, res) => {
  try {
    const user = await User.findOne({
      isverified: false,
      verifycode: req.params.verifycode,
    });
    if (!user) return res.status(400).send("Invalid Code");

    user.isverified = true;
    user.verifycode = "";
    await user.save();

    res.status(200).send("User Verified");
    console.log("User is verified");
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
