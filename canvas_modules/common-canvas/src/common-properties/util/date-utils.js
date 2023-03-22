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
	return isoDate;
}

// Get the ISO date format that is stored internally
function getISODate(inDate) {
	const date = new Date(inDate);
	if (!isNaN(date)) {
		return date.toISOString();
	}
	return inDate;
}

export {
	getFormattedDateFromISO,
	getISODate
};
