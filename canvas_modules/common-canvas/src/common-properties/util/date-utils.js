/*
 * Copyright 2023 Elyra Authors
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

const FLATPICKR_DATE_TOKENS_REGEX = {
	Y: "([1-9]\\d{3})", // 4 digit year
	y: "([0-9][0-9])", // 2 digit year
	m: "([0][1-9]|[1][0-2])", // 2 digit month
	n: "([1-9]|[1-2][0-2])", // month without leading 0
	d: "([0][1-9]|[1-2][0-9]|3[01])", // 2 digit day
	j: "([1-9]|[1-2][0-9]|3[01])" // day without leading 0
};

function getDateFormatRegex(dateFormat) {
	let dateRegex = dateFormat;
	dateRegex = dateRegex.replace("Y", FLATPICKR_DATE_TOKENS_REGEX.Y);
	dateRegex = dateRegex.replace("y", FLATPICKR_DATE_TOKENS_REGEX.y);
	dateRegex = dateRegex.replace("m", FLATPICKR_DATE_TOKENS_REGEX.m);
	dateRegex = dateRegex.replace("n", FLATPICKR_DATE_TOKENS_REGEX.n);
	dateRegex = dateRegex.replace("d", FLATPICKR_DATE_TOKENS_REGEX.d);
	dateRegex = dateRegex.replace("j", FLATPICKR_DATE_TOKENS_REGEX.j);
	dateRegex = "^" + dateRegex + "$";
	return dateRegex;
}

// 'datepicker' and 'datepickerRange' uses flatpickr internally through Carbon
// dateFormat tokens: https://flatpickr.js.org/formatting/#date-formatting-tokens
// Gets the formatted date to display in the control
function getFormattedDateFromISO(inDate, dateFormat) {
	const date = new Date(inDate);
	if (!isNaN(date)) {
		const year = date.getFullYear().toString();
		let month = (date.getMonth() + 1).toString(); // month is 0 indexed
		if (month.length === 1) {
			month = "0" + month;
		}
		let day = date.getDate().toString();
		if (day.length === 1) {
			day = "0" + day;
		}

		let formattedDate = dateFormat;
		formattedDate = formattedDate.replace("Y", year); // 4 digit year
		formattedDate = formattedDate.replace("y", year.substring(2)); // 2 digit year
		formattedDate = formattedDate.replace("m", month); // 2 digit month
		formattedDate = formattedDate.replace("n", month.replaceAll("0", "")); // month without leading 0
		formattedDate = formattedDate.replace("d", day); // 2 digit day
		formattedDate = formattedDate.replace("j", day.replaceAll("0", "")); // day without leading 0
		return formattedDate;
	}
	return date;
}

// Get the ISO date format that is stored internally
function getISODate(inDate) {
	const date = new Date(inDate);
	if (!isNaN(date)) {
		return date.toISOString();
	}
	return inDate;
}

// Date libraries are able to parse dates such as 2023-02-31 into an actual Date object: Jan 31 2023
// This function compares the year, month, and day of the date to see if the date is valid
function isValidDate(date, orgYear, orgMonth, orgDay) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return year === parseInt(orgYear, 10) && month === parseInt(orgMonth, 10) && day === parseInt(orgDay, 10);
}

// Given the date in string format "03-22-2023" and corresponding dateFormat m-d-Y,
// return the year, month, and day as separate fields
function getYearMonthDay(dateString, dateRegex, dateFormat) {
	let year = "";
	let month = "";
	let day = "";

	const groups = dateString.match(dateRegex);
	let groupIdx = 1; // Index 0 is the entire match
	for (let formatIdx = 0; formatIdx < dateFormat.length; formatIdx++) {
		const formatToken = dateFormat.charAt(formatIdx);
		switch (formatToken) {
		case "Y":
		case "y": {
			year = groups[groupIdx];
			groupIdx++;
			break;
		}
		case "m":
		case "n": {
			month = groups[groupIdx];
			groupIdx++;
			break;
		}
		case "d":
		case "j": {
			day = groups[groupIdx];
			groupIdx++;
			break;
		}
		default:
			break;
		}
	}
	return { year, month, day };
}

export {
	getDateFormatRegex,
	getFormattedDateFromISO,
	getISODate,
	isValidDate,
	getYearMonthDay
};
