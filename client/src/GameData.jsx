import React from 'react';

import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import Lobby from './Lobby';
import Graphics from './Graphics';

class GameData extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      gameStarted: false,
      roundStarted: false,
      roundTimer: null,
      roundNumber: null,
      threeEvent$: null,
      self: '',
      username: '',
      users: []
    }
    this.networkService = this.networkService.bind(this);
    this.processMessage = this.processMessage.bind(this);
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(key) {
    console.log(key.keyCode);
    if (this.state.gameStarted && this.state.roundStarted) {
      let payload = {x: 0, z: 0};
      if (key.keyCode === 119)  payload.x += 1; // w
      if (key.keyCode === 115)  payload.x -= 1; // a
      if (key.keyCode === 97)   payload.z -= 1; // s
      if (key.keyCode === 100)  payload.z += 1; // d

      this.props.socketInterface.playerMove(this.state.self, payload);
    }
  }

  componentDidMount() {
    this.setState({
      threeEvent$: new Subject()
    }, () => {
      this.props.socket$
        // .pipe(filter(data => ('type' in data && ['AllUser', 'AddUser', 'DelUser'].some(type => (type === data['type'])))))
        .subscribe({
          next: (data) => {
            this.processMessage(data);
          }
        });
      this.setState({ isLoaded: true });
        document.addEventListener('keypress', this.handleUserInput);
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.handleUserInput);
  }

  processMessage(json) {
    if (json && 'type' in json) {
      if ('AllUser' === json['type'] && 'self' in json && 'users' in json) {
        console.log('All User', json['users']);
        this.setState({
          self: json['self'],
          users: json['users']
        });
      }
      else if ('AddUser' === json['type'] && 'id' in json && 'username' in json) {
        console.log('Add User', json['username']);
        this.setState(prevState => ({
          users: [...prevState.users, { 'id': json['id'], 'username': json['username'] }]
        }));
      }
      else if ('DelUser' === json['type'] && 'id' in json && 'username' in json) {
        console.log('Del User', json['username']);
        let idx = this.state.users.findIndex(user => user['id'] === json['id']);
        console.log(this.state.users, idx);
        if (idx !== -1) {
          let removed = [...this.state.users];
          removed.splice(idx, 1);
          this.setState({ users: removed });
        }
      } else if ('StartGame' === json['type'] && 'id' in json && 'map' in json) {
        console.log('Start Game:', json);
        this.setState({gameStarted: true}, () => {
          this.state.threeEvent$.next(json);
        });
      }
      else if ('StartRound' === json['type'] && 'end' in json && 'round' in json) {
        console.info('Round Started:', json);
        this.setState({
          roundStarted: true,
          roundNumber: json['round'],
          roundTimer: json['end']
        });
      }
      else if ('PlayerMove' === json['type'] && 'id' in json && 'vector' in json) {
        this.state.threeEvent$.next(json);
      }
      else {
        console.error('GameData Unknown Data:', json);
      }
    }
  }


  networkService() {
    return {
      setUsername: (name) => {
        this.setState({ username: name }, this.props.socketInterface.setUsername(name));
      },
      getUsers: () => {
        return this.state.users;
      },
      startGame: (name) => {
        this.props.socketInterface.startGame(name);
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        { this.state.isLoaded && !this.state.gameStarted && <Lobby {...this.props} networkService={this.networkService()}/> }
        { this.state.isLoaded && <Graphics {...this.props} event$={this.state.threeEvent$} /> }
      </React.Fragment>
    );
  }
}

export default GameData;