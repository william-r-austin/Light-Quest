GameManager = (function() {
	
	var returnToLobbyButtonInitialized = false;
	
	function shuffle(a) {
	    var j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        x = a[i];
	        a[i] = a[j];
	        a[j] = x;
	    }
	    return a;
	}
	
	
	// Display page for the users to answer the prompts and submit their responses. 
	function displayGamePromptsPage() {
		$("#gameRoomSetupPage").hide();
		$("#gamePage").show();
		$("#gamePromptsSection").show();
		$("#responseWaitingSection").hide();
		$("#gameUserStatusSection").show();
		$("#gamePageBanner").text("Alright " + UserInfo.getUserName() + ", it's game time!")
		
		var promptsList = GamePromptsInfo.getGamePromptsList();
		
		for(var j = 0; j < promptsList.length; j++) {
			var promptItem = promptsList[j];
			var promptElement = 
				'<div style="margin-bottom: 20px;">' +
				'  <div>' + promptItem.promptText + '</div>' +
				'  <div><textarea id="response-' + j + '" class="promptResponse" data-prompt-key="' + promptItem.promptKey + '" rows="3" columns="200"></textarea></div>' +
				'</div>';

			$("#gamePromptsDiv").append(promptElement);
		}
		
		$("#submitResponsesButton").on("click", submitResponsesClicked);
	}
	
	function saveResponses() {
		var db = App.getDatabase();
		var gameResponsesRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		
		var responseArray = $("textarea.promptResponse");
		var responseCount = responseArray.length;
		
		for(var i = 0; i < responseCount; i++) {
			var jqResponse = $(responseArray[i]);
			var responseText = jqResponse.val();
			var promptKey = jqResponse.attr("data-prompt-key");
			
			var childRef = gameResponsesRef.child("responses/prompt/" + promptKey + "/user/" + UserInfo.getUserKey());
			childRef.set({"responseText": responseText});
		}
		
		console.log("Saved " + responseCount + " responses for " + UserInfo.getUserName() + ".");
	}
		
	function showResponseWaitingScreen() {
		$("#gamePromptsSection").hide();
		$("#votingSection").hide();
		$("#responseWaitingSection").show();
		$("#gameUserStatusSection").show();
		
		var gameState = GameStateInfo.getGameState();
		
		if(gameState.stepName == "COLLECT_RESPONSES") {
			$("#gamePageBanner").text("Nice answers " + UserInfo.getUserName() + "!");
			$("#responseWaitingBanner").text("Sit tight while the slowpokes finish up! You'll be able to vote on the answers once everyone is done.");
		}
		else if (gameState.stepName == "VOTING") {
			$("#gamePageBanner").text("Thanks for voting " + UserInfo.getUserName() + "!");
			$("#responseWaitingBanner").text("Hang in there while we collect the votes from everybody else.");
		}
		
		console.log("Showed waiting section.");
	}
	
	function setUserStatusToDone() {
		var db = App.getDatabase();
  		var userStatusRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game/userStatus");
		var myUserStatusRef = userStatusRef.child("user/" + UserInfo.getUserKey());
		myUserStatusRef.set(true);
		
		console.log("Updated user status to complete for " + UserInfo.getUserName() + ".");
	}
	
	function submitResponsesClicked(event) {
		// 0. Remove listener?
		$("#submitResponsesButton").off("click");
		
		// 1. Save Responses
		saveResponses();
		
		// 2. Update screen
		showResponseWaitingScreen();
		
		// 3. Mark user status completed
		setUserStatusToDone();
	}
	
	function saveVoteResponse(voteUserKey) {
		var gameState = GameStateInfo.getGameState();
		
		if(gameState.stepName == "VOTING") {
			var promptNumber = gameState.promptNumber;
			
			var gamePrompts = GamePromptsInfo.getGamePromptsList();
			var prompt = gamePrompts[promptNumber];
			var promptKey = prompt.promptKey;
			
			var db = App.getDatabase();
			var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
			var voteChildRef = gameRef.child("votes/prompt/" + promptKey + "/user/" + UserInfo.getUserKey());
			voteChildRef.set(voteUserKey);
			console.log("Saved vote of " + voteUserKey + " for user: " + UserInfo.getUserName() + " and prompt: " + promptKey);
		}
		else {
			console.log("Ooops - Trying to save a vote from the wrong state. Current state is: " + gameState.stepName);
		}
	}
	
	function submitVoteClicked(event) {
		// 1. Save the vote response
		var voteUserKey = $(event.target).attr('data-user-key');
		saveVoteResponse(voteUserKey);
		
		// 1a. Remove the listeners
		$("button.vote-button").off("click");
		
		// 2. Update the screen
		showResponseWaitingScreen();
		
		// Set set the status to done
		setUserStatusToDone();
	}
	
	function populateVotingChoices() {
		var gameState = GameStateInfo.getGameState();
		var prompts = GamePromptsInfo.getGamePromptsList();
		var promptNumber = gameState.promptNumber; 
		
		var prompt = prompts[promptNumber];
		
		// Get the responses from the db
		var db = App.getDatabase();
		var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		var userResponsesRef = gameRef.child("responses/prompt/" + prompt.promptKey + "/user");
		
		userResponsesRef.orderByKey().once('value').then(
			function(dataSnapshot) {
				if(dataSnapshot.exists) {
					var responseObj = dataSnapshot.val();
					var userKeysArray = Object.keys(responseObj);
					shuffle(userKeysArray);
					
					var gameResponsesForPrompt = {};
					
					for(var z = 0; z < userKeysArray.length; z++) {
						var responseUserKey = userKeysArray[z];
						var answer = responseObj[responseUserKey];
						var responseText = answer.responseText;
						gameResponsesForPrompt[responseUserKey] = responseText;
						
						if(UserInfo.getUserKey() != responseUserKey) {
							
							
							// Escape the answer!!
							var responseTextSafe = $("<div>").text(responseText).html();
							
							var sectionText = 
								'<div style="margin-bottom: 20px;">' +
								'  <div>' + responseTextSafe  + '</div>' +
								'  <div><button type="button" data-user-key="' + responseUserKey + '" id="vote-button-' + z + '" class="vote-button">Vote for this answer!</button></div>'
								'</div>';
							
							$("#votingChoicesDiv").append(sectionText);
						}
					}
					
					GameResponsesInfo.setGameResponseForPrompt(prompt.promptKey, gameResponsesForPrompt);
					
					$("button.vote-button").on("click", submitVoteClicked);
				}
			});
		
		// All done
	}
	
	function showVotingSection() {
		var gameState = GameStateInfo.getGameState();
		var prompts = GamePromptsInfo.getGamePromptsList();
		
		var promptCount = prompts.length;
		var promptNumber = gameState.promptNumber; 
		
		var prompt = prompts[promptNumber];
		
		$("#gamePromptsSection").hide();
		$("#responseWaitingSection").hide();
		$("#votingSection").show();
		$("#votingChoicesDiv").empty();
		$("#gameUserStatusSection").show();
		$("#resultsContentDiv").empty();
		$("#resultsSection").hide();
		
		
		$("#gamePageBanner").text("Hey " + UserInfo.getUserName() + ", it's time to vote!");
		$("#votingInstructions").text("This is round " + (promptNumber + 1) + " of " + promptCount + " rounds. Review the prompt and choose the answer from the other players that you liked the best!")		
		$("#votingPrompt").text(prompt.promptText);
	}
	
	function initializeVotingPage() {
		// 1. Show the elements on the page.
		showVotingSection();
		
		// 2. Query and display the voting choices in the section.
		populateVotingChoices(); 
	}
	
	
	function showResultsSection() {
		var gameState = GameStateInfo.getGameState();
		var prompts = GamePromptsInfo.getGamePromptsList();
		
		var promptCount = prompts.length;
		var promptNumber = gameState.promptNumber; 
		
		var prompt = prompts[promptNumber];
		
		$("#gamePromptsSection").hide();
		$("#responseWaitingSection").hide();
		$("#votingSection").hide();
		$("#votingChoicesDiv").empty();
		$("#gameUserStatusSection").hide();
		$("#resultsContentDiv").empty();
		$("#resultsSection").show();
		
		$("#gamePageBanner").text("Let's take a look at the voting results!");
		$("#resultsBanner").text("Prompt " + (promptNumber + 1) + " of " + promptCount + ". We asked: " + prompt.promptText);
	}
	
	function populateVotingResultsFromLocal() {
		var gameState = GameStateInfo.getGameState();
		var prompts = GamePromptsInfo.getGamePromptsList();
		var promptNumber = gameState.promptNumber;
		
		var prompt = prompts[promptNumber];
		var gameResponses = GameResponsesInfo.getGameResponseForPrompt(prompt.promptKey);
		
		var responseUserKeys = Object.keys(gameResponses);
		var gameUsersMap = GameUsersInfo.getGameUsersMap();
		
		var votingResults = GameVotingInfo.getVotingResultsForPrompt(prompt.promptKey);
		
		for(var i = 0; i < responseUserKeys.length; i++) {
			var responseUserKey = responseUserKeys[i];
			var votedForAnswerUserKeys = votingResults[responseUserKey];
			
			var responseDiv = $("<div>").attr("id", "response-" + i).css("margin-bottom", "25px");
			
			var introText = "";
			if(UserInfo.getUserKey() == responseUserKey) {
				introText += "Here's your answer! ";
			}
			introText += (gameUsersMap[responseUserKey] + " wrote: ");
			
			responseDiv.append($("<div>").text(introText));
			
			responseDiv.append($("<div>").css("font-weight", "bold").text(gameResponses[responseUserKey]));
			responseDiv.append($("<div>").text("Total votes: " + votedForAnswerUserKeys.length));
			
			if(votedForAnswerUserKeys.length > 0) {
				votedForUserList = $("<div>");
				
				for(var j = 0; j < votedForAnswerUserKeys.length; j++) {
					var votedForAnswerUserKey = votedForAnswerUserKeys[j];
					var liText = "- " + gameUsersMap[votedForAnswerUserKey];
					
					if(UserInfo.getUserKey() == votedForAnswerUserKey) {
						liText += " (your vote)";
					}
					
					votedForUserList.append($("<div>").css("margin-left", "10px").text(liText));
				}
				
				responseDiv.append(votedForUserList);
			}
			
			$("#resultsContentDiv").append(responseDiv);
		}
		
		if(UserInfo.getUserKey() == RoomInfo.getRoomOwnerKey()) {
			var continueButtonText =
				'<div><button id="continueFromResultsButton">Done Reviewing Results</button><div>';
			
			$("#resultsContentDiv").append(continueButtonText);
			$("#continueFromResultsButton").on("click", doneReviewingClicked);
		}
	}
	
	function doneReviewingClicked(event) {
		// Remove the handler
		$("#continueFromResultsButton").off("click");
		
		// Advance the game state
		advanceGameState();
	}
	
	function populateVotingResults() {
		var votingResultsInitialized = GameVotingInfo.isInitialized();
		
		if(votingResultsInitialized) {
			populateVotingResultsFromLocal();
		}
		else {
			// Get the responses from the db
			var db = App.getDatabase();
			var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
			var votingResultsRef = gameRef.child("votes/prompt");
			
			votingResultsRef.orderByKey().once('value').then(
				function(dataSnapshot) {
					if(dataSnapshot.exists) {
						var responseObj = dataSnapshot.val();
						var gameUsersArray = Object.keys(GameUsersInfo.getGameUsersMap());
						
						// Save the data locally so we can use it for all the results, as well as the final tally.
						GameVotingInfo.setVotingResults(responseObj, gameUsersArray);
						
						// Done querying. Load the page.
						populateVotingResultsFromLocal();
					}
					else {
						console.log("Whoops! No data for voting results query.");
					}
				});
		}
	}
	
	function initializeResultsPage() {
		// 1. Show the results section on the page
		showResultsSection();
		
		// 2. Query and display the results
		populateVotingResults();
	}
	
	function hideGamePage() {
		// Hide everything

		// Game Prompts Section
		$("#gamePromptsSection").hide();
		$("#gamePromptsDiv").empty();
		
		// Response Waiting Section - not used?
		$("#responseWaitingSection").hide();
		$("#responseWaitingBanner").empty();
				
		// Voting Section
		$("#votingInstructions").empty();
		$("#votingPrompt").empty();
		$("#votingChoicesDiv").empty();
		$("#votingSection").hide();
		
		// Results Section
		$("#resultsBanner").empty();
		$("#resultsContentDiv").empty();
		$("#resultsSection").hide();
				
		// User Status Section
		$("#userStatusWorkingList").empty();
		$("#userStatusFinishedList").empty();
		$("#gameUserStatusSection").hide();
		
		// The Game page
		$("#gamePageBanner").empty();
		$("#gamePage").hide();
	}
	
	function setupReturnToLobbyButton() {	
		
		if(!returnToLobbyButtonInitialized) {
			$("#returnToLobbyButton").on("click", function(event) {
				
				$("#finalGameSummaryBanner").empty();
				$("#finalGameSummaryDetails").empty();
				$("#finalGameSummaryPage").hide();
				
				AddUserManager.enterLobby();
			});
			returnToLobbyButtonInitialized = true;
		}
	}
	
	function displayGameSummaryPage() {
		$("#finalGameSummaryPage").show();
		
		$("#finalGameSummaryBanner").text("Hey " + UserInfo.getUserName() + ", thanks for playing! We hope you enjoyed the game!");
	  
		var finalScoreMap = GameVotingInfo.getVotingResultsForFullGame();
		var gameUsersMap = GameUsersInfo.getGameUsersMap();
		
		var descriptionDiv = $("<div>").text("The final game scores, representing the total vote counts, are below.");
		var scoreList = $("<ul>");
		
		var userKeyArray = Object.keys(finalScoreMap);
		for(var i = 0; i < userKeyArray.length; i++) {
			var userKey = userKeyArray[i];
			var itemText = gameUsersMap[userKey];
			if(UserInfo.getUserKey() == userKey) {
				itemText += " (you)";
			}
			
			itemText += (": " + finalScoreMap[userKey]);
			var itemElement = $("<li>").text(itemText);
			scoreList.append(itemElement);
		}
		
		$("#finalGameSummaryDetails").append(descriptionDiv);
		$("#finalGameSummaryDetails").append(scoreList);
	}
	
	function deleteGameRoomFromDatabase() {
		// Only the room owner should do this
		if(UserInfo.getUserKey() == RoomInfo.getRoomOwnerKey()) {
			var db = App.getDatabase();
			var roomRef = db.ref("rooms/" + RoomInfo.getRoomKey());
			roomRef.remove();
			console.log("Removed game room from database!");
		}
	}
	
	function clearAllLocalData() {
		GameVotingInfo.clear();
		GameResponsesInfo.clear();
		GameStateInfo.clear();
		GamePromptsInfo.clear();
		GameUsersInfo.clear();
		RoomInfo.clear();
	}
	
	function initializeGameSummaryPage() {
		// 1. Hide the Game Page
		hideGamePage();
		
		// 2. Build and show the game summary page.
		displayGameSummaryPage();
				
		// 3. Bind button click for Return to Lobby.
		setupReturnToLobbyButton();
		
		// 4. Stop all Firebase DB Listeners
		stopListeningToGameState();
		stopListeningToUserStatus();
		
		// 5. Delete room
		// deleteGameRoomFromDatabase();
		
		// 6. Clear all local data sources
		clearAllLocalData();
	}
	
	function onChangeGameState(dataSnapshot) {
		if(dataSnapshot.exists()) {
			var gameStateObj = dataSnapshot.val();
			console.log("Got new game state:");
			console.log(gameStateObj);
						 
			GameStateInfo.setGameState(gameStateObj);
			
			if(gameStateObj.stepName == "VOTING") {
				initializeVotingPage();
			}
			else if(gameStateObj.stepName == "RESULTS") {
				initializeResultsPage();
			}
			else if(gameStateObj.stepName == "FINAL_TALLY") {
				initializeGameSummaryPage();
			}
		}
	}
	
	function stopListeningToGameState() {
		var db = App.getDatabase();
  		var gameStateRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game").child("gameState");
		gameStateRef.off("value");
		console.log("Unregistered Game State Listener");
	}
	
	function listenToGameState() {
		var db = App.getDatabase();
  		var gameStateRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game").child("gameState");
		gameStateRef.on("value", onChangeGameState);
		console.log("Registered Game State Listener");
	}
	
	function updateLocalGameUserStatus(dataSnapshot) {
		if(dataSnapshot.exists()) {
			var userStatusObj = dataSnapshot.val();
			var userStatusFromDB = userStatusObj.user;
			
			if(userStatusFromDB) {
				console.log(userStatusFromDB);
				var gameUsersMap = GameUsersInfo.getGameUsersMap();
				
				var userKeysList = Object.keys(userStatusFromDB);
				for(var k = 0; k < userKeysList.length; k++) {
					var userKeyValue = userKeysList[k];
					var userStatusValue = userStatusFromDB[userKeyValue];
					
					var changed = GameUsersInfo.setGameUsersStatus(userKeyValue, userStatusValue);
					console.log("Found user status for " + gameUsersMap[userKeyValue] + ". Changed = " + changed);
				}
			}
		}
	}
	
	function updateUserStatusDisplay() {
		var userStatusMap = GameUsersInfo.getGameUsersStatusMap();
		var userNameMap = GameUsersInfo.getGameUsersMap();
		
		var workingCount = 0;
		var finishedCount = 0;
		
		$("#userStatusWorkingList").empty();
		$("#userStatusFinishedList").empty();
		
		for (const [userKey, userStatusValue] of Object.entries(userStatusMap)) {
  			var liText = userNameMap[userKey];
			if(userKey == UserInfo.getUserKey()) {
				liText += " (you)";
			}
	
			if(userStatusValue == true) {
				$("#userStatusFinishedList").append("<li>" + liText + "</li>");
				finishedCount++;
			}
			else if(userStatusValue == false) {
				$("#userStatusWorkingList").append("<li>" + liText + "</li>");
				workingCount++;
			}
			else {
				console.log("Uh oh. Bad status value of " + userStatusValue + " for user " + userKey);
			}
		}
		
		if(workingCount > 0) {
			$("#userStatusWorkingHeader").show();
			$("#userStatusWorkingList").show();
		}
		else {
			$("#userStatusWorkingHeader").hide();
			$("#userStatusWorkingList").hide();
		}
		
		if(finishedCount > 0) {
			$("#userStatusFinishedHeader").show();
			$("#userStatusFinishedList").show();
		}
		else {
			$("#userStatusFinishedHeader").hide();
			$("#userStatusFinishedList").hide();
		}
	}
	
	function checkStepCompleted() {
		var userStatusMap = GameUsersInfo.getGameUsersStatusMap();
		var userStatusArray = Object.values(userStatusMap);
		
		var allComplete = true;
		var i = 0;
		while(i < userStatusArray.length && allComplete) {
			allComplete = userStatusArray[i];
			i++;
		}
		
		return allComplete;
	}
	
	function resetGameUsersStatusToWorking() {
		GameUsersInfo.resetGameUsersStatus();
		var gameUsersStatusMap = GameUsersInfo.getGameUsersStatusMap();
		
		var db = App.getDatabase();
		var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		var userStatusRef = gameRef.child("userStatus/user");
		
		userStatusRef.set(gameUsersStatusMap);
		
		/*
		var gameInfoUserStatusMap = GameUsersInfo.getGameUsersStatusMap();
		var userStatusMap = JSON.parse(JSON.stringify(gameInfoUserStatusMap));
		
		var userKeys = Object.keys(userStatusMap);
		for(var i = 0; i < userKeys.length; i++) {
			var userKey = userKeys[i];
			userStatusMap[userKey] = false;
			GameUsersInfo.setGameUsersStatus(userKey, false);
		}
		*/
	}
	
	function advanceGameState() {
		var currentGameState = GameStateInfo.getGameState();
		
		var newGameState = {};
				
		if(currentGameState.stepName == "COLLECT_RESPONSES") {
			newGameState.stepName = "VOTING";
			newGameState.promptNumber = 0;
		}
		else if(currentGameState.stepName == "VOTING" || currentGameState.stepName == "RESULTS") {
			var gamePromptsList = GamePromptsInfo.getGamePromptsList();
			var totalPromptCount = gamePromptsList.length;
			
			var currentPromptNumber = currentGameState.promptNumber;
			if(currentPromptNumber < totalPromptCount - 1) {
				newGameState.stepName = currentGameState.stepName
				newGameState.promptNumber = currentPromptNumber + 1;
			}
			else {
				if(currentGameState.stepName == "VOTING") {
					newGameState.stepName = "RESULTS";
					newGameState.promptNumber = 0;
				}
				else if(currentGameState.stepName == "RESULTS") {
					newGameState.stepName = "FINAL_TALLY";
				}
			}
		}
		
		var db = App.getDatabase();
		var gameStateRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game").child("gameState");
		gameStateRef.set(newGameState);
	}
	
	function advanceGameStateIfStepCompleted() {
		if(RoomInfo.getRoomOwnerKey() == UserInfo.getUserKey()) {
			
			var isComplete = checkStepCompleted();
			
			if(isComplete) {
				// Reset all user states back to false
				resetGameUsersStatusToWorking();
				
				// Advance game state
				advanceGameState();
			}
		}
	}
	
	function onChangeUserStatus(dataSnapshot) {
		console.log("Got new user status:");
		
		// 1. Update the local data.
		updateLocalGameUserStatus(dataSnapshot);
		
		// 2. Update UI
		updateUserStatusDisplay();
		
		// 3. Check stage complete
		advanceGameStateIfStepCompleted();
	}
	
	function stopListeningToUserStatus() {
		var db = App.getDatabase();
  		var userStatusRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game").child("userStatus");
		userStatusRef.off("value");
		console.log("Unregistered User Status Listener");
	}
	
	function listenToUserStatus() {
		var db = App.getDatabase();
  		var userStatusRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game").child("userStatus");
		userStatusRef.on("value", onChangeUserStatus);
		console.log("Registered User Status Listener");
	}
	
	function retrieveAndDisplayGamePrompts() {
		var db = App.getDatabase();
		var promptsRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game/prompts");
		promptsRef.orderByKey().once('value')
			.then(function(dataSnapshot) {
				if(dataSnapshot.exists()) {
					var promptsList = [];
					dataSnapshot.forEach(function(childSnapshot) {
						var promptData = childSnapshot.val();
						var promptObj = {
							"promptKey": childSnapshot.key,
							"promptText": promptData.promptText
						};  
						promptsList.push(promptObj);
					})
					
					GamePromptsInfo.setGamePromptsList(promptsList);
					
					// Show the page
					displayGamePromptsPage();
					
					// Setup listener for gameState
					listenToGameState();
					
					// Setup listener for userStatus
					listenToUserStatus();
				}
				else {
					console.log("Uh oh - no game prompts exist!");
				}
			});
	}
	
	
	function setupPromptResponsePage() {
		// Get the prompts and setup the page for the user to enter their answers.
		retrieveAndDisplayGamePrompts();
				
		
		// Begin listener for 
		 
	}
	
	return {
		setupPromptResponsePage: setupPromptResponsePage
	};
})();