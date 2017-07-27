/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Node from "../src/node.jsx";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end


const nodeActionHandler = sinon.spy();
const uiconf = {
	nodeWidth: 100,
	nodeHeight: 100,
	iconSize: 100,
	fontSize: 10,
	connSize: 10,
	connOffsets: 10,
	zoom: 2
};

const node = {
	"id": "id2PZSCTRPRIJ",
	"objectData": {
		"label": "Na_to_K",
		"description": "",
		"opened": 1484731676439,
		"created": 1420358068497,
		"updated": 1484731676439
	},
	"typeId": "derive",
	"iconpath": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiP…IyNy4zIiBjbGFzcz0ic3Q0IiB3aWR0aD0iNy43IiBoZWlnaHQ9IjEuOSIvPg0KPC9zdmc+DQo=",
	"inConnector": true,
	"outConnector": true,
	"x_pos": 270,
	"y_pos": 232,
	"enabled": true,
	"cacheState": "disabled",
	"containsModel": false
};

describe("Node renders correctly", () => {

	it("props should have been defined", () => {
		const wrapper = shallow(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
    );
		expect(wrapper.node).to.be.defined;
		expect(wrapper.label).to.be.defined;
		expect(wrapper.nodeActionHandler).to.be.defined;
		expect(wrapper.uiconf).to.be.defined;
		expect(wrapper.selected).to.be.defined;
	});

	it("should render a `.node-circle`", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
		);

		expect(wrapper.find(".node-circle")).to.have.length(1);
	});

	it("should render a `.node-circle`", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
		);

		expect(wrapper.find(".node-circle")).to.have.length(1);
	});

	it("should render a `.node-inner-circle`", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
    );

		expect(wrapper.find(".node-inner-circle")).to.have.length(1);
	});

	it("should render a `.padding-circle`", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
    );

		expect(wrapper.find(".padding-circle")).to.have.length(1);
	});


	it("should show halo(circle with blue border) on mouseEnter of `.node-circle` ", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
    );

    // wrapper.setState({ showCircle: true });
		wrapper.find(".node-circle").simulate("mouseEnter");
    // expect(wrapper.state('showCircle')).to.equal(true);
		expect(wrapper.find(".node-circle")).to.have.style("border");

	});

	it("should hide halo(circle with blue border) on mouseLeave of`.node-circle` ", () => {
		const wrapper = mount(
			<Node
				node={node}
				label={""}
				nodeActionHandler={nodeActionHandler}
				uiconf={uiconf}
				selected
			/>
    );

    // wrapper.setState({ showCircle: false });
		wrapper.find(".node-circle").simulate("mouseLeave");
    // expect(wrapper.state('showCircle')).to.equal(false);
		expect(wrapper.find(".node-circle")).to.not.have.style("border");

	});

});
