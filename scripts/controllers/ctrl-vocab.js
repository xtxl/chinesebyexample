(function (global) {
var ctrlVocab = {};

var VOCAB_JSON_URL = "json/vocab.json";
var VOCAB;
var currentVocab;
$.getJSON(VOCAB_JSON_URL, function(data) {
	VOCAB = currentVocab = data;
	loadVocab();
});

var VOCAB_URL = "snippets/vocab.html";
var vocabOffset = 0;
var _vocabContainer = $("#vocab-container");
var selectedVocab;

function loadVocab() {
	if (!currentVocab) { return; }
	$.get(VOCAB_URL, function(vocabHtml) {
		var selectedChinese = selectedVocab ? selectedVocab.attr("entry") : null;
		var reselect = -1;
		var finalHtml = '';
		for (var i = 0; i < currentVocab.length; i++) {
			var number = i + 1 + vocabOffset;
			var chinese = $lang.chineseWrapper(currentVocab[i].chinese);
			if (selectedChinese && selectedChinese === chinese) {
				reselect = i+1;
			}
			var mapping = {"{{number}}": number, "{{chinese}}": chinese};
			finalHtml += $utils.insertProperties(vocabHtml, mapping);
		}
		_vocabContainer.html(finalHtml);
		_vocabContainer.scrollTop(0);
		if (reselect != -1) {
			selectVocab($("#vocab-container div:nth-child(" + reselect + ")"));
		}
	});
}

ctrlVocab.vocabClicked = function (e, number) {
	if (e.altKey || e.target === selectedVocab) { return; }
	selectVocab($(e.target));
	$ctrlReadme.leaveReadmeState();
	$ctrlExamples.loadExamples(currentVocab[number - vocabOffset - 1]);
}

selectVocab = function(selectedElement=null) {
	if (selectedVocab) { selectedVocab.removeClass("selected"); }
	if (!selectedElement) {
		selectedVocab = null;
	} else {
		selectedVocab = selectedElement.addClass("selected");
	}
}

ctrlVocab.convertHtml = function(convertFunction) {
	_vocabContainer.html(convertFunction(_vocabContainer.html()));
}

ctrlVocab.setVocabRange = function(left, right=null) {
	if (!currentVocab) { return; }
	right = right || VOCAB.length;
	vocabOffset = Math.max(left-1, 0);
	currentVocab = VOCAB.slice(vocabOffset, right);
	loadVocab();
	$utils.snackbarMessage("Range: " + left + "-" + right);
}

var randomizeVocab = false;

ctrlVocab.toggleRandom = function() {
	if (!currentVocab) { return; }
	randomizeVocab = !randomizeVocab;
	currentVocab = randomizeVocab ?
		$utils.shuffle(currentVocab.slice()) :
		VOCAB.slice(vocabOffset, currentVocab.length+vocabOffset);
	loadVocab();
	return randomizeVocab;
}

ctrlVocab.search = function(query) {
	if (query === "") { currentVocab = VOCAB; } // shortcut
	else {
		var matched = [];
		for (i in VOCAB) {
			if (VOCAB[i].chinese.includes(query)) {
				matched.push(VOCAB[i]);
			}
		}
		currentVocab = matched;
	}
	vocabOffset = 0;
	randomizeVocab = false;
	loadVocab();
}

ctrlVocab.reset = function() {
	selectVocab(null);
	currentVocab = VOCAB;
	loadVocab();
	_vocabContainer.scrollTop(0);
}

global.$ctrlVocab = ctrlVocab;
})(window);
