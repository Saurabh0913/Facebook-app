// Connect to server using socket.io
const socket = io();

// Join room for current user
socket.on('connect', function () {
  socket.emit('joinRoom', { userId: '<%= currentUser._id %>' });
});

// Handle receiving messages
socket.on('message', function (data) {
  // append message to chat container
  const message = data.content;
  const receiver = data.receiver;
  $('#chatContainer').append(
    '<div class="message">' +
    '<div class="message-sender">' + receiver.firstName + ':</div>' +
    '<div class="message-content">' + message + '</div>' +
    '</div>'
  );
});

// Handle sending messages
$('#sendMessageForm').on('submit', function (event) {
  event.preventDefault();
  // Get form data
  const formData = $(this).serialize();
  // Send message to server
  socket.emit('sendMessage', formData);
  // Clear input field
  $('#messageInput').val('');
});