const date = () => new Date().getTime();

const generateMessage = (username, text) => ({
  username,
  text,
  createdAt: date(),
});

const generateLocationMessage = (username, url) => ({
  username,
  url,
  createdAt: date(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
