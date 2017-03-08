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
import Isvg from 'react-inlinesvg';
import ThreeWayIcon from './three-way-icon.jsx';
import Close32Image from '../../assets/images/close_32.svg'
import PaletteGridSelectedIcon from "../../assets/images/palette_grid_selected.svg"
import PaletteGridHoverIcon from "../../assets/images/palette_grid_hover.svg"
import PaletteGridDeSelectedIcon from "../../assets/images/palette_grid_deselected.svg"
import PaletteListSelectedIcon from "../../assets/images/palette_list_selected.svg"
import PaletteListHoverIcon from "../../assets/images/palette_list_hover.svg"
import PaletteListDeSelectedIcon from "../../assets/images/palette_list_deselected.svg"

class PaletteTopbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.mouseDown = this.mouseDown.bind(this);
    this.doubleClick = this.doubleClick.bind(this);
    this.close = this.close.bind(this);
    this.gridViewSelected = this.gridViewSelected.bind(this);
    this.listViewSelected = this.listViewSelected.bind(this);
  }

  mouseDown(event){
    this.props.mouseDownMethod(event);
  }

  doubleClick(){
    this.props.windowMaximizeMethod(event);
  }

  close(event){
    this.props.closeMethod(event);
  }

  gridViewSelected(){
    this.props.showGridMethod(true);
  }

  listViewSelected(){
    this.props.showGridMethod(false);
  }

  render() {
    return (
      <div className="palette-topbar" onMouseDown={this.mouseDown} onDoubleClick={this.doubleClick}>
          <span className="left-navbar">
            <ThreeWayIcon iconClickedMethod={this.gridViewSelected}
                          isSelected={this.props.showGrid}
                          selectedIconName={PaletteGridSelectedIcon}
                          hoverIconName={PaletteGridHoverIcon}
                          deselectedIconName={PaletteGridDeSelectedIcon}/>
            <ThreeWayIcon iconClickedMethod={this.listViewSelected}
                          isSelected={!this.props.showGrid}
                          selectedIconName={PaletteListSelectedIcon}
                          hoverIconName={PaletteListHoverIcon}
                          deselectedIconName={PaletteListDeSelectedIcon}/>
          </span>
          <span className="right-navbar">
            <a className="secondary-action" onClick={this.close}>
              <Isvg src={Close32Icon} className="close-icon"/>
            </a>
          </span>
      </div>
    );
  }
}

PaletteTopbar.propTypes = {
  showGridMethod: React.PropTypes.func.isRequired,
  windowMaximizeMethod: React.PropTypes.func.isRequired,
  showGrid: React.PropTypes.bool.isRequired
};

export default PaletteTopbar;
