

export default(function Websocket() {
  const socket = new WebSocket('ws://localhost:8000');

  const api = {
    socket: socket,
    setUsername: (name) => {
      console.log('Update Name:', name);
      socket.send(JSON.stringify({
        'type': 'Username',
        'username': name
      }));
    },
    startGame: (name) => {
      console.log('Start Game:', name);
      socket.send(JSON.stringify({
        'type': 'StartGame',
        'username': name
      }));
    }
  }
  return Object.seal(api);
})();