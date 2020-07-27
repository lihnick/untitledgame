import React from 'react';
import { withRouter } from 'react-router';

import { Subject } from 'rxjs';

import GameData from './GameData';
import Websocket from './Websocket';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      socket$: null
    }
  }

  componentDidMount() {
    this.setState({
      socket$: new Subject()
    }, () => {
      let { socket } = Websocket
      socket.onopen = (event) => {
        console.log('Connect Event:', event);
      }
      socket.onmessage = (message) => {
        let data;
        try {
          data = JSON.parse(message.data);
        } catch (error) {
          console.error('Parse Error:', message.data);
        }
        this.state.socket$.next(data);
      }
      socket.onclose = (event) => {
        console.log('Close:', event);
      }
      socket.onerror = (error) => {
        console.error('Socket Error:', error);
      }
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <React.Fragment>
        { this.state.isLoaded && <GameData {...this.props} socketInterface={Websocket} socket$={this.state.socket$}/> }
      </React.Fragment>
    );
  }
}

export default withRouter(App);
