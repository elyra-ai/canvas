/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
