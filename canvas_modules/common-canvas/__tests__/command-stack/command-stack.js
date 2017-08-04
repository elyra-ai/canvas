/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end
import CommandStack from "../../src/command-stack/command-stack.js";

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

class testAction {
	constructor(data) {
		this.data = data;
	}

	do() {
		// console.log("do method for action = " + this.data);
	}

	undo() {
		// console.log("undo method for action = " + this.data);
	}

	redo() {
		// console.log("redo method for action = " + this.data);
	}

	getData() {
		return this.data;
	}
}

/*
// for debugging unit test cases
function dumpStacks(commands) {
	console.warn("undo stack");
	console.warn(CommandStack.getStack().undos.toArray());
	console.warn("redo stack");
	console.warn(CommandStack.getStack().redos.toArray());
}
*/

describe("command stack handle commmands OK", () => {
	const action1 = new testAction("a1");
	const action2 = new testAction("a2");
	const action3 = new testAction("a3");

	it("should do(a1), undo(), redo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.undo();
		CommandStack.redo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a1");
		expect(redoStack).to.have.length(0);

		// clear the stack
		CommandStack.undo();
	});

	it("should do(a1),undo(), do(a2) onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.undo();
		CommandStack.do(action2);

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a2");
		expect(redoStack).to.have.length(0);

		// clear the stack
		CommandStack.undo();
		CommandStack.undo();
	});

	it("should do(a1), do(a2), undo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.undo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a1");
		expect(redoStack).to.have.length(1);
		expect(redoStack[0].value.getData()).to.equal("a2");

		// clear the stack
		CommandStack.undo();
	});

	it("should do(a1), do(a2), undo(), redo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.undo();
		CommandStack.redo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(2);
		expect(undoStack[0].value.getData()).to.equal("a1");
		expect(undoStack[1].value.getData()).to.equal("a2");
		expect(redoStack).to.have.length(0);

		// clear the stack
		CommandStack.undo();
		CommandStack.undo();
	});

	it("should do(a1), do(a2), undo(), undo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.undo();
		CommandStack.undo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(0);
		expect(redoStack).to.have.length(2);
		expect(redoStack[0].value.getData()).to.equal("a1");
		expect(redoStack[1].value.getData()).to.equal("a2");
	});

	it("should do(a1), do(a2), undo(), undo(), redo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.undo();
		CommandStack.undo();
		CommandStack.redo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a1");
		expect(redoStack).to.have.length(1);
		expect(redoStack[0].value.getData()).to.equal("a2");

		// clear the stack
		CommandStack.undo();
	});

	it("should do(a1), do(a2), undo(), undo(), do(a3) onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.undo();
		CommandStack.undo();
		CommandStack.do(action3);

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a3");
		expect(redoStack).to.have.length(0);

		// clear the stack
		CommandStack.undo();
	});

	it("should do(a1), do(a2), do(a3), undo(), redo(), undo(), undo() onto a command stack", () => {

		CommandStack.do(action1);
		CommandStack.do(action2);
		CommandStack.do(action3);
		CommandStack.undo();
		CommandStack.redo();
		CommandStack.undo();
		CommandStack.undo();

		// validation of state of stack
		const undoStack = CommandStack.getStack().undos.toArray();
		const redoStack = CommandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].value.getData()).to.equal("a1");
		expect(redoStack).to.have.length(2);
		expect(redoStack[0].value.getData()).to.equal("a2");
		expect(redoStack[1].value.getData()).to.equal("a3");
	});
});
