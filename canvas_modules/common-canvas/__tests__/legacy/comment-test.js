/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Comment from "../../src/legacy/comment.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const commentActionHandler = sinon.spy();
const commentContextHandler = sinon.spy();
const fontSize = 10;
const zoom = 2;


const comment = {
	"id": "id2PZSCTRPRIJ",
	"x_pos": 270,
	"y_pos": 232,
	"height": 45,
	"width": 200,
	"content": "this is the content of this comment",
	"style": ""
};

describe("comment renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		expect(wrapper.prop("comment")).to.equal(comment);
		expect(wrapper.prop("zoom")).to.equal(zoom);
		expect(wrapper.prop("commentActionHandler")).to.equal(commentActionHandler);
		expect(wrapper.prop("onContextMenu")).to.equal(commentContextHandler);
		expect(wrapper.prop("fontSize")).to.equal(fontSize);
		expect(wrapper.prop("selected")).to.equal(false);
	});

	it("should render a `.comment-box`", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		expect(wrapper.find(".comment-box")).to.have.length(1);
	});

	it("should render a `.comment-inner-box`", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		expect(wrapper.find(".comment-inner-box")).to.have.length(1);
	});

	it("should render a `.padding-box`", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		expect(wrapper.find(".padding-box")).to.have.length(1);
	});


	it("should show halo(box with blue border) on mouseEnter of `.comment-box` ", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		// wrapper.setState({ showCircle: true });
		wrapper.find(".comment-box").simulate("mouseEnter");
		// expect(wrapper.state('showCircle')).to.equal(true);
		expect(wrapper.find(".comment-box")).to.have.style("border");

	});

	it("should hide halo(circle with blue border) on mouseLeave of`.comment-box` ", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		// wrapper.setState({ showCircle: false });
		wrapper.find(".comment-box").simulate("mouseLeave");
		// expect(wrapper.state('showCircle')).to.equal(false);
		expect(wrapper.find(".comment-box")).to.not.have.style("border");

	});

	it("should call commentActionHandler when click on `.comment-box`", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		wrapper.find(".comment-box").simulate("click");

		expect(commentActionHandler.calledOnce).to.equal(true);
	});

	it("should call commentContextHandler when right click on `.comment-inner-box`", () => {
		const wrapper = mount(
			<Comment
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={commentActionHandler}
				onContextMenu={commentContextHandler}
				selected={false}
			/>
		);

		wrapper.find(".comment-inner-box").simulate("contextMenu");

		expect(commentContextHandler.calledOnce).to.equal(true);
	});

});
