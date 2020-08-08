import React from 'react';


import { filter, tap } from 'rxjs/operators';
import TimerUI from './component/TimerUI';

class UIContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      seconds: 0
    }
    // this.timerId = 0;
    // this.countDown = this.countDown.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.processEvent = this.processEvent.bind(this);
  }

  componentDidMount() {
    this.props.gameEvent$.pipe(
      filter(event => {
        if (event && 'type' in event) {
          if ('StartGame' === event.type || 'StartRound' === event.type) {
            return true;
          }
        }
        return false;
      })
    ).subscribe({
      next: (data) => {
        console.log('GameGraphic Event:', data);
        this.processEvent(data)
      }
    });
  }

  processEvent(event) {
    if ('StartGame' === event.type) {
      this.setState({
        seconds: event['endTime'],
        description: 'Game Starting in '
      });
    }
    if ('StartRound' === event.type) {
      this.setState({
        seconds: event['endTime'],
        description: 'Round Ends in '
      });
    }
  }


  openSettings() {
    console.log('settings to be implemented');
  }

  render() {
    let style = {
      'position': 'absolute'
    }
    return (
      <React.Fragment>
        {/* <i className="fa fa-cog fa-4x" style={{"color": "#fff", "position": "absolute", "bottom": 0, "padding": "8px 12px"}} aria-hidden="true" onClick={this.openSettings}></i> */}
        {/* { <div style={style}>{ Math.round(this.state.timer) }</div>} */}
        <TimerUI seconds={this.state.seconds} description={this.state.description}></TimerUI>
      </React.Fragment>
    );
  }
}

export default UIContainer;