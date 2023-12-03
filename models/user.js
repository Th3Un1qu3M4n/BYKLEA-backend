const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const schema = mongoose.Schema;

const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isverified: {
    type: Boolean,
    default: false,
  },
  verifycode: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hash = await bcrypt.hash(this["password"], 10);
    this["password"] = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    contact: Joi.string().optional().label("contact"),
    servicecharges: Joi.string().optional().label("servicecharges"),
    lat: Joi.optional().label("lat"),
    lng: Joi.optional().label("lng"),
  });
  return schema.validate(data);
};
const User = mongoose.model("User", userSchema);

module.exports = { User, validate };
