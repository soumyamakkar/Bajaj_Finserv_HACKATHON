const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 2525,
  secure:false,
  auth: {
    user: "vmeet", 
    pass: "B2UNHSUqt366mM0f", 
  },
});



module.exports = transporter;
