/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import DiagramCanvas from './diagram-canvas.jsx';
import Palette from './palette/palette.jsx';


export default class CommonCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPaletteOpen: false
    };

    this.openPalette = this.openPalette.bind(this);
    this.closePalette = this.closePalette.bind(this);

    this.createTempNode = this.createTempNode.bind(this);
    this.deleteTempNode = this.deleteTempNode.bind(this);

    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
  }

  openPalette() {
    this.setState({isPaletteOpen: true});
  }

  closePalette() {
    this.setState({isPaletteOpen: false});
  }

  createTempNode(paletteId) {
    return this.refs.canvas.createTempNode(paletteId);
  }

  deleteTempNode(paletteId) {
    return this.refs.canvas.deleteTempNode(paletteId);
  }

  zoomIn() {
    this.refs.canvas.zoomIn();
  }

  zoomOut() {
    this.refs.canvas.zoomOut();
  }

  render() {
    let canvas = <div></div>;
    let popupPalette = <div></div>;
    let addButton = <div></div>;
    let zoomControls = <div></div>;

    if (this.props.diagram !== null) {
      canvas = <DiagramCanvas ref="canvas"
                    diagram={this.props.diagram}
                    initialSelection={this.props.initialSelection}
                    paletteJSON={this.props.paletteJSON}
                    openPaletteMethod={this.openPalette}
                    contextMenuHandler={this.props.contextMenuHandler}
                    contextMenuActionHandler={this.props.contextMenuActionHandler}
                    editDiagramHandler={this.props.editDiagramHandler}
                    nodeDblClickedHandler={this.props.nodeDblClickedHandler}
                    decorationActionHandler={this.props.decorationActionHandler}>
                </DiagramCanvas>;
      popupPalette = <Palette paletteJSON={this.props.paletteJSON}
                    showPalette={this.state.isPaletteOpen}
                    closePalette={this.closePalette}
                    createTempNode={this.createTempNode}
                    deleteTempNode={this.deleteTempNode}>
                </Palette>;

      let paletteTooltip=<Tooltip id="paletteTooltip"><FormattedMessage id="tooltip.popupPaletteButton"/></Tooltip>;

      addButton =
        <OverlayTrigger placement="right" overlay={paletteTooltip}>
          <div className="palette-show-button">
            <img src="/canvas/images/add-new_64.svg" onClick={this.openPalette}/>
          </div>
        </OverlayTrigger>;

      zoomControls =
          <div className="canvas-zoom-controls">
            <div><img src="/canvas/images/zoom-in_24.svg" onClick={this.zoomIn}/></div>
            <div><img src="/canvas/images/zoom-out_24.svg" onClick={this.zoomOut}/></div>
          </div>;
    }

    return (
      <div className="fill-vertical">
        {canvas}
        {zoomControls}
        {addButton}
        {popupPalette}
      </div>
		);
	}
}

CommonCanvas.propTypes = {
    diagram: React.PropTypes.object,
    initialSelection: React.PropTypes.object,
    paletteJSON: React.PropTypes.object,
    contextMenuHandler: React.PropTypes.func,
    contextMenuActionHandler: React.PropTypes.func,
    editDiagramHandler: React.PropTypes.func,
    nodeDblClickedHandler: React.PropTypes.func,
    decorationActionHandler: React.PropTypes.func
};
