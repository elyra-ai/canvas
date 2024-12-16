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

import { List, Record, Stack } from "immutable";

const MAX_UNDO_COMMANDS = 100;

export default class InternalStack {

	constructor() {
		const recFac = new Record({
			undoCmnds: new List(),
			redoCmnds: new Stack()
		});

		this.rec = recFac();
	}

	do(command) {
		this.rec = this.rec.merge({
			undoCmnds: this.rec.undoCmnds.push(command),
			redoCmnds: new Stack()
		});

		if (this.rec.undoCmnds.size > MAX_UNDO_COMMANDS) {
			this.rec = this.rec.set("undoCmnds", this.rec.undoCmnds.shift());
		}
		command.do();
	}

	undo() {
		if (this.canUndo()) {
			const prev = this.getPrevious();
			this.rec = this.rec.merge({
				undoCmnds: this.rec.undoCmnds.pop(),
				redoCmnds: this.rec.redoCmnds.push(prev)
			});
			prev.undo();
		}
	}

	redo() {
		if (this.canRedo()) {
			const next = this.getNext();
			this.rec = this.rec.merge({
				undoCmnds: this.rec.undoCmnds.push(next),
				redoCmnds: this.rec.redoCmnds.pop()
			});
			next.redo();
		}
	}

	canUndo() {
		return !this.rec.undoCmnds.isEmpty();
	}

	canRedo() {
		return !this.rec.redoCmnds.isEmpty();
	}

	getPrevious() {
		return this.rec.undoCmnds.last();
	}

	getNext() {
		return this.rec.redoCmnds.first();
	}

	getUndoCommands() {
		return this.rec.undoCmnds;
	}

	getRedoCommands() {
		return this.rec.redoCmnds;
	}
}
