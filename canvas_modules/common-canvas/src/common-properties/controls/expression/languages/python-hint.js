/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import CodeMirror from "codemirror/lib/codemirror.js";

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
CodeMirror.registerHelper("hint", "python", pythonHint);

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
