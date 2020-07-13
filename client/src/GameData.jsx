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
      socketEvent$: null,
      directionContext: null,
      self: '',
      username: '',
      users: []
    }
    this.eventService = this.eventService.bind(this);
    this.networkService = this.networkService.bind(this);
    this.processMessage = this.processMessage.bind(this);
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(key) {
    if (this.state.gameStarted && this.state.roundStarted && this.state.directionContext) {
      let payload = {x: 0, z: 0};
      if (key.keyCode === 87) { // w
        payload[this.state.directionContext['forward']['axis']] += 1 * this.state.directionContext['forward']['direction'];
      }  
      if (key.keyCode === 65) { // a
        payload[this.state.directionContext['right']['axis']] -= 1 * this.state.directionContext['right']['direction'];
      }
      if (key.keyCode === 83) { // s
        payload[this.state.directionContext['forward']['axis']] -= 1 * this.state.directionContext['forward']['direction'];
      }
      if (key.keyCode === 68) { // d
        payload[this.state.directionContext['right']['axis']] += 1 * this.state.directionContext['right']['direction'];
      }
      console.log("GameData Move:", payload);
      this.props.socketInterface.playerMove(this.state.self, payload);
    }
  }

  componentDidMount() {
    this.setState({
      socketEvent$: new Subject()
    }, () => {
      this.props.socket$
        // .pipe(filter(data => ('type' in data && ['AllUser', 'AddUser', 'DelUser'].some(type => (type === data['type'])))))
        .subscribe({
          next: (data) => {
            this.processMessage(data);
          }
        });
      this.setState({ isLoaded: true });
        document.addEventListener('keydown', this.handleUserInput);
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleUserInput);
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
          this.state.socketEvent$.next(json);
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
        this.state.socketEvent$.next(json);
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

  eventService() {
    return {
      setDirectionContext: (context) => {
        console.log("GameData Context", context);
        this.setState({directionContext: context});
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        { this.state.isLoaded && !this.state.gameStarted && <Lobby {...this.props} networkService={this.networkService()}/> }
        {this.state.isLoaded && <Graphics {...this.props} socketEvent$={this.state.socketEvent$} parentAPI={this.eventService()}/> }
      </React.Fragment>
    );
  }
}

export default GameData;