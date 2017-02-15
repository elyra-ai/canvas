import React from 'react';
import Isvg from 'react-inlinesvg'
import ReactTooltip from 'react-tooltip'

import '../styles/App.css'

import Console from './components/console.jsx';
import SidePanel from './components/sidepanel.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logtext: "",
      paletteEnabled: false,
      sidebarFormsOpen: false,
      sidebarStylesOpen: false,
      selectedPanel: null,
      selectedLinkTypeStyle: "STRAIGHT"
    };

    this.log = this.log.bind(this);
    this.addNode = this.addNode.bind(this);
    this.delete = this.delete.bind(this);
    this.run = this.run.bind(this);

    this.palette = this.palette.bind(this);
    this.paletteNavEnabled = this.paletteNavEnabled.bind(this);

    this.sidePanelForms = this.sidePanelForms.bind(this);
    this.sidePanelStyles = this.sidePanelStyles.bind(this);
    this.setLinkTypeStyle = this.setLinkTypeStyle.bind(this);
  }

  log(text) {
    this.setState({logtext: text});
  }

  // Navbar
  addNode() {
    this.log("addNode() clicked");
  }

  delete() {
    this.log("delete() clicked");
  }

  run() {
    this.log("run() clicked");
  }

  palette() {
    this.log("palette() clicked");
    if(this.state.paletteEnabled) {
      this.log("opening palette");
    }
  }

  paletteNavEnabled(enabled) {
    this.setState({paletteEnabled: enabled});
    this.log("palette in nav bar enabled: " + enabled);
  }

  // Side Panel
  sidePanelForms() {
    this.setState({
      sidebarFormsOpen: !this.state.sidebarFormsOpen,
      sidebarStylesOpen: false,
      selectedPanel: "SIDE_PANEL_FORMS"
    });
    this.log("sidebarFormsOpen() clicked " + !this.state.sidebarFormsOpen);
  }

  sidePanelStyles() {
    this.setState({
      sidebarStylesOpen: !this.state.sidebarStylesOpen,
      sidebarFormsOpen: false,
      selectedPanel: "SIDE_PANEL_STYLES"
    });
    this.log("sidePanelStyles() clicked " + !this.state.sidebarStylesOpen);
  }

  // Styles
  setLinkTypeStyle(selectedLink) {
    this.setState({selectedLinkTypeStyle: selectedLink});
    this.log("Link type style selected: " + selectedLink);
  }

  render() {
    var paletteClass = "palette-" + this.state.paletteEnabled;

    var navBar = <div id="app-navbar">
      <div className="navbar">
        <nav id="action-bar">
          <ul className="navbar">
            <li className="navbar-li"><a id="title">Canvas Testbed</a></li>
            <li className="navbar-li" data-tip="add node"><a onClick={this.addNode.bind(this)}>
              <Isvg id="action-bar-add" src="/canvas/images/add-new_32.svg" />
              </a>
            </li>
            <li className="navbar-li" data-tip="delete"><a onClick={this.delete.bind(this)}>
                <Isvg id="action-bar-delete" src="/canvas/images/close_32.svg" />
              </a>
            </li>
            <li className="navbar-li" data-tip="run"><a onClick={this.run.bind(this)}>
                <Isvg id="action-bar-run" src="/canvas/images/play_32.svg" />
              </a>
            </li>
            <li className="navbar-li nav-divider" id={paletteClass} data-tip="palette"><a onClick={this.palette.bind(this)}>
                <Isvg id="action-bar-palette" src="/canvas/images/create-new_32.svg" />
              </a>
            </li>
            <li className="navbar-li" id="action-bar-sidepanel-styles" data-tip="open side panel: styles"><a onClick={this.sidePanelStyles.bind(this)}>
                <Isvg id="action-bar-panel-styles" src="/canvas/images/edit_32.svg" />
              </a>
            </li>
            <li className="navbar-li nav-divider" id="action-bar-sidepanel" data-tip="open side panel: forms"><a onClick={this.sidePanelForms.bind(this)}>
                <Isvg id="action-bar-panel" src="/canvas/images/justify_32.svg" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>;

    var mainView = <div id="app-container">
      {navBar}
      <SidePanel
        selectedPanel={this.state.selectedPanel}
        showHideForms={this.state.sidebarFormsOpen}
        showHidePalette={this.paletteNavEnabled}
        showHideStyles={this.state.sidebarStylesOpen}
        setLinkTypeStyle={this.setLinkTypeStyle}
        selectedLinkTypeStyle={this.state.selectedLinkTypeStyle}
        log={this.log}/>
      <div id="canvas"></div>
      <Console log={this.state.logtext}/>
      <ReactTooltip place="bottom" effect="solid"/>
    </div>

    return (
      <div>{mainView}</div>
    );
  }
}

export default App;
