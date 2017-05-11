(function (global) {
var ctrlMedia = {};

var players = [{"ready": false}, {"ready": false}];
var currentPlayer = 0;
var _media = $("#media");
var _mediaTitle = $("#media-title");

ctrlMedia.loadMedia = function (example) {
	_mediaTitle.text($lang.chineseWrapper(example.source));

	// example was preloaded
	if (players[1-currentPlayer].example === example && players[currentPlayer].example !== example) {
		if (players[currentPlayer].player) { players[currentPlayer].player.pauseVideo(); }
		currentPlayer = 1-currentPlayer;
	}
	loadMediaForPlayer(currentPlayer, example);
}

ctrlMedia.preloadMedia = function (example) {
	loadMediaForPlayer(1-currentPlayer, example, true);
}

ctrlMedia.togglePlayPause = function() {
	if (!players[currentPlayer].ready) { return; }
	var playerState = players[currentPlayer].player.getPlayerState();
	// pause video if not paused (2), else play video
	if (playerState !== 2) { players[currentPlayer].player.pauseVideo(); }
	else { players[currentPlayer].player.playVideo(); }
}

ctrlMedia.seekOffset = function(offset) {
	if (!players[currentPlayer].ready) { return; }
	var p = players[currentPlayer].player;
	var e = players[currentPlayer].example;
	var target = p.getCurrentTime() + offset;
	if (target > e.start && target < e.end) { p.seekTo(target); }
}

ctrlMedia.convertHtml = function(convertFunction) {
	_mediaTitle.html(convertFunction(_mediaTitle.html()));
}

ctrlMedia.remove = function() {
	_media.css("display", "none");
	_mediaTitle.text("");
	if (players[currentPlayer].element) { players[currentPlayer].element.css({"display": "none"}); }
	selectExample(null);
	if (players[currentPlayer].player) {
		players[currentPlayer].player.pauseVideo();
		}
}

ctrlMedia.show = function() { _media.css("display", "table"); }

function loadMediaForPlayer(playerIndex, example, paused=false) {
	if (!players[playerIndex].ready) { return; }
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

	if (paused) {
		players[playerIndex].player.pauseVideo();
	}
	else {
		players[currentPlayer].element.css({"display": "block"});
		players[1-currentPlayer].element.css({"display": "none"});
	}
}

window.onYouTubeIframeAPIReady = function() {
	players[0].player = new YT.Player("youtube1", {
		videoId: "jNQXAC9IVRw",
		events: { "onReady": onPlayerReady1, "onStateChange": onPlayerStateChange }
	});
	players[1].player = new YT.Player("youtube2", {
		videoId: "jNQXAC9IVRw",
		events: { "onReady": onPlayerReady2, "onStateChange": onPlayerStateChange }
	});
	players[0].element = $("#youtube1");
	players[1].element = $("#youtube2");
}

// when example section ends, prepare it to be played again
function onPlayerStateChange(event) {
	if (event.data === YT.PlayerState.ENDED) {
		players[currentPlayer].player.seekTo(players[currentPlayer].example.start);
		players[currentPlayer].player.pauseVideo();
	}
}

function onPlayerReady1(event) { players[0].ready = true; }
function onPlayerReady2(event) { players[1].ready = true; }

global.$ctrlMedia = ctrlMedia;
})(window);
