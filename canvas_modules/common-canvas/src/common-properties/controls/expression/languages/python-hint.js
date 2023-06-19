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

let CodeMirror;
function register(cm) {
	CodeMirror = cm;
	CodeMirror.registerHelper("hint", "python", pythonHint);
}


function forEach(arr, f) {
	for (var e = arr.length, i = 0; i < e; ++i) {
		f(arr[i]);
	}
}

function arrayContains(arr, item) {
	if (!Array.prototype.indexOf) {
		var i = arr.length;
		while (i--) {
			if (arr[i] === item) {
				return true;
			}
		}
		return false;
	}
	return arr.indexOf(item) !== -1;
}

function scriptHint(editor, _keywords, getToken) {
	var cur = editor.getCursor();
	var token = getToken(editor, cur);
	var tprop = token;
	var context;
	// ignore irregular word tokens
	if (!(/^[\w$_]*$/).test(token.string)) {
		token = tprop = { start: cur.ch, end: cur.ch, string: "", state: token.state,
			className: token.string === ":" ? "python-type" : null };
	}
	if (!context) {
		context = [];
	}
	context.push(tprop);

	var completionList = getCompletions(token, context);
	completionList.sort();

	return { list: completionList,
		from: CodeMirror.Pos(cur.line, token.start),
		to: CodeMirror.Pos(cur.line, token.end) };
}

function pythonHint(editor) {
	return scriptHint(editor, pythonKeywordsL, function(e, cur) {
		return e.getTokenAt(cur);
	});
}


var pythonKeywords = "and del from not while as elif global or with assert else if pass yield" +
"break except import print class exec in raise continue finally is return def for lambda try";
var pythonKeywordsL = pythonKeywords.split(" ");

var pythonBuiltins = "abs divmod input open staticmethod all enumerate int ord str " +
"any eval isinstance pow sum basestring execfile issubclass print super" +
"bin file iter property tuple bool filter len range type" +
"bytearray float list raw_input unichr callable format locals reduce unicode" +
"chr frozenset long reload vars classmethod getattr map repr xrange" +
"cmp globals max reversed zip compile hasattr memoryview round __import__" +
"complex hash min set apply delattr help next setattr buffer" +
"dict hex object slice coerce dir id oct sorted intern ";
var pythonBuiltinsL = pythonBuiltins.split(" ").join("() ")
	.split(" ");

function getCompletions(token, context) {
	var found = [];
	var start = token.string;
	function maybeAdd(str) {
		if (str.lastIndexOf(start, 0) === 0 && !arrayContains(found, str)) {
			found.push(str);
		}
	}

	function gatherCompletions(_obj) {
		forEach(pythonBuiltinsL, maybeAdd);
		forEach(pythonKeywordsL, maybeAdd);
	}

	if (context) {
		var obj = context.pop();
		var base = "";

		if (obj.type === "variable") {
			base = obj.string;
		}	else if (obj.type === "variable-3") {
			base = ":" + obj.string;
		}
		while (base !== null && context.length) {
			base = base[context.pop().string];
		}
		if (base !== null) {
			gatherCompletions(base);
		}
	}
	return found;
}

export {
	register
};
