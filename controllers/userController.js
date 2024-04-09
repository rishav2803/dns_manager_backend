const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      return res.json({
        mssg: "Username or email already exists",
        status: false,
      });
    }

    const newUser = new User({ userName, email, password });
    await newUser.save();

    res.json({ status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

module.exports.logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        mssg: "Incorrect email or password",
        status: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        mssg: "Incorrect email or password",
        status: false,
      });
    }

    res.json({ status: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};
