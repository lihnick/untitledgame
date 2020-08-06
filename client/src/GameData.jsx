import React from 'react';

import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import GameLobby from './GameLobby';
import UIContainer from './UIContainer';
import GameGraphic from './GameGraphic';

/** TODO
 * Subject "eventSubject$" from App.jsx is mapped onto a new subject "gameEvent$"
 * During mapping data may be added from GameData component so view/UI component do not need to persist data and only worry about displaying data.
 */

class GameData extends React.Component {

  // React components will only re-render when there are changes to props or state, unless forceUpdate is called.
  // class variable KEYS is used as a constant and will not change after initialization
  KEYS = {
    'ArrowUp': 38,
    'ArrowLeft': 37,
    'ArrowDown': 40,
    'ArrowRight': 39,
    'KeyW': 87,
    'KeyA': 65,
    'KeyS': 83,
    'KeyD': 68
  }
  
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      gameStarted: false,
      roundStarted: false,
      roundTimer: null,
      roundNumber: null,
      gameEvent$: null,
      directionContext: null,
      self: '',
      username: '',
      users: []
    }
    this.eventService = this.eventService.bind(this);
    this.gameLobbyService = this.gameLobbyService.bind(this);
    this.storeMessage = this.storeMessage.bind(this);
    this.transformMessage = this.transformMessage.bind(this);
    this.handleUserInput = this.handleUserInput.bind(this);
  }

  handleUserInput(event) {
    if (this.state.gameStarted && this.state.roundStarted && this.state.directionContext) {
      let payload = {x: 0, z: 0};
      switch(event.keyCode) {
        case this.KEYS.ArrowUp:
        case this.KEYS.KeyW:
          payload[this.state.directionContext['forward']['axis']] += 1 * this.state.directionContext['forward']['direction'];
          break;
        case this.KEYS.ArrowLeft:
        case this.KEYS.KeyA:
          payload[this.state.directionContext['right']['axis']] -= 1 * this.state.directionContext['right']['direction'];
          break;
        case this.KEYS.ArrowDown:
        case this.KEYS.KeyS:
          payload[this.state.directionContext['forward']['axis']] -= 1 * this.state.directionContext['forward']['direction'];
          break;
        case this.KEYS.ArrowRight:
        case this.KEYS.KeyD:
          payload[this.state.directionContext['right']['axis']] += 1 * this.state.directionContext['right']['direction'];
          break;
      }
      console.log("GameData Move:", payload);
      this.props.websocketService.playerMove(this.state.self, payload);
    }
  }

  componentDidMount() {
    this.setState({
      gameEvent$: new Subject()
    }, () => {
      this.props.eventSubject$.
      pipe(
        map(data => {
          this.storeMessage(data);
          return this.transformMessage(data);
        }),
        tap(data => {
          if (data && 'type' in data && data['type'] === 'StartRound') {
            console.log('GameData Tap:', data);
          }
        })
      ).subscribe(this.state.gameEvent$);

      this.setState({ isLoaded: true });
      document.addEventListener('keydown', this.handleUserInput);
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleUserInput);
    this.state.gameEvent$.complete();
  }

  storeMessage(json) {
    if (json && 'type' in json) {
      if ('AllUser' === json['type'] && ['self', 'users'].every(key => key in json)) {
        console.log('All User', json['users']);
        this.setState({
          self: json['self'],
          users: json['users']
        });
      }
      else if ('AddUser' === json['type'] && ['id', 'username'].every(key => key in json)) {
        console.log('Add User', json['username']);
        this.setState(prevState => ({
          users: [...prevState.users, { 'id': json['id'], 'username': json['username'] }]
        }));
      }
      else if ('DelUser' === json['type'] && ['id', 'username'].every(key => key in json)) {
        console.log('Del User', json['username']);
        let idx = this.state.users.findIndex(user => user['id'] === json['id']);
        console.log(this.state.users, idx);
        if (idx !== -1) {
          let removed = [...this.state.users];
          removed.splice(idx, 1);
          this.setState({ users: removed });
        }
      } else if ('StartGame' === json['type'] && ['id', 'map'].every(key => key in json)) {
        console.log('Start Game:', json);
        this.setState({gameStarted: true});
      }
      else if ('StartRound' === json['type'] && ['round', 'endTime'].every(key => key in json)) {
        console.info('Round Started:', json);
        this.setState({
          roundStarted: true,
          roundNumber: json['round'],
          roundTimer: json['end']
        });
      }
      else if ('PlayerMove' === json['type'] && ['id', 'vector'].every(key => key in json)) {
      }
      else {
        console.warn('GameData Unknown Data:', json);
      }
    }
  }

  transformMessage(json) {
    if (json && 'type' in json) {
      if ('StartRound' === json['type'] && ['round', 'endTime'].every(key => key in json)) {
        json['id'] = this.state.self;
      }
    }
    return json;
  }

  gameLobbyService() {
    return {
      setUsername: (name) => {
        console.log('here')
        this.setState({ username: name }, this.props.websocketService.setUsername(name));
      },
      getUsers: () => {
        return this.state.users;
      },
      startGame: (name) => {
        this.props.websocketService.startGame(name);
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
        { this.state.isLoaded && !this.state.gameStarted && <GameLobby {...this.props} gameLobbyService={this.gameLobbyService()}/> }
        { this.state.isLoaded &&  <UIContainer {...this.props} gameEvent$={this.state.gameEvent$}/> }
        {this.state.isLoaded && <GameGraphic {...this.props} gameEvent$={this.state.gameEvent$} eventService={this.eventService()}/> }
      </React.Fragment>
    );
  }
}

export default GameData;