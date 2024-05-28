/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
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

describe("command stack handle commands OK", () => {
	const action1 = new testAction("a1");
	const action2 = new testAction("a2");
	const action3 = new testAction("a3");

	it("should do(a1), undo(), redo() onto a command stack", () => {

		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.undo();
		commandStack.redo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a1");
		expect(redoStack).to.have.length(0);

		// clear the stack
		commandStack.undo();
	});

	it("should do(a1),undo(), do(a2) onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.undo();
		commandStack.do(action2);

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a2");
		expect(redoStack).to.have.length(0);

		// clear the stack
		commandStack.undo();
		commandStack.undo();
	});

	it("should do(a1), do(a2), undo() onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.undo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a1");
		expect(redoStack).to.have.length(1);
		expect(redoStack[0].getData()).to.equal("a2");

		// clear the stack
		commandStack.undo();
	});

	it("should do(a1), do(a2), undo(), redo() onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.undo();
		commandStack.redo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(2);
		expect(undoStack[0].getData()).to.equal("a1");
		expect(undoStack[1].getData()).to.equal("a2");
		expect(redoStack).to.have.length(0);

		// clear the stack
		commandStack.undo();
		commandStack.undo();
	});

	it("should do(a1), do(a2), undo(), undo() onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.undo();
		commandStack.undo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(0);
		expect(redoStack).to.have.length(2);
		expect(redoStack[0].getData()).to.equal("a1");
		expect(redoStack[1].getData()).to.equal("a2");
	});

	it("should do(a1), do(a2), undo(), undo(), redo() onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.undo();
		commandStack.undo();
		commandStack.redo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a1");
		expect(redoStack).to.have.length(1);
		expect(redoStack[0].getData()).to.equal("a2");

		// clear the stack
		commandStack.undo();
	});

	it("should do(a1), do(a2), undo(), undo(), do(a3) onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.undo();
		commandStack.undo();
		commandStack.do(action3);

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a3");
		expect(redoStack).to.have.length(0);

		// clear the stack
		commandStack.undo();
	});

	it("should do(a1), do(a2), do(a3), undo(), redo(), undo(), undo() onto a command stack", () => {
		var commandStack = new CommandStack();
		commandStack.do(action1);
		commandStack.do(action2);
		commandStack.do(action3);
		commandStack.undo();
		commandStack.redo();
		commandStack.undo();
		commandStack.undo();

		// validation of state of stack
		const undoStack = commandStack.getStack().undos.toArray();
		const redoStack = commandStack.getStack().redos.toArray();
		expect(undoStack).to.have.length(1);
		expect(undoStack[0].getData()).to.equal("a1");
		expect(redoStack).to.have.length(2);
		expect(redoStack[0].getData()).to.equal("a2");
		expect(redoStack[1].getData()).to.equal("a3");
	});
});
