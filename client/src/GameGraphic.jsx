import React from 'react';

import initThree from './threejs/SceneManager';
import CameraControl from './threejs/CameraControl';

class GameGraphic extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      three: null
    }
    this.threeRef = React.createRef();
    this.processEvent = this.processEvent.bind(this);
  }

  componentDidMount() {
    console.log(this.threeRef.current);
    this.setState({
      three: initThree(this.threeRef.current)
    }, () => {
      this.state.three.init();
      let context = this.state.three.directionVector();
      console.log(this.props);
      this.props.parentAPI.setDirectionContext(context);
      this.props.gameEvent$.subscribe({
        next: (data) => this.processEvent(data)
      });
    });
  }

  processEvent(event) {
    if (event && 'type' in event) {
      if ('StartGame' === event['type'] && 'id' in event && 'map' in event) {
        this.state.three.loadMap(event);
      }
      else if ('PlayerMove' === event['type'] && 'id' in event && 'vector' in event) {
        this.state.three.movePlayer(event);
      }
      else if ('StartRound' === event['type']) {
        this.state.three.updateInput(event);
      }
      else {
        console.error('Graphics - Unknown Event:', event);
      }
    }
  }

  // tabindex is used to make any element focusable
  render() {
    return (
      <canvas id="canvas" tabIndex="1" ref={this.threeRef}/>
    );
  }
}

export default GameGraphic;