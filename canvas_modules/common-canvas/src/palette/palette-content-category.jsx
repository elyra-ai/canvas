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

class PaletteContentCategory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.categorySelected = this.categorySelected.bind(this);
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  categorySelected(event) {
    this.props.categorySelectedMethod(event);
  }

  render() {
    var style = "palette-category";

    if (this.props.selectedCategory === this.props.categoryName) {
      style = "palette-category-selected";
    }

    return (
      <div className={style} onClick={this.categorySelected}>
        {this.props.categoryName}
      </div>
    );
  }
}

PaletteContentCategory.propTypes = {
  categoryName: React.PropTypes.string.isRequired,
  selectedCategory: React.PropTypes.string.isRequired,
  categorySelectedMethod: React.PropTypes.func.isRequired
};

export default PaletteContentCategory;
