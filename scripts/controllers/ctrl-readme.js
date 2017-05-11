(function (global) {
var ctrlReadme = {};

var readmeState = true; // instruction displayed, examples and media hidden
var _readme = $("#readme");

ctrlReadme.enterReadmeState = function() {
	if (!readmeState) {
		readmeState = true;
		$ctrlVocab.reset();
		$ctrlExamples.remove();
		$ctrlMedia.remove();
		_readme.css("display", "block");
		_readme.scrollTop(0);
	}
}

ctrlReadme.leaveReadmeState = function() {
	if (readmeState) {
		readmeState = false;
		$ctrlExamples.show();
		$ctrlMedia.show();
		_readme.css("display", "none");
	}
}

$(function() {
	var README_URL = "snippets/readme.html";
	$.get(README_URL, function(readmeHtml) {
		_readme.html(readmeHtml);
	});
});

global.$ctrlReadme = ctrlReadme;
})(window);
