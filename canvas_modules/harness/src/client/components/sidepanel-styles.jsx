import React from 'react';

export default class SidePanelStyles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLinkStyle: "STRAIGHT"
    };

    this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
  }

  linkTypeOptionChange(changeEvent) {
    this.setState({
      selectedLinkStyle: changeEvent.target.value
    });
    this.props.log("Link style selected: " + changeEvent.target.value);
  }

  render() {
    var divider = <div className="sidepanel-children sidepanel-divider"/>

    var linkStyle = <div className="sidepanel-children" id="sidepanel-style-links">
      <form>
        <div className="sidepanel-headers">Link Types</div>
        <div className="sidepanel-radio">
            <input type="radio" value="STRAIGHT"
                  checked={this.state.selectedLinkStyle === 'STRAIGHT'}
                  onChange={this.linkTypeOptionChange} />
                Straight
        </div>
        <div className="sidepanel-radio">
            <input type="radio" value="CURVE"
                  checked={this.state.selectedLinkStyle === 'CURVE'}
                  onChange={this.linkTypeOptionChange} />
                Curve
        </div>
        <div className="sidepanel-radio">
            <input type="radio" value="ELBOW"
                  checked={this.state.selectedLinkStyle === 'ELBOW'}
                  onChange={this.linkTypeOptionChange} />
                Elbow
        </div>
      </form>
    </div>

    return (
      <div>
        {linkStyle}
        {divider}
      </div>
    );
  }
}

SidePanelStyles.propTypes = {
  log: React.PropTypes.func
};
