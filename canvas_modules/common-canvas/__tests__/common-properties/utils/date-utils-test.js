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

import { expect } from "chai";
import * as DateUtils from "../../../src/common-properties/util/date-utils.js";

const DATE_FORMAT_ISO = "Y-m-d";
const DATE_FORMAT_SLASHES = "Y/m/d";
const DATE_FORMAT_MONTH = "m-d-Y";
const DATE_FORMAT_SINGLE_DIGITS = "n-j-y";
const DATE_FORMAT_DELIMITERS = "Y-m.d";

const DATE_FORMAT_ISO_DATE = "2023-03-22";
const DATE_FORMAT_SLASHES_DATE = "2023/03/20";
const DATE_FORMAT_MONTH_DATE = "03-22-2023";
const DATE_FORMAT_SINGLE_DIGITS_DATE = "1-2-23";
const DATE_FORMAT_DELIMITERS_DATE = "2023-11.02";

describe("date util tests", () => {
	it("date-utils getYearMonthDay() and getDateFormatRegex() returns correct data", () => {
		const regex1 = DateUtils.getDateFormatRegex(DATE_FORMAT_ISO);
		expect(regex1).to.equal("^([1-9][0-9][0-9][0-9])-([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|3[01])$");
		const expected1 = { year: "2023", month: "03", day: "22" };
		expect(DateUtils.getYearMonthDay(DATE_FORMAT_ISO_DATE, regex1, DATE_FORMAT_ISO)).to.eql(expected1);

		const regex2 = DateUtils.getDateFormatRegex(DATE_FORMAT_SLASHES);
		expect(regex2).to.equal("^([1-9][0-9][0-9][0-9])/([0][1-9]|[1][0-2])/([0][1-9]|[1-2][0-9]|3[01])$");
		const expected2 = { year: "2023", month: "03", day: "20" };
		expect(DateUtils.getYearMonthDay(DATE_FORMAT_SLASHES_DATE, regex2, DATE_FORMAT_SLASHES)).to.eql(expected2);

		const regex3 = DateUtils.getDateFormatRegex(DATE_FORMAT_MONTH);
		expect(regex3).to.equal("^([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|3[01])-([1-9][0-9][0-9][0-9])$");
		const expected3 = { year: "2023", month: "03", day: "22" };
		expect(DateUtils.getYearMonthDay(DATE_FORMAT_MONTH_DATE, regex3, DATE_FORMAT_MONTH)).to.eql(expected3);

		const regex4 = DateUtils.getDateFormatRegex(DATE_FORMAT_SINGLE_DIGITS);
		expect(regex4).to.equal("^([1-9]|[1-2][0-2])-([1-9]|[1-2][0-9]|3[01])-([0-9][0-9])$");
		const expected4 = { year: "23", month: "1", day: "2" };
		expect(DateUtils.getYearMonthDay(DATE_FORMAT_SINGLE_DIGITS_DATE, regex4, DATE_FORMAT_SINGLE_DIGITS)).to.eql(expected4);

		const regex5 = DateUtils.getDateFormatRegex(DATE_FORMAT_DELIMITERS);
		expect(regex5).to.equal("^([1-9][0-9][0-9][0-9])-([0][1-9]|[1][0-2]).([0][1-9]|[1-2][0-9]|3[01])$");
		const expected5 = { year: "2023", month: "11", day: "02" };
		expect(DateUtils.getYearMonthDay(DATE_FORMAT_DELIMITERS_DATE, regex5, DATE_FORMAT_DELIMITERS)).to.eql(expected5);
	});

	it("date-utils getFormattedDate() returns correct data", () => {
		const date1 = new Date("2023-03-22T00:00:00"); // ISO format
		expect(DateUtils.getFormattedDate(date1, DATE_FORMAT_ISO)).to.equal(DATE_FORMAT_ISO_DATE);

		const date2 = new Date("2023-03-20T00:00:00"); // ISO format
		expect(DateUtils.getFormattedDate(date2, DATE_FORMAT_SLASHES)).to.equal(DATE_FORMAT_SLASHES_DATE);

		const date3 = new Date("2023-03-22T00:00:00"); // ISO format
		expect(DateUtils.getFormattedDate(date3, DATE_FORMAT_MONTH)).to.equal(DATE_FORMAT_MONTH_DATE);

		const date4 = new Date("2023-01-02T00:00:00"); // ISO format
		expect(DateUtils.getFormattedDate(date4, DATE_FORMAT_SINGLE_DIGITS)).to.equal(DATE_FORMAT_SINGLE_DIGITS_DATE);

		const date5 = new Date("2023-11-02T00:00:00"); // ISO format
		expect(DateUtils.getFormattedDate(date5, DATE_FORMAT_DELIMITERS)).to.equal(DATE_FORMAT_DELIMITERS_DATE);
	});

	it("date-utils getISODate() returns correct data", () => {
		const date1 = new Date("2023-03-22T00:00:00"); // ISO format
		expect(DateUtils.getISODate(date1)).to.equal(date1.toISOString());

		const date2 = new Date(2023, 2, 22); // month is 0-index
		expect(DateUtils.getISODate(date2)).to.equal(date2.toISOString());

		const date3 = new Date(2023, 2, 22, 1, 2, 3); // month is 0-index with time
		expect(DateUtils.getISODate(date3)).to.equal(date3.toISOString());

		const date4 = new Date(); // ISO format
		expect(DateUtils.getISODate(date4)).to.equal(date4.toISOString());

		const bad = "random string";
		expect(DateUtils.getISODate(bad)).to.equal(bad);
	});

	it("date-utils isValidDate() returns correct data", () => {
		const date1 = new Date("2023-03-22T00:00:00"); // ISO format
		expect(DateUtils.isValidDate(date1, 2023, "03", 22)).to.equal(true);

		const date2 = new Date("2023-02-29T00:00:00"); // ISO format
		expect(DateUtils.isValidDate(date2, 2023, 2, 29)).to.equal(false);

		const date3 = new Date("2020-02-29T00:00:00"); // ISO format, leap year
		expect(DateUtils.isValidDate(date3, 2020, 2, 29)).to.equal(true);

		const date4 = new Date("2023-01-02T00:00:00"); // ISO format
		expect(DateUtils.isValidDate(date4, 2023, 1, "02")).to.equal(true);

		const date5 = new Date("0000-00-00T00:00:00"); // ISO format
		expect(DateUtils.isValidDate(date5, "0000", "00", "00")).to.equal(false);

		const date6 = new Date("eeee-ee-eeT00:00:00"); // ISO format
		expect(DateUtils.isValidDate(date6, "eeee", "ee", "ee")).to.equal(false);
	});
});
