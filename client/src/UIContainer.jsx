import React from 'react';

import { filter, tap } from 'rxjs/operators';

class UIContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timer: 0
    }
    this.timerId = 0;
    this.countDown = this.countDown.bind(this);
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
    console.log('UIContainer:', event);
    if ('StartGame' === event.type) {
      this.setState({
        timer: (event['endTime'] - Date.now()) / 1000
      }, () => {
        this.timerId = setInterval(this.countDown, 1000);
      });
    }
  }

  countDown() {
    // remove one second and set state to trigger re-render
    let seconds = this.state.timer - 1;
    this.setState({
      timer: seconds
    })

    if (seconds <= 0) {
      console.log('Stopping Interval');
      clearInterval(this.timerId);
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
        { <div style={style}>{ Math.round(this.state.timer) }</div>}
      </React.Fragment>
    );
  }
}

export default UIContainer;