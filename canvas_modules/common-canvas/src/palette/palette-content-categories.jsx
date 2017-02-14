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
import PaletteContentCategory from './palette-content-category.jsx'

class PaletteContentCategories extends React.Component {
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
    var catDivs = [];

    for (var i = 0; i < this.props.categories.length; i++) {
      catDivs.push(
          <PaletteContentCategory
            key={this.props.categories[i]}
            categoryName={this.props.categories[i]}
            selectedCategory={this.props.selectedCategory}
            categorySelectedMethod={this.props.categorySelectedMethod}>
          </PaletteContentCategory>
      );
    }

    return (
      <div className="palette-categories palette-scroll">
        {catDivs}
      </div>
    );
  }
}

PaletteContentCategories.propTypes = {
  categories: React.PropTypes.array.isRequired
};

export default PaletteContentCategories;
