(function (global) {
var utils = {};

utils.insertProperties = function(str, mapping) {
	var regex = new RegExp(Object.keys(mapping).join("|"), "g");
	return str.replace(regex, function(match) {
		return mapping[match];
	});
}

utils.shuffle = function(list) {
	for (var i = list.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var t = list[i];
		list[i] = list[j];
		list[j] = t;
	}
	return list;
}

var _snackbar = $("#snackbar");
var snackCount = 0;

utils.snackbarMessage = function(message) {
	snackCount++;
	if (!_snackbar.attr("class")) { _snackbar.toggleClass("show"); }
	_snackbar.text(message);
	setTimeout(function() {
		snackCount--;
		if (snackCount == 0) { _snackbar.toggleClass("show"); }
	}, 3000);
}

global.$utils = utils;
})(window);
