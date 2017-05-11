function consoleHandler(e) {
	if (e.which !== 13) { return; }
	var cmd = $(this).val();

	// toggle popup dictionary
	if (cmd === "p") {
		var enabled = $popupDict.toggleDict();
		$utils.snackbarMessage((enabled ? "Enabled" : "Disabled") + " Popup Dictionary");
	}

	// toggle text select for popup dictionary
	else if (cmd === "s") {
		var enabled = $popupDict.toggleSelect();
		$utils.snackbarMessage((enabled ? "Enabled" : "Disabled") + " Popup Dictionary Text Selection");
	}

	// toggle simplified or traditional chinese
	else if (cmd === "x") {
		$lang.isTraditional = !$lang.isTraditional;
		var convertFunction = $lang.isTraditional ? $lang.toTraditional : $lang.toSimplified;
		$ctrlVocab.convertHtml(convertFunction);
		$ctrlExamples.convertHtml(convertFunction);
		$ctrlMedia.convertHtml(convertFunction);
		$utils.snackbarMessage(($lang.isTraditional ? "Traditional" : "Simplified") + " Chinese");
	}

	// randomize vocabulary
	else if (cmd === "r") {
		var isRandom = $ctrlVocab.toggleRandom();
		$utils.snackbarMessage("Vocabulary " + (isRandom ? "Randomly Shuffled" : "Derandomized"));
	}

	// randomize examples
	else if (cmd == "e") {
		var isRandom = $ctrlExamples.toggleRandom();
		$utils.snackbarMessage((isRandom ? "Enabled" : "Disabled") + " Example Randomization");
	}

	// vocab range
	else if (Math.floor(cmd)) {
		$ctrlVocab.setVocabRange(Math.floor(cmd));
	}
	else if (cmd.indexOf("-") != -1) {
		var i = cmd.indexOf("-");
		var left = Math.floor(cmd.substring(0, i));
		var right = Math.floor(cmd.substring(i+1));
		if (left && right) { $ctrlVocab.setVocabRange(left, right); }
	}

	// vocab search if not matching any commands
	else {
		$ctrlVocab.search(cmd);
		$utils.snackbarMessage('Search: "' + cmd + '"');
	}
	$(this).val("");
}

$(function() {
	$("#console").keypress(consoleHandler);
	$popupDict.toggleDict();
	//$(document).keyup(keyupHandler);
});
