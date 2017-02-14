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

    if (this.props.stream !== null) {
      canvas = <DiagramCanvas ref="canvas"
                    stream={this.props.stream}
                    diagram={this.props.stream.diagram}
                    initialSelection={this.props.initialSelection}
                    paletteJSON={this.props.paletteJSON}
                    openPaletteMethod={this.openPalette}
                    showContextMenu={this.props.showContextMenu}
                    contextMenuInfo={this.props.contextMenuInfo}
                    openContextMenu={this.props.openContextMenu}
                    closeContextMenu={this.props.closeContextMenu}
                    contextMenuAction={this.props.contextMenuAction}
                    editDiagramHandler={this.props.editDiagramHandler}
                    nodeEditHandler={this.props.nodeEditHandler}
                    expandSuperNodeHandler={this.props.expandSuperNodeHandler}>
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
				{addButton}
				{zoomControls}
				{popupPalette}
			</div>
		);
	}
}

CommonCanvas.propTypes = {
    stream: React.PropTypes.object,
    initialSelection: React.PropTypes.object,
    paletteJSON: React.PropTypes.object,
    showContextMenu: React.PropTypes.bool,
    contextMenuInfo: React.PropTypes.object,
    openContextMenu: React.PropTypes.func,
    closeContextMenu: React.PropTypes.func.isRequired,
    contextMenuAction: React.PropTypes.func.isRequired,
    editDiagramHandler: React.PropTypes.func,
    nodeEditHandler: React.PropTypes.func,
    expandSuperNodeHandler: React.PropTypes.func
};
