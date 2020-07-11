

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
    },
    playerMove: (id, vector) => {
      console.log('Player Moving:', vector);
      socket.send(JSON.stringify({
        'type': 'PlayerMove',
        'id': id,
        'vector': vector
      }));
    }
  }
  return Object.seal(api);
})();