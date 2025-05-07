const { User } = require('../models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    await User.create({
      username: 'testuser',
      password: hashedPassword,
      role: 'user'
    });

    console.log('Test user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 