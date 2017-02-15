import React from 'react';

export default class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consoleout: [],
      consoleHeight: "10px"
    };

    // this.log = this.log.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.log !== undefined && newProps.log !== null) {
      this.setState({
        consoleout: this.state.consoleout.concat(this.getTimestamp() + newProps.log)
      });
    }
  }

  getTimestamp(){
    return new Date().toLocaleString() + ": ";
  }

  showHide() {
    var height = (this.state.consoleHeight === "10px") ? "200px" : "10px";
    this.setState({consoleHeight: height});
  }

  render() {
    const logs = this.state.consoleout.map((log, ind) => {
      return (
        <li key={ind}>{log}</li>
      );
    });

    var console = <div id="app-console" onClick={this.showHide.bind(this)} style={{height: this.state.consoleHeight}}>
      <ul>{logs}</ul>
    </div>

    return (
      <div>{console}</div>
    );
  }
}

Console.propTypes = {
  log: React.PropTypes.string
};
