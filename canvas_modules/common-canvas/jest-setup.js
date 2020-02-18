/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* global fetch */
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";


configure({ adapter: new Adapter() });

require("jest-fetch-mock").enableMocks();
fetch.mockResponse("<svg />");

// Added to filter out `act` error and warning messages
console.warn = jest.fn(mockConsole(console.warn));
console.error = jest.fn(mockConsole(console.error));

function mockConsole(consoleMethod) {
	const ignoredMessages = ["test was not wrapped in act(...)"];
	return (message, ...args) => {
		const hasIgnoredMessage = ignoredMessages.some((ignoredMessage) => message.includes(ignoredMessage));
		if (!hasIgnoredMessage) {
			consoleMethod(message, ...args);
		}
	};
}
