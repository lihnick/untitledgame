import React from 'react';


class UIContainer extends React.Component {

  constructor(props) {
    super(props);
    this.openSettings = this.openSettings.bind(this);
  }

  openSettings() {
    console.log('settings to be implemented');
  }

  render() {
    return (
      <React.Fragment>
        {/* <i className="fa fa-cog fa-4x" style={{"color": "#fff", "position": "absolute", "bottom": 0, "padding": "8px 12px"}} aria-hidden="true" onClick={this.openSettings}></i> */}
        
      </React.Fragment>
    );
  }
}

export default UIContainer;