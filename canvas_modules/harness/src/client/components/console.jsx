import React from 'react';

export default class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      consoleHeight: "10px"
    };
  }

  showHide() {
    var height = (this.state.consoleHeight === "10px") ? "200px" : "10px";
    this.setState({consoleHeight: height});
  }

  render() {
    const logs = this.props.logs.map((log, ind) => {
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
  logs: React.PropTypes.array
};
