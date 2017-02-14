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

import React from 'react'
import ReactDOM from 'react-dom'
import PaletteContentListItem from './palette-content-list-item.jsx'

class PaletteContentList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  render() {
    var contentItems = [];

    for (var i = 0; i < this.props.paletteJSON.length; i++) {
      var itemKey = "item_" + i;

      contentItems.push(
        <div key={itemKey}>
          <PaletteContentListItem
               nodeTemplate={this.props.paletteJSON[i]}
               createTempNode={this.props.createTempNode}
               deleteTempNode={this.props.deleteTempNode}>
          </PaletteContentListItem>
        </div>
      );
    }

    let displayValue = this.props.show ? 'block' : 'none';

    return (
      <div width="100%" draggable="false" className="palette-content-list palette-scroll"
           style={{display : displayValue}}>
        {contentItems}
      </div>
    );
  }
}

PaletteContentList.propTypes = {
  paletteJSON: React.PropTypes.array.isRequired
};

export default PaletteContentList;
