(function (global) {
var ctrlExamples = {};

var EXAMPLES_JSON_URL = "json/examples.json";
var EXAMPLES;
$.getJSON(EXAMPLES_JSON_URL, function (data) {
	EXAMPLES = data;
});

var currentVocabEntry;
var EXAMPLE_URL = "snippets/example.html";
var _examples = $("#examples");
var randomizeExamples = false;

var selectedExample;

ctrlExamples.loadExamples = function(vocabEntry=null) {
	currentVocabEntry = vocabEntry || currentVocabEntry;
	if (!EXAMPLES || !currentVocabEntry) { return; }
	$.get(EXAMPLE_URL, function(exampleHtml) {
		var selectedIndex = selectedExample ? selectedExample.attr("entry") : null;
		var reselect = -1;
		var exampleIndices = randomizeExamples ?
			$utils.shuffle(currentVocabEntry.exampleIndices.slice()) : currentVocabEntry.exampleIndices;
		var chinese = currentVocabEntry.chinese;
		var finalHtml = '<h1>' + chinese + " (" + exampleIndices.length + ")</h1>";
		for (var i = 0; i < exampleIndices.length; i++) {
			var exampleIndex = exampleIndices[i];
			if (selectedIndex && selectedIndex == exampleIndex) { // comparing string and number
				reselect = i+2;
			}
			var example = EXAMPLES[exampleIndex];
			var chineseLines = $lang.chineseWrapper(example.chinese).split("\n");
			var englishLines = example.english.split("\n");
			var content = "";
			for (var line in chineseLines) {
				if (chineseLines[line] != "") {
					content += "<p><span><span>" +
						chineseLines[line].replace(new RegExp(chinese, 'g'),
							'</span><span class="vocab-highlight">' + chinese + '</span><span>') +
						"</span></span><br><span>" + englishLines[line] + "</span></p>";
				}
			}
			var mapping = {"{{exampleIndex}}": exampleIndex, "{{i}}": i, "{{content}}": content};
			finalHtml += $utils.insertProperties(exampleHtml, mapping);
		}
		_examples.html(finalHtml);
		_examples.scrollTop(0);
		if (reselect != -1) { selectExample($("#examples div:nth-child(" + reselect + ")")); }
		$ctrlMedia.preloadMedia(EXAMPLES[exampleIndices[0]]);
	});
}

ctrlExamples.exampleClicked = function(e, i) {
	if (e.altKey) { return; }
	var target = $(e.target);
	while (!target.is("div")) { target = target.parent(); }
	selectExample($(target));
	var exampleIndices = currentVocabEntry.exampleIndices;
	var example = EXAMPLES[exampleIndices[i]];
	var preload = i < exampleIndices.length - 1 ? EXAMPLES[exampleIndices[i+1]] : null;
	$ctrlMedia.loadMedia(example);
	$ctrlMedia.preloadMedia(preload);
}

selectExample = function(selectedElement=null) {
	if (selectedExample) { selectedExample.removeClass("selected"); }
	if (!selectedElement) {
		selectedExample = null;
	} else {
		selectedExample = selectedElement.addClass("selected");
	}
}

ctrlExamples.convertHtml = function(convertFunction) {
	_examples.html(convertFunction(_examples.html()));
}

ctrlExamples.toggleRandom = function() {
	randomizeExamples = !randomizeExamples;
	ctrlExamples.loadExamples();
	return randomizeExamples;
}

ctrlExamples.remove = function() {
	selectExample(null);
	currentVocabEntry = null;
	_examples.css("display", "none");
	_examples.html("");
}

ctrlExamples.show = function() { _examples.css("display", "block"); }

global.$ctrlExamples = ctrlExamples;
})(window);
