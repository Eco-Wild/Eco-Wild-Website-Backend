import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a transporter object using Gmail SMTP server
 const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "zachary.goldner@ethereal.email",
    pass: "7hgsvTvpMPsZHUEQq5",
  },
}); 




const sendEmail = (data) => {
  console.log(data);
  return new Promise((resolve, reject) => {
    const message = {
      from: "haileyabsera3@gmail.com",
      to: data.email,
      subject: "Registration Confirmation",
      text: ``,
      html: !data.forgot
        ? `<!DOCTYPE html>
      <html>
      <head>
        <title>Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
      
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
      
          h1 {
            text-align: center;
            color: #333333;
          }
      
          p {
            color: #555555;
            line-height: 1.5;
          }
      
          .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
          }
      
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Our Platform!</h1>
          <p>Hello,</p>
          <p>You have been invited to use the Student Information Management System!</p>
          <p>As a registered member, you'll have access to a wide range of resources and opportunities. We encourage you to explore the various features on our platform. First you must activate your account by clicking the button bellow, then setting your credentails.</p>
          <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help!</p>
          <p>Once again, welcome aboard!</p>
          <a href="http://localhost:5173/setpass/${data.invitations}" class="button">Activate Your Account</a>
        </div>
      </body>
      </html>`
        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
      text-align: center;
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.5;
    }

    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
    }

    .button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hello User,</p>
    <p>We have received a request to reset the password for this email address. If this was you, please click the button below to reset your password:</p>
    <a href="http://localhost:5173/setpass/${data.invitations}" class="button">Reset Password</a>
    <p>If you did not request a password reset, please disregard this email. Someone may have accidentally or maliciously entered your email address.</p>
    <p>For security reasons, we do not provide specific information about registered accounts. If you have any other questions or concerns, please contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
    <p>Thank you for your understanding.</p>
    <p>Best regards,<br>
    The AASTU SIMS Team</p>
  </div>
</body>
</html>`,
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.error(error);
        reject(error); // Reject the promise with the error
      } else {
        console.log("Email sent successfully!");
        resolve(info); // Resolve the promise with the info object
      }
    });
  });
};

export { sendEmail };
