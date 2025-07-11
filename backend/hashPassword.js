import bcrypt from 'bcrypt';

const password = 'dasun';  // The plain text password you want to hash

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
}

hashPassword();
