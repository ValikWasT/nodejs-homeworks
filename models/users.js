const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getValidation = require("../middlewares/validationMiddlewares");
const service = require("../services/usersService");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const emailsModels = require("../models/emails");

const addUser = async (req, res) => {
  const bodyIsValid = await getValidation.userValid(req.body);

  if (bodyIsValid.error) {
    res.status(400).json({ message: bodyIsValid.error.message });
    return;
  }

  const uniqueEmailMiddleware = await service.getUserByEmail(req.body.email);

  if (uniqueEmailMiddleware) {
    res.status(409).json({
      message: "Email in use",
    });
    return;
  }

  const { email } = req.body;
  const avatarURL = gravatar.url(email);
  req.body.avatarURL = avatarURL;
  const verificationToken = uuidv4();
  req.body.verificationToken = verificationToken;

  try {
    // const results =
    await service.createUser(req.body);
    // res.status(201).json({
    //   user: {
    //     email: results.email,
    //     subscription: results.subscription,
    //   },
    // });
    emailsModels.sendEmail(res, verificationToken);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  const bodyIsValid = await getValidation.userValid(req.body);

  if (bodyIsValid.error) {
    res.status(400).json({ message: bodyIsValid.error.message });
    return;
  }

  const user = await service.getUserByEmail(req.body.email);

  if (!user) {
    res
      .status(401)
      .json({ message: `No user with email: ${req.body.email} found` });
    return;
  }

  if (!user.verify) {
    res.status(400).json({ message: "User not verify" });
    return;
  }

  const { email, password, subscription, _id } = user;

  if (!(await bcrypt.compare(req.body.password, password))) {
    res.status(401).json({ message: "Wrong password" });
    return;
  }

  const token = jwt.sign({ _id }, process.env.JWT_SECRET);
  service.setToken(email, token);
  res.status(200).json({
    token,
    user: {
      email,
      subscription,
    },
  });
};

const logOut = (req, res) =>
  service
    .deleteToken(req.user._id)
    .then(res.status(204).json("Logout success"));

const getCurrentUser = async (req, res) => {
  const results = await service.getUserById(req.user._id);
  const { email, subscription } = results;
  res.json({ email, subscription });
};

const setKindOfSubscription = async (req, res) => {
  if (
    req.body.subscription === "starter" ||
    req.body.subscription === "pro" ||
    req.body.subscription === "business"
  ) {
    const results = await service.updateSubscription(req.body, req.user);
    const { email, subscription } = results;
    res.json({ email, subscription });
    return;
  }

  res.status(400).json({ message: "Invalid value of subscription!" });
};

module.exports = {
  addUser,
  getUser,
  logOut,
  getCurrentUser,
  setKindOfSubscription,
};
