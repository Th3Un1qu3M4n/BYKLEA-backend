const express = require("express");
const router = express.Router();
const Mechanics = require("../models/mechanics");
const { User, validate } = require("../models/user");
const { verifyToken } = require("../auth/jwt");

const sendEmail = require("../util/mail");

// Endpoint to allow mechanics to sign up and set location
router.post("/signup", async (req, res, next) => {
  // Create a new mechanic document
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const uemail = await User.findOne({ email: req.body.email });
    console.log(req.body);
    if (uemail) {
      return res.status(409).json({ message: "Email already exists" });
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
    const UserModal = new User({ ...req.body, verifycode, role: "mechanic" });
    const UserSave = await UserModal.save();
    const newMechanic = new Mechanics({
      fullname: req.body.name,
      user: UserSave._id,
      contact: req.body?.contact,
      approved: true,
      servicecharges: req.body?.servicecharges,
      latitude: req.body?.lat,
      longitude: req.body?.lng,
    });

    // Save the new mechanic document
    await newMechanic.save();

    const url = `http://localhost:3000/verify/${verifycode}`;
    await sendEmail(req.body.email, "Verify User", url);
    console.log("send email to ", req.body.email);
    res.status(200).json(UserSave);
  } catch (error) {
    console.log(error);
    // next(error);
    res.status(500).json({ error: "Server error" });
  }

  // res.json({ message: "Mechanic signed up successfully" });
});

// Approve a bike mechanic (Admin only)
router.put("/approve/:id", async (req, res) => {
  try {
    const mechanic = await Mechanics.findByIdAndUpdate(
      req.params.id,
      { approved: true }, // You can add an 'approved' field to the BikeMechanicsMechanic schema
      { new: true }
    ).populate("user");
    if (!mechanic) {
      return res.status(404).json({ error: "Mechanic not found" });
    }
    res.json({ message: "Mechanic approved successfully", mechanic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a list of approved mechanics
router.get("/approved", async (req, res) => {
  try {
    const approvedMechanics = await Mechanics.find({ approved: true }).populate(
      "user"
    );
    res.status(200).json(approvedMechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/unapproved", async (req, res) => {
  try {
    const unapprovedMechanics = await Mechanics.find({ approved: false });
    res.status(200).json(unapprovedMechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
