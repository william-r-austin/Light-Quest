LobbyManager = (function() {

	var initialized = false;

	function setupListener() {
		
		if(!initialized) {
			$("#createRoomButton").on("click", function(event) {
				console.log("User chose to create a new game.");
				GameSetupManager.createNewGameRoom();
		    });
	
			$("#joinRoomButton").on("click", function(event) {
				var roomCodeInput = $("#roomCodeInput").val();
				console.log("Room code input = " + roomCodeInput);
				GameSetupManager.tryJoinExistingGameRoom(roomCodeInput);
			});
			
			initialized = true;
		}
	}
		
	return {
		setupListener: setupListener
	};
})();