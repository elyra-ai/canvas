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
/* eslint no-console: ["error", { allow: ["log", "info", "warn", "error", "time", "timeEnd"] }] */

export default class Logger {

	// prefix can be either a string or an array of string. The prefix(s) are
	// displayed at the beginning of any console messgae sepearated from the
	// message (and from each orther) by a dash.
	constructor(prefix) {
		this.prefix = prefix;
	}

	// Displays a message in the console as either a formatted string or as
	// an object.
	log(msg) {
		if (Logger.active) {
			if (typeof msg === "string") {
				console.info(this.getMessage("", msg));
			} else {
				console.info(msg);
			}
		}
	}

	// Logs the message provided and starts a timer.
	logStartTimer(msg) {
		if (Logger.active) {
			const startMsg = this.getStartMessage("", msg);
			const endMsg = this.getEndMessage("", msg);
			console.info(startMsg);
			console.time(endMsg);
		}
	}

	// Logs the message provided. If the message is exactly the same as a message
	// provided in a previous logStartTime() call then the execution time from
	// start to finish is added to the end of the message. Also, this method
	// optionally allows the display of a separator when displaySeparator is set
	// to true.
	logEndTimer(msg, displaySeparator) {
		if (Logger.active) {
			const endMsg = this.getEndMessage("", msg);
			console.timeEnd(endMsg);
			if (displaySeparator) {
				console.info("--------------------------------------------------");
			}
		}
	}

	debug(msg) {
		if (Logger.active) {
			console.log(this.getMessage("DEBUG", msg));
		}
	}

	warn(msg) {
		// Always write warnings to the console regardless of whether Logger.active is true or not
		console.warn(this.getMessage("WARNING", msg));
	}

	error(msg) {
		// Always write errors to the console regardless of whether Logger.active is true or not
		console.error(this.getMessage("ERROR", msg));
	}

	getStartMessage(type, msg) {
		return this.getMessage(type, msg) + " - start";
	}

	getEndMessage(type, msg) {
		return this.getMessage(type, msg) + " - end";
	}

	// Adds a message to the console with the following format:
	// [type] prefix[0] - prefix[1] - prefix[2] - msg
	// Any prefixes are abbreviate to a maximum of 20 characters.
	getMessage(type, msg) {
		let str = "";
		if (type) {
			str += "[" + type + "] ";
		}

		if (typeof this.prefix === "string") {
			str += this.abbreviate(this.prefix) + " - ";
		} else {
			for (let idx = 0; idx < this.prefix.length; idx++) {
				str += this.abbreviate(this.prefix[idx]) + " - ";
			}
		}

		return str + msg;
	}

	abbreviate(idStr) {
		if (idStr && idStr.length > 20) {
			return idStr.substr(0, 17) + "...";
		}
		return idStr;
	}

	static getLoggingState() {
		return Logger.active;
	}

	static setLoggingState(state) {
		Logger.active = state;
	}

	static switchLoggingState() {
		if (Logger.active) {
			new Logger("Logger").log("Switching canvas logging off");
			Logger.active = false;
		} else {
			Logger.active = true;
			new Logger("Logger").log("Switching canvas logging on");
		}
	}
}

// Static variable can be switched on and off by pressing Ctrl+Shift+Option+P
Logger.active = false;
