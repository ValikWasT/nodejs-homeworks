const { User } = require("../schemas/usersSchema");

const setVerifyToken = async ({ verificationToken }) =>
  await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true }
  );

module.exports = {
  setVerifyToken,
};
