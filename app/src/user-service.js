// user-service.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const usersFilePath = path.join(__dirname, 'users.json');


async function ensureUsersFileExists() {
  try {
    await fs.access(usersFilePath);
  } catch (error) {

    if (error.code === 'ENOENT') {
      await fs.writeFile(usersFilePath, JSON.stringify([]), 'utf-8');
    } else {
      throw error;
    }
  }
}

// Load all users
async function loadUsers() {
  await ensureUsersFileExists();
  const data = await fs.readFile(usersFilePath, 'utf-8');
  console.log("Loading users, file content:", data);
  return JSON.parse(data);
}

// Save all users
async function saveUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Create or update a user
async function createUser(username, password, isAdmin) {
  let users = await loadUsers();

  const hashedPassword = await bcrypt.hash(password, 10);

  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex > -1) {
    users[userIndex] = { username, password: hashedPassword, isAdmin };
  } else {
    users.push({ username, password: hashedPassword, isAdmin });
  }

  await saveUsers(users);
  return { username, isAdmin };
}

// Verify user login
async function verifyUser(username, password) {
  const users = await loadUsers();
  const user = users.find((user) => user.username === username);

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return { isLogged: true, isAdmin: user.isAdmin };
    }
  }

  return { isLogged: false, isAdmin: false };
}

module.exports = { createUser, verifyUser };
