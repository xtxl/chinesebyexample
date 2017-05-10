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

global.$utils = utils;
})(window);
