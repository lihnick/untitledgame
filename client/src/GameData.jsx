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
      showLobby: true,
      threeEvent$: null,
      self: '',
      username: '',
      users: []
    }
    this.networkService = this.networkService.bind(this);
    this.processMessage = this.processMessage.bind(this);
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
      this.setState({
        isLoaded: true
      });
    });
    
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
        console.log('Start Game by', json['id']);
        this.setState({showLobby: false}, () => {
          this.state.threeEvent$.next(json);
        });
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
        { this.state.isLoaded && this.state.showLobby && <Lobby {...this.props} networkService={this.networkService()}/> }
        { this.state.isLoaded && <Graphics {...this.props} event$={this.state.threeEvent$} /> }
      </React.Fragment>
    );
  }
}

export default GameData;