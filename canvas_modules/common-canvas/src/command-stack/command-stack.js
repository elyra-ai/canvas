/*
 * Copyright 2017-2025 Elyra Authors
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
import InternalStack from "./internal-stack.js";

export default class CommandStack {

	constructor() {
		this.commands = new InternalStack();
	}

	do(action) {
		this.commands.do(action);
	}

	undo() {
		this.commands.undo();
	}

	redo() {
		this.commands.redo();
	}

	getUndoCommand() {
		if (this.commands.canUndo()) {
			return this.commands.getPrevious();
		}
		return null;
	}

	getRedoCommand() {
		if (this.commands.canRedo()) {
			return this.commands.getNext();
		}
		return null;
	}

	getAllUndoCommands() {
		return this.commands.getUndoCommands().toArray();
	}

	getAllRedoCommands() {
		return this.commands.getRedoCommands().toArray();
	}

	// need this for validation on unit tests
	getStack() {
		return {
			"undos": this.commands.getUndoCommands(),
			"redos": this.commands.getRedoCommands()
		};
	}

	canUndo() {
		return this.commands.canUndo();
	}

	canRedo() {
		return this.commands.canRedo();
	}

	clearCommandStack() {
		this.commands = new InternalStack();
	}
}
