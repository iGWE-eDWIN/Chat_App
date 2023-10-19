const users = [];

console.log(users);

// addUser
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // Validate data
  if (!username || !room)
    return {
      error: 'User and room required',
    };
  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );
  // validate username
  if (existingUser)
    return {
      error: 'Username alredy exists',
    };
  // Store user
  const user = { id, username, room };
  users.push(user);
  return user;
};

// removeUser
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  // remove found user
  if (index !== -1) return users.splice(index, 1)[0];
};

// getUser
const getUser = (id) => users.find((user) => user.id === id);

// getUsersInRoom
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
