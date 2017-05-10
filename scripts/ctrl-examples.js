(function (global) {
var ctrlExamples = {};

var EXAMPLES_JSON_URL = "json/examples.json";
var EXAMPLES;
$.getJSON(EXAMPLES_JSON_URL, function (data) {
	EXAMPLES = data;
});

var currentEntry;
var EXAMPLE_URL = "snippets/example.html";
var _examples = $("#examples");
var randomizeExamples = false;

function loadExamples(entry=null) {
	currentEntry = entry || currentEntry;
	if (!EXAMPLES || !currentEntry) { return; }
	$.get(EXAMPLE_URL, function(exampleHtml) {
		var reselect = -1;
		var exampleIndices = currentEntry.exampleIndices;
		var chinese = currentEntry.chinese;
		var finalHtml = '<h1>' + chinese + " (" + exampleIndices.length + ")</h1>";
		for (var i = 0; i < exampleIndices.length; i++) {
			var exampleIndex = exampleIndices[i];
			if (selectedExample && selectedExample.exampleIndex === exampleIndex) {
				reselect = i+1;
			}
			var preloadIndex = i < exampleIndices.length-1 ? exampleIndices[i+1] : -1;
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
			var mapping = {"{{exampleIndex}}": exampleIndex, "{{preloadIndex}}": preloadIndex, "{{content}}": content};
			finalHtml += insertProperties(exampleHtml, mapping);
		}
		_examples.html(finalHtml);
		_examples.scrollTop(0);
		if (reselect) { selectExample($("#examples div:nth-child(" + reselect + ")")); }

		// preloading
/*
		if (!players[0].player) { return; }
		var firstExample = EXAMPLES[exampleIndices[0]];
		if (typeof players[currentPlayer].example === undefined || (
				players[currentPlayer].example !== firstExample &&
				players[1-currentPlayer].example !== firstExample)) {
			loadMediaForPlayer(1-currentPlayer, firstExample, true);
		}
*/
	});
}

var selectedExample;

ctrlExample.selectExample = function(selectedElement=null) {
	if (selectedExample) { selectedExample.removeClass("selected"); }
	if (!selectedElement) {
		selectedExample = null;
	} else {
		selectedExample = selectedElement.addClass("selected");
	}
}

global.$ctrlExamples = ctrlExamples;
})(window);