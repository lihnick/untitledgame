import React from 'react';

import initThree from './threejs/SceneManager';
import CameraControl from './threejs/CameraControl';

import { filter, tap } from 'rxjs/operators';

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
      this.props.eventService.setDirectionContext(context);
      this.props.gameEvent$.pipe(
        filter(event => {
          if (event && 'type' in event ) {
            if ('StartGame' === event.type || 'PlayerMove' === event.type || 'StartRound' === event.type) {
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
    });
  }

  processEvent(event) {
    switch(event.type) {
      case 'StartGame':
        this.state.three.loadMap(event);
        break;
      case 'PlayerMove':
        this.state.three.movePlayer(event);
        break;
      case 'StartRound':
        this.state.three.toggleInput(event);
        break;
      default:
        console.warn('Graphics - Unknown Event', event);
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