const mongoose = require("mongoose");
const schema = mongoose.Schema;

const MechanicSchema = new schema({
  fullname: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    // required: true,
  },
  city: {
    type: String,
    // required: true,
  },
  availabilityhours: {
    type: String,
    // required: true,
  },
  services: {
    type: [String],
    // required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  latitude: {
    type: Number,
    // required: true,
  },
  longitude: {
    type: Number,
    // required: true,
  },
  servicecharges: {
    type: Number,
    // required: true,
  },
  reviews: [
    {
      userid: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      remarks: {
        type: String,
        required: true,
      },
    },
  ],
  imageUrl: {
    type: String,
    // required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Mechanics", MechanicSchema);
