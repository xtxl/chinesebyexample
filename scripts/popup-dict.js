(function (global) {
var popupDict = {};
var popupEnabled = true;
var selectEnabled = true;
var popupDisplayed = false;

var _popup = $("#popup");

popupDict.mouseMoveHandler = function(e) {
	var entries = getVocab(e);
	// no entries, remove popup
	if (entries.length === 0) {
		if (popupDisplayed) {
			hidePopup();
			if (selectEnabled) { window.getSelection().removeAllRanges(); }
		}
		return;
	}
	var _console = $("#console");
	if (selectEnabled && _console.is(":focus")) { _console.blur(); }
	buildPopup(entries);
	showPopup(e.clientX, e.clientY);
}

// toggle dictionary, then return true if it's enabled, false otherwise
popupDict.toggleDict = function() {
	if (popupEnabled) {
		$(document).off("mousemove", $popupDict.mouseMoveHandler);
		hidePopup();
	}
	else {
		$(document).on("mousemove", $popupDict.mouseMoveHandler);
	}
	popupEnabled = !popupEnabled;
	return popupEnabled;
}

popupDict.toggleSelect = function() {
	selectEnabled = !selectEnabled;
	return selectEnabled;
}

function buildPopup(entries) {
	var s = "";
	for (var i = entries.length-1; i >= 0; i--) {
		var entry = $lang.dict[entries[i]];
		var pinyin = entry["pinyin"];
		var english = entry["english"];
		for (var j = 0; j < pinyin.length; j++) {
			s += '<span class="popupChinese">' + entries[i] + '</span>' +
					 '<span class="popupPinyin"> (' + pinyin[j] + ')</span><br>' +
					 english[j];
			if (j < pinyin.length-1) { s += '<br>'; }
		}
		if (i > 0) { s += '<br>'; }
	}
	_popup.html(s);
}

function showPopup(mouseX, mouseY) {
	var MOUSE_OFFSET_Y = 20;
	var left = mouseX - _popup.width()/2
	left = Math.max(left, 8);
	left = Math.min(left, $(window).outerWidth() - _popup.outerWidth()-8);
	_popup.css("left", left + "px");
	if (mouseY + MOUSE_OFFSET_Y + _popup.outerHeight() > $(window).outerHeight()) {
		_popup.css("top", (mouseY - MOUSE_OFFSET_Y - _popup.outerHeight()) + "px");
	} else {
		_popup.css("top", (mouseY + 20) + "px");
	}
	if (!popupDisplayed) {
		popupDisplayed = true;
		_popup.css("display", "block");
	}
}

function hidePopup() {
	popupDisplayed = false;
	_popup.css("display", "none");
}

function getVocab(event, offset=0) {
	if (!$lang.dict) { return []; }

	// obtain text element and offset under cursor
	var range, textNode;
	if (document.caretRangeFromPoint) {
		range = document.caretRangeFromPoint(event.clientX - offset, event.clientY);
		if (range) { textNode = range.startContainer; }
	}
	if (!textNode || textNode.nodeType !== Node.TEXT_NODE) { return []; }
	var data = textNode.textContent;
	var begin = range.startOffset;

	// bugfix: fix bug where startOffset = data.length
	if (begin >= data.length) {
		begin = data.length-1;
		range.setStart(textNode, begin);
	}

	// bugfix: fix bug where last character fails to be detected
	if (!$lang.dict.hasOwnProperty(data[begin])) {
		if (begin === data.length-1 && !offset) { return getVocab(event, 6); }
		return [];
	}

	// bugfix: fix bug where cursor above or left of text wrongly detects it
	var tmp = document.createRange();
	tmp.selectNodeContents(textNode);
	var rect = tmp.getClientRects()[0];

	// bugfix: must offset 1 to left for accuracy
	if (event.clientX < rect.left-1 || event.clientX > rect.right || event.clientY < rect.top) {
		return [];
	}

	// get all entries of string length 9 or less
	var entries = [data[begin]];
	var currentNode = textNode.parentNode;
	var endNode = currentNode;
	var endOffset = begin+1;
	var length = 1, MAX_LENGTH = 10;
	var currentWord = data[begin];
	var j = begin+1;
	while (true) {
		for (var i = j; i < data.length && length < MAX_LENGTH; i++) {
			currentWord += data[i];
			length++;
			if ($lang.dict.hasOwnProperty(currentWord)) {
				entries.push(currentWord);
				endNode = currentNode;
				endOffset = i+1;
			}
		}
		if (length >= MAX_LENGTH || !isInline(currentNode) || !isInline(currentNode.nextSibling)) { break; }
		// cross into the next node
		currentNode = currentNode.nextSibling;
		data = currentNode.textContent;
		j = 0;
	}

		// select longest vocab detected if select enabled
	var sel = selectEnabled ? window.getSelection() : null;
	if (sel) {
		sel.removeAllRanges();
		range.setEnd(endNode.childNodes[0], endOffset);
		sel.addRange(range);
	}

	return entries;
}

function isInline(node) {
	return node && $(node).css("display") === "inline";
}

global.$popupDict = popupDict;
})(window);
