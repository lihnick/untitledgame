import React from 'react';

import initThree from './threejs/SceneManager';

class Graphics extends React.Component {

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
      this.props.event$.subscribe({
        next: (data) => this.processEvent(data)
      });
    });
  }

  processEvent(event) {
    if (event && 'type' in event) {
      if ('StartGame' === event['type'] && 'id' in event && 'map' in event) {
        this.state.three.loadMap(event['map']);
      } else {
        console.error('Graphics - Unknown Event:', event);
      }
    }
  }

  render() {
    return (
      <canvas ref={this.threeRef}/>
    );
  }
}

export default Graphics;