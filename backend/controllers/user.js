const User = require("../models/AuthModel");
const PasswordReset = require("../models/PasswordResetModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret key", {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  console.log('Error details:', err.message, err.code);
  
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register attempt:', { name, email, passwordLength: password?.length });
    
    if (!email || !password || !name) {
      return res.status(400).json({ errors: { email: "All fields are required" }, created: false });
    }
    
    const user = await User.create({ name, email, password });
    const token = createToken(user._id);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("jwt", token, {
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    });

    console.log('User registered successfully:', user._id);
    res.status(201).json({ status: true, user: user._id.toString(), name: user.name, email: user.email });
  } catch (err) {
    console.log('Register error:', err.message);
    const errors = handleErrors(err);
    res.status(400).json({ errors, created: false });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt:', email);
    const user = await User.login(email.toLowerCase().trim(), password);
    const token = createToken(user._id);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000, sameSite: isProduction ? 'none' : 'lax', secure: isProduction });
    console.log('Login successful:', user._id);
    res.status(200).json({ status: true, user: user._id.toString(), name:user.name, email: user.email });
  } catch (err) {
    console.log('Login error:', err.message);
    const errors = handleErrors(err);
    res.status(400).json({ errors, status: false });
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Generic response prevents email enumeration attacks
  const genericResponse = { status: true, message: 'If that email is registered, a password reset link has been sent.' };

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json(genericResponse);

    // Remove any existing tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate a secure random token and store its SHA-256 hash
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"EB Equine" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - EB Equine',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #222260; margin-bottom: 8px;">EB Equine — Password Reset</h2>
          <p style="color: #444;">You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: #222260; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset My Password
          </a>
          <p style="color: #888; font-size: 0.88rem;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #888; font-size: 0.88rem;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
          <p style="color: #aaa; font-size: 0.8rem;">EB Equine Income &amp; Expense Tracker</p>
        </div>
      `
    });

    res.status(200).json(genericResponse);
  } catch (err) {
    console.log('Forgot password error:', err.message);
    res.status(500).json({ status: false, message: 'An error occurred. Please try again.' });
  }
};

module.exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ status: false, message: 'Reset token is missing.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ status: false, message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ status: false, message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ _id: resetRecord.userId }, { $set: { password: hashedPassword } });
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.status(200).json({ status: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.log('Reset password error:', err.message);
    res.status(500).json({ status: false, message: 'An error occurred. Please try again.' });
  }
};

module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ status: false, message: "Not authenticated" });
  }

  try {
    const decodedToken = jwt.verify(token, "secret key");
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const auth = await bcrypt.compare(currentPassword, user.password);
    if (!auth) {
      return res.status(400).json({ status: false, message: "Current password is incorrect" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ status: false, message: "New password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    res.status(200).json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    console.log('Change password error:', err.message);
    res.status(500).json({ status: false, message: "An error occurred" });
  }
};

module.exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(
        token,
        "secret key",
        async (err, decodedToken) => {
          if (err) {
            res.json({ status: false });
            next();
          } else {
            const user = await User.findById(decodedToken.id);
            if (user) res.json({ status: true, user: user._id.toString(), name:user.name, email: user.email });
            else res.json({ status: false });
            next();
          }
        }
      );
    } else {
      res.json({ status: false });
      next();
    }
  };