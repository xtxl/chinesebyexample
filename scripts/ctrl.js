(function (global) {
var ctrl = {};
var EXAMPLES;
var currentEntry;
var selectedExample;
var players = [{'divId': 'youtube1'}, {'divId': 'youtube2'}];
var currentPlayer = 0; // currently playing youtube player
var readmeState = true; // instruction displayed, examples and media hidden

var _readme = $("#readme");
var _examples = $("#examples");
var _media = $("#media");
var _mediaTitle = $("#media-title");
var _snackbar = $("#snackbar");

/* EVENT HANDLERS */

ctrl.loadExamples = function (entry) {
	// don't do anything if alt key is held or examples not yet loaded
	if (EXAMPLES === undefined) { return; }
	currentEntry = entry;
	loadExamples();
}

ctrl.loadMedia = function (e, exampleIndex, preloadIndex) {
	// don't do anything if alt key is held or youtube not ready
	if (e.altKey || !players[0].player) { return; }
	selectExample(exampleIndex);
	var example = EXAMPLES[exampleIndex];
	_mediaTitle.text($lang.chineseWrapper(example.source));

	// example was preloaded
	if (players[1-currentPlayer].example === example && players[currentPlayer].example !== example) {
		if (players[currentPlayer].player) { players[currentPlayer].player.pauseVideo(); }
		currentPlayer = 1-currentPlayer;
		players[currentPlayer].player.seekTo(players[currentPlayer].example.start);
		players[currentPlayer].player.playVideo();
	}

	// example was not preloaded
	else {
		loadMediaForPlayer(currentPlayer, example);
	}

	// show current player, hide preload player
	$('#' + players[currentPlayer].divId).css({"display": "block"});
	$('#' + players[1-currentPlayer].divId).css({"display": "none"});

	// preload next
	if (preloadIndex != -1) {
		loadMediaForPlayer(1-currentPlayer, EXAMPLES[preloadIndex], true);
	}
}

var randomizeExamples;
function consoleHandler(e) {
	if (e.which !== 13) { return; }
	var cmd = $(this).val();
	var n;

	// toggle popup dictionary
	if (cmd === "p") {
		var enabled = $popupDict.toggleDict();
		snackbarMessage((enabled ? "Enabled" : "Disabled") + " Popup Dictionary");
	}

	// toggle text select for popup dictionary
	else if (cmd === "s") {
		var enabled = $popupDict.toggleSelect();
		snackbarMessage((enabled ? "Enabled" : "Disabled") + " Popup Dictionary Text Selection");
	}

	// toggle simplified or traditional chinese
	else if (cmd === "x") {
		$lang.isTraditional = !$lang.isTraditional;
		var convertFunction = $lang.isTraditional ? $lang.toTraditional : $lang.toSimplified;
		var convertedExamples = convertFunction(_examples.html()),
				convertedTitle = convertFunction(_mediaTitle.text());
		_examples.html(convertedExamples);
		_mediaTitle.text(convertedTitle);
		$ctrlVocab.convertHtml(convertFunction);
		snackbarMessage(($lang.isTraditional ? "Traditional" : "Simplified") + " Chinese");
	}

	// randomize vocabulary
	else if (cmd === "r") {
		var isRandom = $ctrlVocab.toggleRandom();
		snackbarMessage("Vocabulary " + (isRandom ? "Randomly Shuffled" : "Derandomized"));
	}

	// randomize examples
	else if (cmd == "e") {
		randomizeExamples = !randomizeExamples;
		//if ($ctrlVocab.selectedVocab) { loadExamples(); }
		snackbarMessage((randomizeExamples ? "Enabled" : "Disabled") + " Example Randomization");
	}

	// vocab range
	else if (n = Math.floor(cmd)) {
		$ctrlVocab.setVocabRange(n);
	}
	else if ((n = cmd.indexOf("-")) != -1) {
		var left = Math.floor(cmd.substring(0, n));
		var right = Math.floor(cmd.substring(n+1));
		if (left && right) { $ctrlVocab.setVocabRange(left, right); }
	}

	// vocab search if not matching any commands
	else {
		$ctrlVocab.search(cmd);
		snackbarMessage('Search: "' + cmd + '"');
	}
	$(this).val("");
}

var SEEK_SKIP = 5;
function keyupHandler(e) {
	// Esc
	if (e.which === 27) {
		enterReadmeState();
	}
	// Shift
	else if (e.which === 16) {
		if (!players[currentPlayer].player) { return; }
		var playerState = players[currentPlayer].player.getPlayerState();
		// pause video if not paused (2), else play video
		if (playerState !== 2) { players[currentPlayer].player.pauseVideo(); }
		else { players[currentPlayer].player.playVideo(); }
	}
	// Left
	else if (e.which === 37) {
		var p = players[currentPlayer].player;
		if (p) {
			var e = players[currentPlayer].example;
			var target = p.getCurrentTime() - SEEK_SKIP;
			if (target > e.start) { p.seekTo(target); }
		}
	}
	// Right
	else if (e.which === 39) {
		var p = players[currentPlayer].player;
		if (p) {
			var e = players[currentPlayer].example;
			var target = p.getCurrentTime() + SEEK_SKIP;
			if (target < e.end) { p.seekTo(target); }
		}
	}
}

// when example section ends, prepare it to be played again
function onPlayerStateChange(event) {
	if (event.data === YT.PlayerState.ENDED) {
		players[currentPlayer].player.seekTo(players[currentPlayer].example.start);
		players[currentPlayer].player.pauseVideo();
	}
}

window.onYouTubeIframeAPIReady = function() {
	players[0].player = new YT.Player("youtube1", {
		videoId: "jNQXAC9IVRw",
		events: { 'onStateChange': onPlayerStateChange }
	});
	players[1].player = new YT.Player("youtube2", {
		videoId: "jNQXAC9IVRw",
		events: { 'onStateChange': onPlayerStateChange }
	});
}

/* HELPERS */

function enterReadmeState() {
	if (!readmeState) {
		readmeState = true;
		$ctrlVocab.reset();
		_examples.css("display", "none");
		_examples.html("");
		_media.css("display", "none");
		_mediaTitle.text("");
		$('#' + players[currentPlayer].divId).css({"display": "none"});
		selectExample(null);
		if (players[currentPlayer].player) {
			players[currentPlayer].player.pauseVideo();
		}
		_readme.css("display", "block");
		_readme.scrollTop(0);
	}
}

ctrl.leaveReadmeState = function() {
	if (readmeState) {
		readmeState = false;
			_examples.css("display", "block");
			_media.css("display", "table");
		_readme.css("display", "none");
	}
}

var EXAMPLE_URL = "snippets/example.html";
function loadExamples() {
	$.get(EXAMPLE_URL, function(exampleHtml) {
		var reselect; // if the example section is reloaded, the selected example must be reselected
		var currentExampleIndices = currentEntry.exampleIndices;
		var chinese = currentEntry.chinese;
		var exampleIndices = randomizeExamples ? $utils.shuffle(currentExampleIndices.slice()) : currentExampleIndices;
		var finalHtml = '<h1>' + chinese + " (" + exampleIndices.length + ")</h1>";
		for (var i = 0; i < exampleIndices.length; i++) {
			var exampleIndex = exampleIndices[i];
			if (selectedExample && selectedExample.exampleIndex === exampleIndex) {
				reselect = exampleIndex;
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
		if (reselect) { selectExample(reselect); }

		// preloading
		if (!players[0].player) { return; }
		var firstExample = EXAMPLES[exampleIndices[0]];
		if (typeof players[currentPlayer].example === undefined || (
				players[currentPlayer].example !== firstExample &&
				players[1-currentPlayer].example !== firstExample)) {
			loadMediaForPlayer(1-currentPlayer, firstExample, true);
		}
	});
}

function loadMediaForPlayer(playerIndex, example, paused=false) {
	// already loaded
	if (example === players[playerIndex].example) {
		players[playerIndex].player.seekTo(example.start);
		if (!paused) { players[playerIndex].player.playVideo(); }
	}

	// not loaded
	else {
		players[playerIndex].player.loadVideoById({'videoId': example.id,
																							 'startSeconds': example.start,
																							 'endSeconds': example.end});
		players[playerIndex].example = example;
	}

	if (paused) { players[playerIndex].player.pauseVideo(); }
}

var SELECTED_COLOR = "#DDFFBB";
function selectExample(newExampleIndex=null) {
	if (selectedExample) {
		selectedExample.css("background-color", "");
	}
	if (!newExampleIndex) {
		selectedExample = null;
		return;
	}
	selectedExample = $("#example_" + newExampleIndex);
	selectedExample.exampleIndex = newExampleIndex;
	selectedExample.css("background-color", SELECTED_COLOR);
}

// insert dynamic data into html snippets
function insertProperties(str, mapping) {
	var regex = new RegExp(Object.keys(mapping).join("|"), "g");
	return str.replace(regex, function(match) {
		return mapping[match];
	});
}

var snackCount = 0;
function snackbarMessage(message) {
	snackCount++;
	if (!_snackbar.attr("class")) { _snackbar.toggleClass("show"); }
	_snackbar.text(message);
	setTimeout(function() {
		snackCount--;
		if (snackCount == 0) { _snackbar.toggleClass("show"); }
	}, 3000);
}

/* RUN */

var EXAMPLES_JSON_URL = "json/examples.json";
$.getJSON(EXAMPLES_JSON_URL, function (data) {
	EXAMPLES = data;
});

$(function() {
	$("#console").keypress(consoleHandler);

	var README_URL = "snippets/readme.html";
	$.get(README_URL, function(readmeHtml) {
		_readme.html(readmeHtml);
	});

	$(document).on("mousemove", $popupDict.mouseMoveHandler);
	$(document).keyup(keyupHandler);
});

global.$ctrl = ctrl;
})(window);
