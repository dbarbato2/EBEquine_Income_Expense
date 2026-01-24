const User = require("../models/AuthModel");
const jwt = require("jsonwebtoken");

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

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
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
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
    console.log('Login successful:', user._id);
    res.status(200).json({ status: true, user: user._id.toString(), name:user.name, email: user.email });
  } catch (err) {
    console.log('Login error:', err.message);
    const errors = handleErrors(err);
    res.status(400).json({ errors, status: false });
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