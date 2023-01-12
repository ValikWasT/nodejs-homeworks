const sgMail = require("@sendgrid/mail");
const emailsService = require("../services/emailsService");
const usersService = require("../services/usersService");

const setSuccessVerify = async (req, res) => {
  try {
    const results = await emailsService.setVerifyToken(req.params);
    if (!results) {
      res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Verification successful" });
  } catch (error) {
    res.status(400).json({ message: "Bad reques" });
  }
};

const setSecondVerify = async (req, res) => {
  if (!req.body.email) {
    res.status(400).json({ message: "missing required field email" });
  }

  try {
    const results = await usersService.getUserByEmail(req.body.email);

    if (!results) {
      res.status(404).json({ message: "User not found" });
    }

    if (results.verify) {
      res.status(400).json({ message: "Verification has already been passed" });
    }

    const { verificationToken } = results;
    sendEmail(res, verificationToken);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const sendEmail = async (res, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: "stefanyuk04@gmail.com",
    from: "stefanyuk04@gmail.com",
    subject: "Please verify your email",
    text: `Use this 'http://localhost:3000/api/contacts/users/verify/${verificationToken}' to verify email`,
    html: `<h1><a href="http://localhost:3000/api/contacts/users/verify/${verificationToken}">Click here</a> to verify your email</h1>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      res.json({ message: "Email sent" });
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  setSuccessVerify,
  setSecondVerify,
  sendEmail,
};
