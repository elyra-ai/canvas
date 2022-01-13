/*
 * Copyright 2017-2022 Elyra Authors
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
	CodeMirror.registerHelper("hint", "r", rHint);
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
			className: token.string === ":" ? "r-type" : null };
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

function rHint(editor) {
	return scriptHint(editor, rKeywordsL, function(e, cur) {
		return e.getTokenAt(cur);
	});
}

var rKeywords = "function|if|in|break|next|repeat|else|for" +
	"|return|switch|while|try|tryCatch|stop|warning|require|library" +
	"|attach|detach|source|setMethod|setGeneric|setGroupGeneric|setClass";
var rKeywordsL = rKeywords.split("|");

var rBuiltIns = "zapsmall xzfile xtfrm xor writeLines writeChar writeBin write withVisible withRestarts within" +
	"withCallingHandlers withAutoprint with while which weekdays warnings warning version Vectorize vector vapply" +
	"validUTF8 validEnc utf8ToInt UseMethod url unz untracemem untrace unsplit unserialize unname unlockBinding unloadNamespace" +
	"unlist unlink unique union undebug unclass typeof tryCatch try truncate trunc trimws trigamma" +
	"transform tracingState tracemem traceback trace toupper toString topenv tolower textConnectionValue textConnection" +
	"testPlatformEquivalence tempfile tempdir tcrossprod taskCallbackManager tapply tanpi tanh tan tabulate table T t system2 system" +
	"switch sweep svd suspendInterrupts suppressWarnings suppressPackageStartupMessages suppressMessages summary sum" +
	"substring substr substitute subset sub strwrap structure strtrim strtoi strsplit strrep strptime strftime" +
	"stopifnot stop stdout stdin stderr startsWith standardGeneric srcref srcfilecopy srcfilealias srcfile sQuote sqrt sprintf split" +
	"source sort solve socketSelect socketConnection sinpi sink sinh single sin simplify2array simpleWarning simpleMessage simpleError" +
	"simpleCondition signif signalCondition sign shQuote showConnections setwd setTimeLimit setSessionTimeLimit setNamespaceInfo setHook" +
	"setequal setdiff serialize sequence seq_len seq_along seq seek searchpaths search scan scale saveRDS save sapply sample rowSums" +
	"rowsum rownames rowMeans row round RNGversion length lchoose lbeta lazyLoadDBfetch lazyLoadDBexec" +
	"RNGkind rm rle rev returnValue return retracemem restartFormals restartDescription requireNamespace require replicate replace repeat" +
	"rep_len rep removeTaskCallback remove regmatches registerS3methods registerS3method regexpr regexec Reduce Recall" +
	"readRenviron readRDS readLines readline readChar readBin Re rcond rbind rawToChar rawToBits rawShift rawConnectionValue rawConnection" +
	"raw rapply rank range R_system_version quote quit quarters qr q pushBackLength pushBack psigamma provideDimnames prod prmatrix print" +
	"prettyNum pretty Position polyroot pmin pmax pmatch pipe pi pcre_config paste0 paste parseNamespaceFile parse" +
	"packBits packageStartupMessage packageHasNamespace packageEvent package_version outer ordered order options open OlsonNames" +
	"oldClass objects nzchar numeric_version numeric NROW nrow normalizePath norm noquote nlevels ngettext NextMethod next Negate NCOL ncol" +
	"nchar nargs namespaceImportMethods namespaceImportFrom namespaceImportClasses namespaceImport namespaceExport" +
	"months mode Mod missing min mget message merge memDecompress memCompress mean max matrix match mapply Map" +
	"makeActiveBinding ls logical logb log2 log1p log10 log lockEnvironment lockBinding local loadNamespace loadingNamespaceInfo loadedNamespaces" +
	"load list2env list license licence library libcurlVersion lgamma lfactorial levels LETTERS letters lengths" +
	"lazyLoad lapply labels La_version La_library l10n_info kronecker kappa julian jitter isTRUE isSymmetric isSeekable isS4 isRestart isOpen" +
	"ISOdatetime ISOdate isNamespaceLoaded isNamespace isIncomplete isFALSE isdebugged isBaseNamespace isatty" +
	"invokeRestartInteractively invokeRestart invisible intToUtf8 intToBits intersect  acosh acos abs abbreviate" +
	"interactive interaction integer inherits importIntoEnv Im ifelse if identity identical icuSetCollate icuGetCollate iconvlist iconv I" +
	"gzfile gzcon gsub grouping grepRaw grepl grep gregexpr globalenv gl getwd gettextf gettext getTaskCallbackNames getSrcLines getRversion" +
	"getOption getNativeSymbolInfo getNamespaceVersion getNamespaceUsers getNamespaceName getNamespaceInfo getNamespaceImports getNamespaceExports" +
	"getNamespace getLoadedDLLs getHook getExportedValue geterrmessage getElement getDLLRegisteredRoutines getConnection getCallingDLLe" +
	"getCallingDLL getAllConnections get0 get gctorture2 gctorture gcinfo gc gamma function forwardsolve formatDL formatC format" +
	"formals forceAndCall force for flush floor findRestart findPackageEnv findInterval Find Filter file fifo factorial factor F extSoftVersion" +
	"expression expm1 exp exists evalq eval environmentName environmentIsLocked environment enquote endsWith Encoding" +
	"encodeString enc2utf8 enc2native emptyenv eigen eapply dynGet duplicated dump droplevels drop dQuote dput double dontCheck dirname dir" +
	"digamma difftime diff dget determinant detach det deparse delayedAssign asNamespace asinh asin" +
	"debugonce debuggingState debug date cut curlGetHeaders cumsum cumprod cummin cummax Cstack_info crossprod cospi cosh cos contributors Conj" +
	"conflicts conditionMessage conditionCall computeRestarts complex comment commandArgs colSums colnames colMeans col" +
	"closeAllConnections close clearPushBack class choose chol2inv chol chkDots check_tzones chartr charToRaw charmatch character ceiling" +
	"cbind cat casefold capabilities callCC call c bzfile by builtins browserText browserSetDebug browserCondition browser break bquote body" +
	"bitwXor bitwShiftR bitwShiftL bitwOr bitwNot bitwAnd bindtextdomain bindingIsLocked bindingIsActive beta besselY besselK besselJ besselI" +
	"basename baseenv backsolve autoloader autoload attributes attr attachNamespace attach atanh atan2 atan assign asS4 asS3" +
	"arrayInd array args Arg apply append aperm anyNA anyDuplicated any allowInterrupts all alist agrepl agrep addTaskCallback addNA";
var rBuiltInsL = rBuiltIns.split(" ");

function getCompletions(token, context) {
	var found = [];
	var start = token.string;
	function maybeAdd(str) {
		if (str.lastIndexOf(start, 0) === 0 && !arrayContains(found, str)) {
			found.push(str);
		}
	}

	function gatherCompletions(_obj) {
		forEach(rBuiltInsL, maybeAdd);
		forEach(rKeywordsL, maybeAdd);
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
