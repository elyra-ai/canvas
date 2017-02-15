import React from 'react';

import SidePanelForms from './sidepanel-forms.jsx';
import SidePanelStyles from './sidepanel-styles.jsx';

export default class SidePanel extends React.Component {

  render() {
    var panelSize = "0px";
    if(this.props.showHideForms || this.props.showHideStyles) {
      panelSize = "200px";
    }

    var view = null;
    switch (this.props.selectedPanel) {
      case "SIDE_PANEL_FORMS":
        view = <SidePanelForms
          showHidePalette={this.props.showHidePalette}
          log={this.props.log}/>
        break;
      case "SIDE_PANEL_STYLES":
        view = <SidePanelStyles
          log={this.props.log}/>
        break;
      default:
    }

    var sidePanel = <div id="app-sidepanel" style={{width: panelSize}}>
      {view}
    </div>

    return (
      <div>{sidePanel}</div>
    );
  }
}

SidePanel.propTypes = {
  showHideForms: React.PropTypes.bool,
  showHideStyles: React.PropTypes.bool,
  selectedPanel: React.PropTypes.string,
  showHidePalette: React.PropTypes.func,
  log: React.PropTypes.func
};
