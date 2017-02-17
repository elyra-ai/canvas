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
import PaletteTopbar from './palette-topbar.jsx';
import PaletteContent from './palette-content.jsx';


class Palette extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      xPos: 100,
      yPos: 100,
      showGrid: true
    };

    this.showGrid = this.showGrid.bind(this);
    this.mouseDownOnTopBar = this.mouseDownOnTopBar.bind(this);
    this.mouseDownOnPalette = this.mouseDownOnPalette.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.windowResize = this.windowResize.bind(this);
    this.windowMaximize = this.windowMaximize.bind(this);

    // These variables are used when dragging the palette.
    this.dragging = false;
    this.dragOffsetY = 0;
    this.dragOffsetX = 0;

    // verticalSizingAction and verticalSizingHover can be set to top or bottom
    this.verticalSizingAction = "";
    this.verticalSizingHover = "";

    // horizontalSizingAction and horizontalSizingHover can be set to left or right
    this.horizontalSizingAction = "";
    this.hoizontalSizingHover = "";

    // These variables store the palette dimensions
    this.savedWidth = 0;
    this.savedLeft = 0;
    this.savedHeight = 0;
    this.savedTop = 0;

    // hoverZoneSize is the number of pixels around the palette where the
    // sizing cursor will appear (which allows the user to size the window).
    this.hoverZoneSize = 3;
    this.totalHoverZoneSize = this.hoverZoneSize * 2;

    // Need to control min width and min height in code to avoid CSS problems
    this.topbarHeight = 40;
    this.minWidth = 238;   // minWidth = grid_node_width + category_min_width + (2 * hoverZoneSize)
    this.minHeight = 156;  // minHeight = grid_node_height + topbarHeight + (2 * hoverZoneSize)

    // Boolean to remember whether we are maximized or not. This gets set to
    // false when doing a manual resize of the palette.
    this.isMaximized = false;

    this.paletteNodes = [];

    // Correction for palette cursor position
    // Used in both hoverzone detection and mouseMove vertical resize at bottom of paletteDiv
    this.hackPaletteOffset = 48;

    window.addEventListener("mousemove", this.mouseMove, false);
    window.addEventListener("mouseup", this.mouseUp, false);
    window.addEventListener("resize", this.windowResize, false);
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    // After the palette has rendered ensure the palette is visible in
    // whatever size the canvas happens to be. This can be done by doing
    // the same activity as we perform when the browser window is sized.
    this.windowResize();
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp);
    window.removeEventListener("resize", this.windowResize);
  }

  mouseDownOnTopBar(event){
    this.dragging = true;
    let paletteDiv = ReactDOM.findDOMNode(this.refs.palette);
    this.dragOffsetX = event.clientX - paletteDiv.offsetLeft;
    this.dragOffsetY = event.clientY - paletteDiv.offsetTop;
  }

  mouseDownOnPalette(event){
    let paletteDiv = ReactDOM.findDOMNode(this.refs.palette);

    if (this.verticalSizingHover !== "" ||
        this.horizontalSizingHover !== "") {
      this.verticalSizingAction = this.verticalSizingHover;
      this.horizontalSizingAction = this.horizontalSizingHover;
      this.savedWidth = paletteDiv.offsetWidth;
      this.savedLeft = paletteDiv.offsetLeft;
      this.savedHeight = paletteDiv.offsetHeight;
      this.savedTop = paletteDiv.offsetTop;
    }
  }

  mouseMove (event){
    let paletteDiv = ReactDOM.findDOMNode(this.refs.palette);
    let canvasDiv = document.getElementById("canvas-div");

    // First, see if we are doing a sizing action (i.e. the user has
    // done mouse down when in sizing hover zone) and take appropriate
    // sizing action.
    if (this.verticalSizingAction !== "" ||
        this.horizontalSizingAction !== "") {
      // When manually resizing, set isMaximized to false in case the user
      // is resizing a maximized window.
      this.isMaximized = false;

      if (this.horizontalSizingAction == "left") {
        let eventClientX = this.getAdjustedMousePositionLeft(event, canvasDiv);
        let newWidth = this.savedWidth - (eventClientX - this.savedLeft);

        if (newWidth <= this.minWidth) {
          paletteDiv.style.width = this.minWidth  + "px";
        } else {
          paletteDiv.style.width = newWidth  + "px";
          paletteDiv.style.left = eventClientX + "px";
        }
      }

      if (this.horizontalSizingAction == "right") {
        let eventClientX = this.getAdjustedMousePositionRight(event, canvasDiv);
        let newWidth = (eventClientX - this.savedLeft);

        if (newWidth <= this.minWidth) {
          newWidth = this.minWidth;
        }
        paletteDiv.style.width = newWidth  + "px";
      }

      if (this.verticalSizingAction == "top") {
        let eventClientY = this.getAdjustedMousePositionTop(event, canvasDiv);
        let newHeight = this.savedHeight - (eventClientY - this.savedTop);

        if (newHeight <= this.minHeight) {
          paletteDiv.style.height = this.minHeight  + "px";
          this.setContentDivHeight(paletteDiv, this.minHeight);
        } else {
          paletteDiv.style.height = newHeight  + "px";
          paletteDiv.style.top = eventClientY + "px";
          this.setContentDivHeight(paletteDiv, newHeight);
        }
      }

      if (this.verticalSizingAction == "bottom") {
        let eventClientY = this.getAdjustedMousePositionBottom(event, canvasDiv);
        let newHeight = eventClientY - this.savedTop - this.hackPaletteOffset;

        if (newHeight <= this.minHeight) {
          newHeight = this.minHeight;
        }
        paletteDiv.style.height = newHeight  + "px";
        this.setContentDivHeight(paletteDiv, newHeight);
      }

    // Now, if no sizing behavior is going on we handle topbar drag
    // behavior (after the sizing behaviors) so sizing takes
    // precedence over dragging the window.
    } else if (this.dragging === true) {
      let newLeft = event.clientX - this.dragOffsetX;
      let newTop = event.clientY - this.dragOffsetY;

      if (newLeft < canvasDiv.offsetLeft + this.hoverZoneSize ) {
        newLeft = canvasDiv.offsetLeft + this.hoverZoneSize;
      }
      if (newTop < canvasDiv.offsetTop + this.hoverZoneSize) {
        newTop = canvasDiv.offsetTop + this.hoverZoneSize;
      }
      if (newLeft + paletteDiv.offsetWidth > canvasDiv.offsetLeft + canvasDiv.offsetWidth) {
        newLeft = canvasDiv.offsetLeft + canvasDiv.offsetWidth - paletteDiv.offsetWidth - this.hoverZoneSize;
      }
      if (newTop + paletteDiv.offsetHeight > canvasDiv.offsetTop + canvasDiv.offsetHeight) {
        newTop = canvasDiv.offsetTop + canvasDiv.offsetHeight - paletteDiv.offsetHeight - this.hoverZoneSize;
      }

      paletteDiv.style.left = newLeft + "px";
      paletteDiv.style.top = newTop + "px";

    // Finally, if no sizing or dragging is going on, we look to see if
    // the user is hovering the pointer near the palette edges so we can
    // display an appropriate sizing cursor.
    } else {
      if (event.clientX > paletteDiv.offsetLeft &&
          event.clientX < paletteDiv.offsetLeft + (this.totalHoverZoneSize)) {
        this.horizontalSizingHover = "left";

      } else if (event.clientX < paletteDiv.offsetLeft + paletteDiv.offsetWidth &&
                 event.clientX > paletteDiv.offsetLeft + paletteDiv.offsetWidth - this.totalHoverZoneSize) {
        this.horizontalSizingHover = "right";

      } else {
        this.horizontalSizingHover = "";
        this.horizontalSizingAction = "";
      }

      if (event.clientY > paletteDiv.offsetTop &&
          event.clientY < paletteDiv.offsetTop + this.totalHoverZoneSize) {
        this.verticalSizingHover = "top";

       } else if (event.clientY < paletteDiv.offsetTop + paletteDiv.offsetHeight + this.hackPaletteOffset &&
                  event.clientY > paletteDiv.offsetTop + paletteDiv.offsetHeight + this.hackPaletteOffset - this.totalHoverZoneSize) {
        this.verticalSizingHover = "bottom";

      } else {
        this.verticalSizingHover = "";
        this.verticalSizingAction = "";
      }

      if (this.verticalSizingHover === "top") {
        if (this.horizontalSizingHover === "left") {
          paletteDiv.style.cursor = "nwse-resize";
        } else if (this.horizontalSizingHover === "right") {
          paletteDiv.style.cursor = "nesw-resize";
        } else {
          paletteDiv.style.cursor = "ns-resize";
        }
      } else if (this.verticalSizingHover === "bottom") {
        if (this.horizontalSizingHover === "left") {
          paletteDiv.style.cursor = "nesw-resize";
        } else if (this.horizontalSizingHover === "right") {
          paletteDiv.style.cursor = "nwse-resize";
        } else {
          paletteDiv.style.cursor = "ns-resize";
        }
      } else if (this.horizontalSizingHover === "left" ||
                 this.horizontalSizingHover === "right") {
        paletteDiv.style.cursor = "ew-resize";

      } else {
        paletteDiv.style.cursor = "default";
      }
    }
  }

  // Sets the size of the content div, and the divs inside content div, so
  // they adopt the same height as the palette.
  setContentDivHeight (paletteDiv, newHeight) {
    let newContentHeight = (newHeight - this.topbarHeight - this.totalHoverZoneSize)  + "px";
    let contentDiv = paletteDiv.childNodes[1];
    contentDiv.style.height = newContentHeight;
    contentDiv.childNodes[0].style.height = newContentHeight;
    contentDiv.childNodes[1].style.height = newContentHeight;
    contentDiv.childNodes[2].style.height = newContentHeight;
  }


  // Adjusts the mouse position from the event so it is NOT outside the
  // canvas when doing a left sizing operation.
  getAdjustedMousePositionLeft (event, canvasDiv) {
    let eventClientX = event.clientX;

    if (eventClientX < canvasDiv.offsetLeft + this.hoverZoneSize) {
      eventClientX = canvasDiv.offsetLeft + this.hoverZoneSize;
    }
    return eventClientX;
  }

  // Adjusts the mouse position from the event so it is NOT outside the
  // canvas when doing a right sizing operation.
  getAdjustedMousePositionRight (event, canvasDiv) {
    let eventClientX = event.clientX;

    if (eventClientX > canvasDiv.offsetLeft + canvasDiv.offsetWidth - this.hoverZoneSize) {
      eventClientX = canvasDiv.offsetLeft + canvasDiv.offsetWidth - this.hoverZoneSize;
    }
    return eventClientX;
  }

  // Adjusts the mouse position from the event so it is NOT outside the
  // canvas when doing a top sizing operation.
  getAdjustedMousePositionTop (event, canvasDiv) {
    let eventClientY = event.clientY;

    if (eventClientY < canvasDiv.offsetTop + this.hoverZoneSize) {
      eventClientY = canvasDiv.offsetTop + this.hoverZoneSize;
    }
    return eventClientY;
  }

  // Adjusts the mouse position from the event so it is NOT outside the
  // canvas when doing a bottom sizing operation.
  getAdjustedMousePositionBottom (event, canvasDiv) {
    let eventClientY = event.clientY;

    if (eventClientY > canvasDiv.offsetTop + canvasDiv.offsetHeight - this.hoverZoneSize) {
        eventClientY = canvasDiv.offsetTop + canvasDiv.offsetHeight - this.hoverZoneSize;
    }
    return eventClientY;
  }

  mouseUp () {
    this.dragging = false;
    this.verticalSizingAction = "";
    this.horizontalSizingAction = "";
    this.verticalSizingHover = "";
    this.horizontalSizingHover = "";
  }

  // Called when the browser window is resized.  We need to make sure the
  // palette stays inside the canvas and is a size that allows it to fit
  // into the canvas.
  windowResize () {
    let paletteDiv = ReactDOM.findDOMNode(this.refs.palette);
    let canvasDiv = document.getElementById("canvas-div");

    if (canvasDiv) {
      if (this.isMaximized) {
        // Handle horizontal page sizing
        let newLeft = canvasDiv.offsetLeft + this.hoverZoneSize;
        paletteDiv.style.left = newLeft + "px";

        let newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize;
        paletteDiv.style.width = newWidth + "px";

        // Handle vertical page sizing
        let newTop = canvasDiv.offsetTop + this.hoverZoneSize;
        paletteDiv.style.top = newTop + "px";

        let newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize;
        paletteDiv.style.height = newHeight + "px";
        this.setContentDivHeight(paletteDiv, newHeight);

      } else {
        // Handle horizontal page sizing
        if (paletteDiv.offsetLeft + paletteDiv.offsetWidth + this.hoverZoneSize > canvasDiv.offsetLeft + canvasDiv.offsetWidth) {
          let newLeft = canvasDiv.offsetLeft + canvasDiv.offsetWidth - paletteDiv.offsetWidth - this.hoverZoneSize;
          paletteDiv.style.left = newLeft + "px";
        }

        let newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize;
        if (newWidth < paletteDiv.offsetWidth) {
          paletteDiv.style.width = newWidth + "px";
          paletteDiv.style.left = (canvasDiv.offsetLeft + canvasDiv.offsetWidth - paletteDiv.offsetWidth - this.hoverZoneSize) + "px";
        }

        // Handle vertical page sizing
        if (paletteDiv.offsetTop + paletteDiv.offsetHeight + this.hoverZoneSize > canvasDiv.offsetTop + canvasDiv.offsetHeight) {
          let newTop = canvasDiv.offsetTop + canvasDiv.offsetHeight - paletteDiv.offsetHeight - this.hoverZoneSize;
          paletteDiv.style.top = newTop + "px";
        }

        let newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize;
        if (newHeight < paletteDiv.offsetHeight) {
          paletteDiv.style.height = newHeight + "px";
          paletteDiv.style.top = (canvasDiv.offsetTop + canvasDiv.offsetHeight - paletteDiv.offsetHeight - this.hoverZoneSize) + "px";
          this.setContentDivHeight(paletteDiv, newHeight);
        }
      }
    }
  }

  // Called when the user double clicks the title bar.
  windowMaximize() {
    let paletteDiv = ReactDOM.findDOMNode(this.refs.palette);
    let canvasDiv = document.getElementById("canvas-div");

    if (canvasDiv) {
      if (this.isMaximized) {
        // Restore the previous window size and position
        paletteDiv.style.width = this.savedWidth + "px";
        paletteDiv.style.left = this.savedLeft + "px";
        paletteDiv.style.height = this.savedHeight + "px";
        paletteDiv.style.top = this.savedTop + "px";
        this.setContentDivHeight(paletteDiv, this.savedHeight);

        this.isMaximized = false;

        // After the palette has restored, ensure it is visible in
        // whatever size the canvas happens to be. This can be done by doing
        // the same activity as we perform when the browser window is sized.
        // Make sure to call this after setting the isMaximized flag because
        // windowResize() looks at that flag for its resize behavior.
        this.windowResize();

      } else {
        // Save the existing size and position and maximize the palette.
        this.savedWidth = paletteDiv.offsetWidth;
        this.savedLeft = paletteDiv.offsetLeft;
        this.savedHeight = paletteDiv.offsetHeight;
        this.savedTop = paletteDiv.offsetTop;

        // Handle horizontal palette sizing
        // A padding of 1 is needed to make it look better (I think) because of rounding errors
        let newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize + 1;
        paletteDiv.style.width = newWidth + "px";
        paletteDiv.style.left = (canvasDiv.offsetLeft + this.hoverZoneSize) + "px";

        // Handle vertical palette sizing
        // A padding of 1 is needed to make it look better (I think) because of rounding errors
        let newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize + 1;
        paletteDiv.style.height = newHeight + "px";
        paletteDiv.style.top = (canvasDiv.offsetTop + this.hoverZoneSize) + "px";
        this.setContentDivHeight(paletteDiv, newHeight);

        this.isMaximized = true;
      }
    }
  }

  showGrid (state) {
    this.setState({showGrid: state});
  }

  render() {
    let displayValue = this.props.showPalette ? 'block' : 'none';

    return (
      <div className="palette-div"
           ref="palette"
           onMouseDown={this.mouseDownOnPalette}
           style={{display : displayValue}}>
        <PaletteTopbar mouseDownMethod={this.mouseDownOnTopBar}
                       closeMethod={this.props.closePalette}
                       showGridMethod={this.showGrid}
                       windowMaximizeMethod={this.windowMaximize}
                       showGrid={this.state.showGrid}>
        </PaletteTopbar>
        <PaletteContent paletteJSON={this.props.paletteJSON}
                        showGrid={this.state.showGrid}
                        createTempNode={this.props.createTempNode}
                        deleteTempNode={this.props.deleteTempNode}></PaletteContent>
      </div>
    );
  }
}

Palette.propTypes = {
  paletteJSON: React.PropTypes.object.isRequired
};

export default Palette;
