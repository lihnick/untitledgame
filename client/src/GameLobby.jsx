import React from 'react';

class GameLobby extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: ''
    }
    this.enterPress = this.enterPress.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  enterPress(key) {
    if (key.keyCode === 13) {
      this.props.gameLobbyService.setUsername(this.state.username);
    }
  }

  usernameChange(name) {
    this.setState({ username: name.target.value });
  }

  startGame() {
    this.props.gameLobbyService.startGame(this.state.username);
  }

  render() {
    let users = this.props.gameLobbyService.getUsers();

    return (
      <React.Fragment>
        <div className="center-items">
          { users.length === 0 &&
            <input type="text" onKeyDown={this.enterPress} onChange={this.usernameChange} maxLength="18" placeholder="Nick"/>
          }
          { users.length > 0 && 
            <div className="lobby-container">
              {users.map((item, index) => {
                return <div key={index}>{item['username']}</div> 
              })}
              <button onClick={this.startGame}>Start</button>
            </div>
          }
        </div>
      </React.Fragment>
    )
  }
}

export default GameLobby;