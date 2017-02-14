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
import PaletteContentCategories from './palette-content-categories.jsx'
import PaletteContentGrid from './palette-content-grid.jsx'
import PaletteContentList from './palette-content-list.jsx'

class PaletteContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: ""
    };

    this.categorySelected = this.categorySelected.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getJSONForSelectedCategory = this.getJSONForSelectedCategory.bind(this);
  }

  componentWillReceiveProps() {
    // We get the paletteJSON after the initial render so set the
    // default selected category when it is recieved.
    if (this.props.paletteJSON &&
        this.props.paletteJSON.categories &&
        this.props.paletteJSON.categories.length > 0 &&
        this.state.selectedCategory === "") {
      this.setState({selectedCategory: this.props.paletteJSON.categories[0].label});
    }
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  categorySelected(event) {
    this.setState({selectedCategory: event.target.firstChild.data});
  }

  getCategories(categories) {
    var out = [];

    if (categories) {
      for (var i = 0; i < categories.length; i++) {
        if (out.indexOf(categories[i].label) == -1) {
          out.push(categories[i].label);
        }
      }
    }
    return out;
  }

  getJSONForSelectedCategory(categories) {
    var out = [];

    if (categories) {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].label === this.state.selectedCategory) {
          out = categories[i].nodetypes;
        }
      }
    }
    return out;
  }

  render() {

    var cats = this.getCategories(this.props.paletteJSON.categories);
    var categoryJSON = this.getJSONForSelectedCategory(this.props.paletteJSON.categories);

    return (
      <div className="palette-content" ref="palettecontent">
        <PaletteContentCategories categories={cats}
                                  selectedCategory={this.state.selectedCategory}
                                  categorySelectedMethod={this.categorySelected}>
        </PaletteContentCategories>
        <PaletteContentGrid show={this.props.showGrid}
                            paletteJSON={categoryJSON}
                            createTempNode={this.props.createTempNode}
                            deleteTempNode={this.props.deleteTempNode}>
        </PaletteContentGrid>
        <PaletteContentList show={!this.props.showGrid}
                            paletteJSON={categoryJSON}
                            createTempNode={this.props.createTempNode}
                            deleteTempNode={this.props.deleteTempNode}>
        </PaletteContentList>
      </div>
    );
  }
}

PaletteContent.propTypes = {
  paletteJSON: React.PropTypes.object.isRequired,
  showGrid: React.PropTypes.bool.isRequired
};

export default PaletteContent;
