var SEEK_SKIP = 5;
function keyupHandler(e) {
	// Esc
	if (e.which === 27) {
		$ctrlReadme.enterReadmeState();
	}
	// Shift
	else if (e.which === 16) {
		$ctrlMedia.togglePlayPause();
	}
	// Left
	else if (e.which === 37) {
		$ctrlMedia.seekOffset(-SEEK_SKIP);
	}
	// Right
	else if (e.which === 39) {
		$ctrlMedia.seekOffset(SEEK_SKIP);
	}
}

$(function() {
	$(document).keyup(keyupHandler);
});
