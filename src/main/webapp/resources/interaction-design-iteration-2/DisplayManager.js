DisplayManager = (function() {
	
	function refreshDisplayFromState(gameUserChanges) {
		var roomKey = RoomInfo.getRoomKey();
		if(roomKey) {
			var roomSetupState = RoomInfo.getRoomSetupState();
			
			if(roomSetupState == "WAITING") {
				GameSetupManager.refreshGameSetupUI(gameUserChanges);
			}
			else if(roomSetupState == "COMPLETE") {
				var gameStateObj = GameStateInfo.getGameState();

				if(gameStateObj.stepName == "COLLECT_RESPONSES") {
					console.log("Refreshing Display for state = COLLECT_RESPONSES.");
					GameManager.refreshGamePromptResponseUI();
				}
				else if(gameStateObj.stepName == "VOTING") {
					console.log("Refreshing Display for state = VOTING.");
					GameManager.refreshGameVotingUI();
				}
				else if(gameStateObj.stepName == "COMPLETE") {
					console.log("Refreshing Display for state = COMPLETE.");
					GameManager.refreshGameReviewUI();
				}
				else {
					console.log("Invalid game state step name detected: " + gameStateObj.stepName);
				}
				
				// TODO - Create GameReviewStateInfo that's local to each user.
				// The GameReviewState doesn't need to go to the DB ... yet. 
				// Combine "RESULTS" and "FINAL_TALLY" into a single
				// "COMPLETED" state (including the prompt number).
				/*
				else if(gameStateObj.stepName == "RESULTS") {
					console.log("Refreshing Display for state = RESULTS.");
					//initializeResultsPage();
				}
				else if(gameStateObj.stepName == "FINAL_TALLY") {
					console.log("Refreshing Display for state = FINAL_TALLY.");
					//initializeGameSummaryPage();
				}
				else {
					console.log("Uh-oh! Game State was invalid. Value was: " + gameStateObj.stepName);
				}*/
			}
			else {
				console.log("Uh-oh! Room Setup State was invalid. Value was: " + roomSetupState);
			}
		}
		else {
			LobbyManager.refreshLobbyUI();
		}
	}
	
	return {
		refreshDisplayFromState: refreshDisplayFromState
	}
	
})();