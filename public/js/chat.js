'use strict';

// connect to socketio server
const socket = io();

// Elements
const textInput = document.querySelector('.textInput');
const submitForm = document.querySelector('.form');
const submitButton = document.querySelector('.submitB');
const messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#message-template-location'
).innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;
let sidebar = document.querySelector('#sidebar');

// Options
console.log(location.search);
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Auto scrolling
const autoScroll = () => {
  // New message element
  const newMessage = messages.lastElementChild;
  // New message style
  const newMessageStyle = getComputedStyle(newMessage);
  // new message margin
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  // Height of new messages
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
  // Visible height
  const visibleHeight = messages.offsetHeight;
  // Height of message
  const containerHeight = messages.scrollHeight;
  // How far have i scrolle
  const scrollOffSet = messages.scrollTop;

  if (containerHeight - newMessageHeight <= scrollOffSet)
    messages.scrollTop = messages.scrollHeight;
};

//  receiving (listening) an event from the server
socket.on('welcomeMsg', (message) => {
  // console.log(message);
  const { username, text, createdAt } = message;
  // Rendering message to the browser
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    time: moment(createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  // autoScroll();
});

// client listenting for locationMessage from server
socket.on('locationMessage', (link) => {
  console.log(link);
  const { username, url, createdAt } = link;
  // Rendering template url and append message list
  const html = Mustache.render(locationMessageTemplate, {
    username,
    url,
    time: moment(createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  // autoScroll();
});

submitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = textInput.value;
  // disable
  submitButton.setAttribute('disabled', 'disabled');

  // Client sending data to server(emit from client so server listen whwn button is clicked)
  socket.emit('sendMessage', message, (error) => {
    // enable
    submitButton.removeAttribute('disabled');
    textInput.value = '';
    submitForm.focus();
    if (error) return console.log(error);
    console.log(`The message was delivered`);
  });
});

// client listening for roomData event from server
socket.on('roomData', (data) => {
  const { room, users } = data;
  // console.log(room);
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

// sending current location
const locationButton = document.querySelector('.send-location');
locationButton.addEventListener('click', () => {
  // Getting current location
  if (!navigator.geolocation)
    return alert('Geolocation not supported by your browser');

  locationButton.setAttribute('disabled', 'disabled');

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // console.log(position);
        const { latitude, longitude } = position.coords;
        // console.log(latitude, longitude);

        // emiting the location to the server
        socket.emit('sendLocation', { latitude, longitude }, () => {
          console.log('Location shared');

          locationButton.removeAttribute('disabled');
        });
      },
      () => {
        alert('Could not get your location');
      }
    );
});

// Emitting join event to server
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
