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

/* eslint complexity: ["error", 13] */
/* eslint no-shadow: ["error", { "allow": ["Comment"] }] */

import { DND_DATA_TEXT } from "../constants/common-constants.js";
import React from "react";

class Comment extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showBox: false,
			context: false,
			editable: false,
			value: this.props.comment.content,
			width: this.props.comment.width,
			height: this.props.comment.height,
			xPos: this.props.comment.xPos,
			yPos: this.props.comment.yPos
		};
		this.dragStart = this.dragStart.bind(this);
		this.drop = this.drop.bind(this);

		this.linkDragStart = this.linkDragStart.bind(this);
		this.linkDragOver = this.linkDragOver.bind(this);
		this.linkDragEnd = this.linkDragEnd.bind(this);
		this.linkDrop = this.linkDrop.bind(this);

		this.commentClicked = this.commentClicked.bind(this);
		this.commentDblClicked = this.commentDblClicked.bind(this);
		this.showContext = this.showContext.bind(this);

		this.commentChange = this.commentChange.bind(this);

		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleMouseEnterInnerBox = this.handleMouseEnterInnerBox.bind(this);

		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.mouseDownOnComment = this.mouseDownOnComment.bind(this);
		this.blurFunction = this.blurFunction.bind(this);

		// resizing of the comment box mode.  It is not a state variable because it will
		// cause a jitter when I set the state and it renders in some cases.
		this.resizingComment = false;

		// verticalSizingAction and verticalSizingHover can be set to top or bottom
		this.verticalSizingAction = "";
		this.verticalSizingHover = "";

		// horizontalSizingAction and horizontalSizingHover can be set to left or right
		this.horizontalSizingAction = "";
		this.hoizontalSizingHover = "";

		// These variables store the comment dimensions
		this.savedWidth = 0;
		this.savedLeft = 0;
		this.savedHeight = 0;
		this.savedTop = 0;

		// hoverZoneSize is the number of pixels around the comment where the
		// sizing cursor will appear (which allows the user to size the window).
		this.hoverZoneSize = 3;
		this.totalHoverZoneSize = this.hoverZoneSize * 2;

		// Need to control min width and min height in code to avoid CSS problems
		this.minWidth = 128;
		this.minHeight = 32;

		// hackOffset is used to align the cursor to determine if one the right or bottom border.
		this.cursorOffset = 4; // px

		window.addEventListener("mousemove", this.mouseMove, false);
		window.addEventListener("mouseup", this.mouseUp, false);
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("mouseup", this.mouseUp);
	}

	getCommentDiv() {
		return this.refs.canvasCommentDiv;
	}

	getInnerBoxTop(yPos) {
		return Math.round(yPos * this.props.zoom) - (this.props.zoom);
	}

	getInnerBoxLeft(xPos) {
		return Math.round(xPos * this.props.zoom) + (20 * this.props.zoom);
	}

	// When resizing get the new size dimensions of the comment box
	getNewSize(verticalSizingAction, horizontalSizingAction, event, canvasDiv, widthVals, heightVals) {
		// console.log("comment getNewSize");

		let newWidth = widthVals.savedWidth;
		let newLeft = widthVals.savedLeft;
		let newHeight = heightVals.savedHeight;
		let newTop = heightVals.savedTop;

		const rect = canvasDiv.getBoundingClientRect();
		const eventClientX = event.clientX - Math.round(rect.left);
		const eventClientY = event.clientY - Math.round(rect.top);

		if (horizontalSizingAction === "left") {
			newWidth = widthVals.savedWidth - ((eventClientX - widthVals.savedLeft) / this.props.zoom);

			if (newWidth <= widthVals.minWidth) {
				newWidth = widthVals.minWidth;
			} else {
				newLeft = eventClientX;
			}
			// console.log("moving left eventClient x,y = " + eventClientX + "," +
			// eventClientY + " newLeft = " + newLeft + " saveLeft = " + widthVals.savedLeft +
			//            " newWidth = " + newWidth + " savedWidth = " + widthVals.savedWidth)
		}

		if (horizontalSizingAction === "right") {
			newWidth = (eventClientX - widthVals.savedLeft) / this.props.zoom;

			if (newWidth <= widthVals.minWidth) {
				newWidth = widthVals.minWidth;
			}
		}

		if (verticalSizingAction === "top") {
			newHeight = heightVals.savedHeight - ((eventClientY - heightVals.savedTop) / this.props.zoom);

			if (newHeight <= heightVals.minHeight) {
				newHeight = heightVals.minHeight;
			} else {
				newTop = eventClientY;
			}
			// console.log("moving top eventClient x,y = " + eventClientX + "," +
			// eventClientY + " newTop = " + newTop + " saveTopt = " + heightVals.savedTop +
			//            " newHeight = " + newHeight + " savedWidth =" +
			// widthVals.savedWidth + " minHeight = " + heightVals.minHeight);
		}

		if (verticalSizingAction === "bottom") {
			newHeight = (eventClientY - heightVals.savedTop) / this.props.zoom;

			if (newHeight <= heightVals.minHeight) {
				newHeight = heightVals.minHeight;
			}
			// console.log("moving bottom eventClient x,y = " + eventClientX + "," +
			// eventClientY + " newTop = " + newTop + " saveTopt = " + heightVals.savedTop +
			//            " newHeight = " + newHeight + " savedWidth =" + widthVals.savedWidth +
			// " minHeight = " + heightVals.minHeight);
		}

		return { newWidth: newWidth, newLeft: newLeft, newHeight: newHeight, newTop: newTop };
	}

	// Determine if the mouse is near a comment box edge and
	// set the cursor style for resizing.
	setCursorStyle(elementDiv, elementLeft, elementTop, event) {
		// console.log("setCursorStyle");

		// adjust the event X,Y for sliding focus on multiple focus size canvas
		const canvasDiv = document.getElementById("canvas-div");
		const rect = canvasDiv.getBoundingClientRect();

		const clientX = event.clientX - Math.round(rect.left);
		const clientY = event.clientY - Math.round(rect.top);

		if (clientX > elementLeft && clientX < elementLeft + (this.totalHoverZoneSize)) {
			this.horizontalSizingHover = "left";

		} else if (clientX < elementLeft + elementDiv.offsetWidth + this.cursorOffset &&
			clientX > elementLeft + elementDiv.offsetWidth + this.cursorOffset - this.totalHoverZoneSize) {
			this.horizontalSizingHover = "right";

		} else {
			this.horizontalSizingHover = "";
			this.horizontalSizingAction = "";
		}

		if (clientY > elementTop && clientY < elementTop + this.totalHoverZoneSize) {
			this.verticalSizingHover = "top";

		} else if (clientY < elementTop + elementDiv.offsetHeight + this.cursorOffset &&
			clientY > elementTop + elementDiv.offsetHeight + this.cursorOffset - this.totalHoverZoneSize) {
			this.verticalSizingHover = "bottom";

		} else {
			this.verticalSizingHover = "";
			this.verticalSizingAction = "";
		}

		if (this.verticalSizingHover === "top") {
			if (this.horizontalSizingHover === "left") {
				elementDiv.style.cursor = "nwse-resize";
			} else if (this.horizontalSizingHover === "right") {
				elementDiv.style.cursor = "nesw-resize";
			} else {
				elementDiv.style.cursor = "ns-resize";
			}
		} else if (this.verticalSizingHover === "bottom") {
			if (this.horizontalSizingHover === "left") {
				elementDiv.style.cursor = "nesw-resize";
			} else if (this.horizontalSizingHover === "right") {
				elementDiv.style.cursor = "nwse-resize";
			} else {
				elementDiv.style.cursor = "ns-resize";
			}
		} else if (this.horizontalSizingHover === "left" || this.horizontalSizingHover === "right") {
			elementDiv.style.cursor = "ew-resize";

		} else {
			elementDiv.style.cursor = "default";
		}
		// console.log("mouse mouseMove check if near comments edge " +
		// this.horizontalSizingHover + " " + this.verticalSizingHover);
	}

	// mouseMove is an event handler whenver the mouse is moved.
	// It handles the resizing of the comment box.  This will cache the
	// new size in the local state and will not update the object model
	// until the mouseUp event is fired.
	mouseMove(event) {
		// First, see if we are doing a sizing action (i.e. the user has
		// done mouse down when in sizing hover zone) and take appropriate
		// sizing action.
		if (this.resizingComment) {
			const canvasDiv = document.getElementById("canvas-div");

			const dimensions = this.getNewSize(this.verticalSizingAction,
				this.horizontalSizingAction,
				event,
				canvasDiv, {
					savedWidth: this.savedWidth,
					savedLeft: this.savedLeft,
					minWidth: this.minWidth
				}, {
					savedHeight: this.savedHeight,
					savedTop: this.savedTop,
					minHeight: this.minHeight
				}
			);

			this.setState({
				width: Math.round(dimensions.newWidth),
				height: Math.round(dimensions.newHeight),
				xPos: Math.round((dimensions.newLeft - (20 * this.props.zoom)) / this.props.zoom),
				yPos: Math.round((dimensions.newTop + this.props.zoom) / this.props.zoom)
			});

			// Finally, if no sizing or dragging is going on, we look to see if
			// the user is hovering the pointer near the comment edges so we can
			// display an appropriate sizing cursor.
		} else {
			const commentDiv = this.getCommentDiv();
			this.setCursorStyle(commentDiv,
				this.getInnerBoxLeft(this.props.comment.xPos),
				this.getInnerBoxTop(this.props.comment.yPos),
				event);
		}
	}

	// when the mouse button is clicked up, then save the new comment box size
	// to the object model
	mouseUp(event) {
		// console.log("Comment mouseUp resizing= "+this.resizingComment);
		// console.log("State x,y = "+this.state.xPos+","+this.state.yPos);
		// notify to save the resize values.
		if (this.resizingComment) {
			const evValues = {
				value: this.state.value
			};
			const optArg = {
				nodes: [this.props.comment.id],
				target: evValues,
				width: Math.round(this.state.width),
				height: Math.round(this.state.height),
				xPos: Math.round(this.state.xPos),
				yPos: Math.round(this.state.yPos)
			};
			this.props.commentActionHandler("editComment", optArg);
		}

		// reset state variables
		this.resizingComment = false;
		this.verticalSizingAction = "";
		this.horizontalSizingAction = "";
		this.verticalSizingHover = "";
		this.horizontalSizingHover = "";
	}

	// when the mouse button is clicked down and mouse is near an edge
	// then start resizing.
	mouseDownOnComment(event) {
		// console.log("Comment mouseDownOnComment")
		// if near the edge of a the comment box then enter resizing mode.
		if (this.verticalSizingHover !== "" || this.horizontalSizingHover !== "") {

			// prevent other mouse down handlers from being invoked.
			// only do this when resizing to prevent move of the box.
			event.preventDefault();

			this.resizingComment = true;
			this.verticalSizingAction = this.verticalSizingHover;
			this.horizontalSizingAction = this.horizontalSizingHover;

			this.savedWidth = this.props.comment.width;
			this.savedLeft = this.getInnerBoxLeft(this.props.comment.xPos);
			this.savedHeight = this.props.comment.height;
			this.savedTop = this.getInnerBoxTop(this.props.comment.yPos);

		}
	}

	// when focus is lost then push edit comment changes to the object model
	blurFunction(event) {
		if (this.state.editable) {
			const evValues = {
				value: this.state.value
			};
			const optArg = {
				nodes: [this.props.comment.id],
				target: evValues,
				width: this.state.width,
				height: this.state.height,
				xPos: this.props.comment.xPos,
				yPos: this.props.comment.yPos
			};

			this.props.commentActionHandler("editComment", optArg);

			this.setState({ editable: false });
		}
	}

	handleMouseEnterInnerBox(ev) {
		this.setState({ showBox: false });
	}

	handleMouseLeave(ev) {
		this.setState({ showBox: false });
	}

	handleMouseEnter(ev) {
		this.setState({ showBox: true });
	}

	linkDragStart(connType, ev) {
		ev.dataTransfer.effectAllowed = "link";

		// avoiding halo"s ghost image when dragging
		const ghost = document.createElement("div");
		ghost.style.height = "1px";
		ghost.style.width = "1px";
		document.body.appendChild(ghost);
		ev.dataTransfer.setDragImage(ghost, 0, 0);

		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "link",
				id: this.props.comment.id,
				label: this.props.comment.content,
				connType: connType })
		);
	}

	linkDragOver(ev) {
		ev.preventDefault();
	}

	linkDragEnd(connType, ev) {
		//
	}

	linkDrop(ev) {
		this.drop(ev);
	}

	dragStart(ev) {
		// console.log("comment move started");
		// if in resize mode then don"t move the object
		if (!this.resizingComment) {
			ev.dataTransfer.effectAllowed = "move";

			ev.dataTransfer.setData(DND_DATA_TEXT,
				JSON.stringify({
					operation: "move",
					id: this.props.comment.id,
					label: this.props.comment.content })
			);
		}
	}

	drop(ev) {
		this.props.commentActionHandler("dropOnComment", ev);
	}

	commentClicked(ev) {
		ev.stopPropagation();
		// comment is already bound
		this.props.commentActionHandler("selected", ev);
	}

	commentDblClicked(ev) {
		ev.stopPropagation();
		this.setState({ editable: true });

		// set the focus on the new editable comment box
		const textarea = document.getElementById(this.props.comment.id);
		textarea.focus();
	}

	// when the adding text to the comment box, determine if the height needs
	// to be increased.
	commentChange(ev) {
		// determine when to increase the height of the comment box based on the number of characters entered
		const fontPxSize = Math.round(this.props.fontSize * (96 / 72)); // convert from pt to px
		// approximate the number of characters per line based on font size
		const charPerLine = Math.round((this.state.width * this.props.zoom) / fontPxSize) * 2;
		const linesNeeded = Math.round(ev.target.value.length / charPerLine);
		const numLines = Math.round((this.state.height * this.props.zoom) / fontPxSize);

		let newHeight = this.state.height;
		if (linesNeeded > numLines) {
			newHeight = Math.round(this.state.height + fontPxSize); // increase the height by one Font size
		}

		// set the state x,y values to the object model values.
		// if the comment box has been moved after a resize then edited,
		// the state.x,y will not contain the moved x,y pos
		// which is set in the object model.
		this.setState({
			value: ev.target.value,
			height: newHeight,
			xPos: this.props.comment.xPos,
			yPos: this.props.comment.yPos }
		);
	}

	showContext(ev) {
		this.setState({ context: true });
	}

	render() {
		// console.log("comment render()");
		// console.log(this.props.comment);

		const zoom = this.props.zoom;

		let xPosi = this.props.comment.xPos;
		let yPosi = this.props.comment.yPos;

		if (this.resizingComment) {
			xPosi = this.state.xPos;
			yPosi = this.state.yPos;
		}

		var className = (typeof (this.props.comment.className) !== "undefined" && this.props.comment.className)
			? this.props.comment.className
			: "canvas-comment";

		if (this.props.selected) {
			className += " selected";
		}

		const bTop = Math.round(yPosi * zoom) - (10 * zoom);
		const bLeft = Math.round(xPosi * zoom) + (10 * zoom);
		const bWidth = Math.round(this.state.width * zoom) + (25 * zoom);
		const bHeight = Math.round(this.state.height * zoom) + (20 * zoom);

		const bInnerTop = this.getInnerBoxTop(yPosi);
		const bInnerLeft = this.getInnerBoxLeft(xPosi);
		const bInnerWidth = Math.round(this.state.width * zoom) + (5 * zoom);
		const bInnerHeight = Math.round(this.state.height * zoom) + (zoom);

		const paddingBoxStyle = {
			top: bTop,
			left: bLeft,
			width: bWidth,
			height: bHeight,
			border: `${8 * zoom}px solid white`,
			position: "absolute",
			borderRadius: "0%",
			backgroundColor: "white"

		};

		const boxStyle = (this.state.showBox)
			? {
				top: bTop,
				left: bLeft,
				width: bWidth,
				height: bHeight,
				border: `${7 * zoom}px solid #4178be`,
				position: "absolute",
				borderRadius: "0%",
				zIndex: 1
			}
			: {
				top: bTop,
				left: bLeft,
				width: bWidth,
				height: bHeight,
				position: "absolute",
				borderRadius: "0%",
				zIndex: 1
			};

		const innerBoxStyle = {
			top: bInnerTop,
			left: bInnerLeft,
			width: bInnerWidth,
			height: bInnerHeight,
			position: "absolute",
			borderRadius: "0",
			zIndex: 1
		};

		var commentStyle = {
			position: "absolute",
			top: zoom,
			left: zoom,
			width: Math.round(this.state.width * zoom),
			height: Math.round(this.state.height * zoom),
			fontSize: this.props.fontSize,
			lineHeight: 1.0,
			overflow: "hidden"
		};

		var textareaStyle = {
			top: zoom,
			left: zoom,
			width: Math.round(this.state.width * zoom),
			height: Math.round(this.state.height * zoom),
			fontSize: this.props.fontSize,
			overflow: "auto",
			lineHeight: 1.0,
			border: "none"
		};

		const customAttrs = {};
		if (this.props.comment.customAttrs) {
			this.props.comment.customAttrs.forEach((attr) => {
				customAttrs[attr] = "";
			});
		}

		const readOnly = !this.state.editable;

		const box = (<div>
			<div className="padding-box" style={paddingBoxStyle}></div>

			<div className="comment-box"
				style={boxStyle}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				draggable="true"
				onDragStart={this.linkDragStart.bind(null, "comment")}
				onDragEnd={this.linkDragEnd.bind(null, "comment")}
				onDrop={this.linkDrop}
				onDragOver={this.linkDragOver}
				onClick={this.props.commentActionHandler.bind(null, "comment")}
			>
			</div>

			<div className="comment-inner-box"
				style={innerBoxStyle}
				onMouseEnter={this.handleMouseEnterInnerBox}
				draggable="true"
				onDragStart={this.dragStart}
				onDragEnd={this.dragEnd}
				onDrop={this.drop}
				onContextMenu={this.props.onContextMenu}
			>
				<div ref="canvasCommentDiv"
					onMouseDown={this.mouseDownOnComment}
					className={className}
					style={commentStyle}
					onClick={this.commentClicked}
					onDoubleClick={this.commentDblClicked}
				>
					<textarea id={this.props.comment.id}
						className={className}
						style={textareaStyle}
						draggable="true"
						value={this.state.value}
						spellCheck="true"
						onChange={this.commentChange}
						onBlur={this.blurFunction}
						readOnly={readOnly}
					>
					</textarea>
				</div>
			</div>
		</div>);

		return (
			<div>
				{box}
			</div>
		);
	}
}

Comment.propTypes = {
	comment: React.PropTypes.object,
	commentActionHandler: React.PropTypes.func,
	onContextMenu: React.PropTypes.func,
	fontSize: React.PropTypes.number,
	zoom: React.PropTypes.number,
	selected: React.PropTypes.bool,
	cutable: React.PropTypes.bool
};

export default Comment;
