const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Sequelize, Model, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

// Initialize Sequelize and the User model
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'database.sqlite' });

class User extends Model {}
User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, modelName: 'user' });

sequelize.sync();

// Set up Nodemailer
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: 'adityaprasetyakusnadi@yahoo.com',
    pass: '$pr0fita0304!',
  },
});

// Helper function to send a welcome email
async function sendWelcomeEmail(email) {
  const mailOptions = {
    from: 'adityaprasetyakusnadi@yahoo.com',
    to: email,
    subject: 'Welcome to our API',
    text: 'Thank you for signing up!',
  };

  await transporter.sendMail(mailOptions);
}

// User registration API endpoint
app.post('/register', [
  check('email').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    await sendWelcomeEmail(email);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
