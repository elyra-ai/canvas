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
      consoleout: [],
      diagramJSON: {},
      paletteJSON: {},
      paletteNavEnabled: false,
      paletteOpened: false,
      openSidepanelForms: false,
      openSidepanelStyles: false,
      selectedPanel: null,
      selectedLinkTypeStyle: "STRAIGHT"
    };

    this.log = this.log.bind(this);
    this.addNode = this.addNode.bind(this);
    this.delete = this.delete.bind(this);
    this.run = this.run.bind(this);

    this.openPalette = this.openPalette.bind(this);
    this.closePalette = this.closePalette.bind(this);
    this.enableNavPalette = this.enableNavPalette.bind(this);
    this.setPaletteJSON = this.setPaletteJSON.bind(this);
    this.setDiagramJSON = this.setDiagramJSON.bind(this);

    this.sidePanelForms = this.sidePanelForms.bind(this);
    this.sidePanelStyles = this.sidePanelStyles.bind(this);
    this.setLinkTypeStyle = this.setLinkTypeStyle.bind(this);
  }

  log(text) {
    this.setState({
      consoleout: this.state.consoleout.concat(this.getTimestamp() + text)
    });
  }

  getTimestamp(){
    return new Date().toLocaleString() + ": ";
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

  // Palette
  openPalette() {
    if(this.state.paletteNavEnabled) {
      this.log("opening palette");
      this.setState({paletteOpened: true});
    }
  }

  closePalette() {
    this.setState({paletteOpened: false});
  }

  enableNavPalette(enabled) {
    this.setState({paletteNavEnabled: enabled});
    // this.log("palette in nav bar enabled: " + enabled);
  }

  setPaletteJSON(paletteJson) {
    this.setState({paletteJSON: paletteJson});
    this.log("set paletteJSON: " + JSON.stringify(paletteJson));
  }

  setDiagramJSON(diagramJson) {
    this.setState({diagramJSON: diagramJson});
    this.log("set diagramJSON: " + JSON.stringify(diagramJson));
  }

  // Side Panel
  sidePanelForms() {
    this.setState({
      openSidepanelForms: !this.state.openSidepanelForms,
      openSidepanelStyles: false,
      selectedPanel: "SIDE_PANEL_FORMS"
    });
    this.log("openSidepanelForms() clicked " + !this.state.openSidepanelForms);
  }

  sidePanelStyles() {
    this.setState({
      openSidepanelStyles: !this.state.openSidepanelStyles,
      openSidepanelForms: false,
      selectedPanel: "SIDE_PANEL_STYLES"
    });
    this.log("sidePanelStyles() clicked " + !this.state.openSidepanelStyles);
  }

  // Styles
  setLinkTypeStyle(selectedLink) {
    this.setState({selectedLinkTypeStyle: selectedLink});
    this.log("Link type style selected: " + selectedLink);
  }

  render() {
    var paletteClass = "palette-" + this.state.paletteNavEnabled;

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
            <li className="navbar-li nav-divider" id={paletteClass} data-tip="palette"><a onClick={this.openPalette.bind(this)}>
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
        enableNavPalette={this.enableNavPalette}
        openSidepanelForms={this.state.openSidepanelForms}
        openSidepanelStyles={this.state.openSidepanelStyles}
        setDiagramJSON={this.setDiagramJSON}
        setPaletteJSON={this.setPaletteJSON}
        setLinkTypeStyle={this.setLinkTypeStyle}
        selectedLinkTypeStyle={this.state.selectedLinkTypeStyle}
        log={this.log}/>
      <div id="canvas"></div>
      <Console logs={this.state.consoleout}/>
      <ReactTooltip place="bottom" effect="solid"/>
    </div>

    return (
      <div>{mainView}</div>
    );
  }
}

export default App;
