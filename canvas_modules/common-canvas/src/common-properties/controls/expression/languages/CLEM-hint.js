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

/* eslint no-useless-escape: "off" */
import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { completeFromList } from "@codemirror/autocomplete";

const keywords = ("@BLANK @DIFF1 @DIFF2 @FIELD @FIELDS_BETWEEN @FIELDS_MATCHING " +
"@GLOBAL_MAX @GLOBAL_MEAN @GLOBAL_MIN @GLOBAL_SDEV @GLOBAL_SUM @INDEX @LAST_NON_BLANK " +
"@MAX @MEAN @MIN @MULTI_RESPONSE_SET @NULL @OFFSET @PARTITION_FIELD @PREDICTED " +
"@SDEV @SINCE @SINCE0 @SUM @TARGET @TESTING_PARTITION @THIS @TODAY @TRAINING_PARTITION " +
"@VALIDATION_PARTITION abs allbutfirst allbutlast alphabefore and arccos arccosh arcsin " +
"arcsinh arctan arctan2 arctanh area cdf_chisq cdf_f cdf_normal cdf_t close_to COND1 " +
"and COND2 COND1 or COND2 cos cosh count_equal count_greater_than count_less_than " +
"count_non_nulls count_not_equal count_nulls count_substring crosses date_before " +
"date_days_difference date_from_ywd date_in_days date_in_months date_in_weeks date_in_years " +
"date_iso_day date_iso_week date_iso_year date_months_difference date_weeks_difference " +
"date_years_difference datetime_date datetime_day datetime_day_name datetime_day_short_name " +
"datetime_hour datetime_in_seconds datetime_minute datetime_month datetime_month_name " +
"datetime_month_short_name datetime_now datetime_second datetime_time datetime_timestamp " +
"datetime_weekday datetime_year distance div endstring exp first_index first_non_null " +
"first_non_null_index fracof hasendstring hasmidstring hasstartstring hassubstring hassubstring " +
"if then else elseif endif integer_bitcount integer_leastbit integer_length intof is_date " +
"is_datetime is_integer is_number is_real is_string is_time is_timestamp isalphacode " +
"isendstring islowercode ismidstring isnumbercode isstartstring issubstring issubstring " +
"issubstring_count issubstring_lim isuppercode last last_index last_non_null last_non_null_index " +
"length locchar locchar_back log log10 lowertoupper max max_index max_n MEAN mean_n member " +
"min min_index min_n negate not num_points oneof or overlap pi random random0 rem replace " +
"replicate round sdev_n sign sin sinh skipchar skipchar_back soundex soundex_difference sqrt " +
"startstring stb_centroid_latitude stb_centroid_longitude stripchar strmember subscrs substring " +
"substring_between sum_n tan tanh testbit time_before time_hours_difference time_in_hours " +
"time_in_mins time_in_secs time_mins_difference").split(" ");

const clemKeywords = keywords.map((keyword) => ({ label: keyword, type: "keyword" }));

const isSpecialChar = /[\[\]{}\(\),;\:\.]/;
const isDigit = /\d/;
const isNumberChar = /[\w\.]/;
const isWordChar = /[\w\$_]/;
const isOperatorChar = /[+\-*&%=<>!?|\/]/;

function tokenResolve(stream, state) {
	const ch = stream.next();
	if (ch === "#" && state.startOfLine) {
		stream.skipToEnd();
		return "meta";
	}

	if (ch === "\"") {
		tokenString(ch, stream, state);
		return "string";
	}

	if (ch === "'") {
		tokenVariable(ch, stream, state);
		return "variable";
	}

	if (isSpecialChar.test(ch)) {
		return null;
	}

	if (isDigit.test(ch)) {
		stream.eatWhile(isNumberChar);
		return "number";
	}
	if (isOperatorChar.test(ch)) {
		stream.eatWhile(isOperatorChar);
		return "operator";
	}

	stream.eatWhile(isWordChar);
	const cur = stream.current();
	if (keywords.indexOf(cur) !== -1) {
		return "keyword";
	}
	return "variable";
}

function tokenString(quote, stream, state) {
	let next;
	let end = false;
	while (typeof (next = stream.next()) !== "undefined") {
		if (next === quote) {
			end = true;
			break;
		}
	}
	if (end) {
		state.tokenize = null;
	}
	return "string";
}

function tokenVariable(quote, stream, state) {
	let next;
	let end = false;
	while (typeof (next = stream.next()) !== "undefined") {
		if (next === quote) {
			end = true;
			break;
		}
	}
	if (end) {
		state.tokenize = null;
	}
	return "variable";
}

// Define CLEM language
const clemLanguage = StreamLanguage.define({
	name: "CLEM",
	startState: function() {
		return { tokenize: null };
	},
	token: function(stream, state) {
		if (stream.eatSpace()) {
			return null;
		}
		const style = (state.tokenize || tokenResolve)(stream, state);
		return style;
	},
});

// Autocompletions
const clemCompletion = clemLanguage.data.of({
	autocomplete: completeFromList(clemKeywords)
});

function clem() {
	return new LanguageSupport(clemLanguage, [clemCompletion]);
}

export {
	clem
};
