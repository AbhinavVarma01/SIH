const nodemailer = require('nodemailer');

const sendDiagnosticEmail = async (userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'thepioneers.0303@gmail.com',
        pass: 'hocmhcuehvozbozy'
      },
      debug: true,
      logger: true
    });

    await transporter.verify((error) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
        throw error;
      } else {
        console.log('SMTP Server is ready');
      }
    });

    const mailOptions = {
      from: 'thepioneers.0303@gmail.com',
      to: userEmail,
      subject: 'Welcome to Our Platform!',
      text: `Hello,\n\nWelcome! We are absolutely delighted to have you here. Your journey with us starts now, and we can't wait for you to experience all that we have to offer.\n\nBest Regards,\nThe Pioneers Team`,
      html: `
          <h1>Welcome!</h1>
          <p>Hello,</p>
          <p><strong>Welcome to our platform!</strong> We're so excited to have you with us. Your adventure begins now, and we're confident that you'll have a fantastic experience as part of our community.</p>
          <p>We've worked hard to create something special, and we hope you'll find it both rewarding and inspiring. If you ever need help or have any questions, feel free to reach out to us. We're here to support you every step of the way!</p>
          <p>Get ready for an exciting journey with us!</p>
          <br>
          <p>Warmest regards,</p>
          <p>The Pioneers Team</p>
      `
  };
  
  

    const info = await transporter.sendMail(mailOptions);
    console.log('Diagnostic Email Sent Successfully:', info);
    return info;
  } catch (error) {
    console.error('Comprehensive Email Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = { sendDiagnosticEmail };