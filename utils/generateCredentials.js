const bcrypt = require('bcryptjs');

// Generate username from name + random numbers
exports.generateUsername = (name) => {
  // Take first name, lowercase, remove spaces, add random 4-digit number
  const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `${firstName}${randomNum}`;
};

// Generate random password
exports.generatePassword = (name) => {
  const firstName = name.split(' ')[0].toLowerCase();
  const specialChars = '@#$';
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
  const randomNum = Math.floor(10 + Math.random() * 90); // 10-99
  
  // Format: name + special char + number (e.g., john@123)
  const plainPassword = `${firstName}${randomSpecial}${randomNum}`;
  
  return plainPassword;
};

// Hash password
exports.hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  return hashedPassword;
};