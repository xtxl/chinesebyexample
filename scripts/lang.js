(function (global) {
var lang = {"isTraditional": false};
var stDict; // simplified to traditional dictionary
var tsDict; // traditional to simplified dictionary

lang.toSimplified = function(str) {
	return convertWithDict(tsDict, str);
};
lang.toTraditional = function(str) {
	return convertWithDict(stDict, str);
};

lang.chineseWrapper = function(chinese) {
	return lang.isTraditional ? lang.toTraditional(chinese) : chinese;
}

function addTraditionalKeys() {
	if (lang.dict && stDict) {
		for (key in lang.dict) {
			lang.dict[lang.toTraditional(key)] = lang.dict[key]
		}
	}
}

function convertWithDict(dict, str) {
	if (!dict) { return str; }
	var result = "";
	for (var i in str) {
		if (dict.hasOwnProperty(str[i])) {
			result += dict[str[i]];
		} else {
			result += str[i];
		}
	}
	return result;
}

$.getJSON("../json/dict.json", function(data) {
	lang.dict = data;
	addTraditionalKeys();
});
$.getJSON("../json/simplified-to-traditional.json", function(data) {
	stDict = data;
	addTraditionalKeys();
});
$.getJSON("../json/traditional-to-simplified.json", function(data) {
	tsDict = data;
});

global.$lang = lang;
})(window);
