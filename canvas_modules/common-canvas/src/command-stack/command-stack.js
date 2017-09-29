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

var commands = History.create({
	maxUndos: 100
});

export default class CommandStack {

// Standard methods
	static do(action) {
		commands = commands.push(action);
		action.do();
	}

	static undo() {
		if (commands.canUndo) {
			const action = commands.previous;
			commands = commands.undo(action);
			action.undo();
		}
	}

	static redo() {
		if (commands.canRedo) {
			const action = commands.next;
			commands = commands.redo(action);
			action.redo();
		}
	}

	// need this for validation on unit tests
	static getStack() {
		const undoStack = commands.undos;
		const redoStack = commands.redos;
		return { "undos": undoStack, "redos": redoStack };
	}

	static canUndo() {
		return commands.canUndo;
	}

	static canRedo() {
		return commands.canRedo;
	}

	static clearCommandStack() {
		commands = History.create({
			maxUndos: 100
		});
	}
}
