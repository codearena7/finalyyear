const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    console.log('Email service config:', {
        emailUser: process.env.EMAIL_USER,
        emailPass: process.env.EMAIL_PASS ? 'Password exists' : 'Password missing',
        clientUrl: process.env.CLIENT_URL
    });
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'MANIT Grievance Portal - Email Verification',
        html: `
            <h2>Welcome to MANIT Grievance Portal</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1a237e; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
        `
    };
    console.log('Mail options prepared:', { to: email, from: process.env.EMAIL_USER });

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

const sendPasswordResetOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'MANIT Grievance Portal - Password Reset OTP',
        html: `
            <h2>MANIT Grievance Portal - Password Reset</h2>
            <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
            <h3 style="font-size: 24px; padding: 10px; background-color: #f0f0f0; text-align: center; letter-spacing: 5px;">${otp}</h3>
            <p>This OTP will expire in 15 minutes.</p>
            <p>If you did not request a password reset, please ignore this email and ensure your account is secure.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset OTP email sent successfully');
    } catch (error) {
        console.error('Error sending password reset OTP email:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetOTP
};
