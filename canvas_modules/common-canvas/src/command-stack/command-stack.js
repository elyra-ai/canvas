/*
 * Copyright 2017-2019 IBM Corporation
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
import History from "immutable-undo";

/* eslint no-shadow: ["error", { "allow": ["History"] }] */

export default class CommandStack {

	constructor() {
		this.commands = History.create({
			maxUndos: 100
		});
	}

	do(action) {
		this.commands = this.commands.push(action);
		action.do();
	}

	undo() {
		if (this.commands.canUndo) {
			const action = this.commands.previous;
			this.commands = this.commands.undo(action);
			action.undo();
		}
	}

	redo() {
		if (this.commands.canRedo) {
			const action = this.commands.next;
			this.commands = this.commands.redo(action);
			action.redo();
		}
	}

	// need this for validation on unit tests
	getStack() {
		const undoStack = this.commands.undos;
		const redoStack = this.commands.redos;
		return { "undos": undoStack, "redos": redoStack };
	}

	canUndo() {
		return this.commands.canUndo;
	}

	canRedo() {
		return this.commands.canRedo;
	}

	clearCommandStack() {
		this.commands = History.create({
			maxUndos: 100
		});
	}
}
