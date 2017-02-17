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
import PaletteContentGridNode from './palette-content-grid-node.jsx';


class PaletteContentGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    var gridNodes = [];

    for (var i = 0; i < this.props.paletteJSON.length; i++) {
      gridNodes.push(
        <PaletteContentGridNode key={"pal_grid_node_" + i}
                                nodeTemplate={this.props.paletteJSON[i]}
                                createTempNode={this.props.createTempNode}
                                deleteTempNode={this.props.deleteTempNode}>
        </PaletteContentGridNode>
      );
    }

    let displayValue = this.props.show ? 'block' : 'none';

    return (
      <div width="100%" className="palette-scroll"
           style={{display : displayValue}}>
        {gridNodes}
      </div>
    );
  }
}

PaletteContentGrid.propTypes = {
  paletteJSON: React.PropTypes.array.isRequired
};

export default PaletteContentGrid;
