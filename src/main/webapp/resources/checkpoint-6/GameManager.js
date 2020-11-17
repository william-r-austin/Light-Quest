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
		
		var gamePageBannerMarkup = 'Alright, <span id="gamePageBannerUserName" class="preserve-spaces"></span>, it\'s game time!';
		$("#gamePageBanner").html(gamePageBannerMarkup);
		$("#gamePageBannerUserName").text(UserInfo.getUserName());
		
		var promptsList = GamePromptsInfo.getGamePromptsList();
		
		for(var j = 0; j < promptsList.length; j++) {
			var promptItem = promptsList[j];
			var promptElement = 
				'<div class="gamePromptSectionCard">' +
				'  <div class="promptNumberDiv">Prompt #' + (j + 1)  + '</div>' +
				'  <div class="promptTextDiv">' + promptItem.promptText + '</div>' +
				'  <div class="promptResponseDiv">'+
				'<input type="text" id="response-' + j + '" class="promptResponse" data-prompt-key="' + promptItem.promptKey + '" placeholder="Enter your response for prompt #' + (j + 1) + '" />' +
				'</div>' +
				//'  <div><textarea id="response-' + j + '" class="promptResponse" data-prompt-key="' + promptItem.promptKey + '" rows="3" columns="200"></textarea></div>' +
				'</div>';

			$("#gamePromptsDiv").append(promptElement);
		}
		
		$("#submitResponsesButton").on("click", submitResponsesClicked);
		
		// Set the status bar to "Answer prompts"
		$("#setupState").removeClass("activeState").addClass("completedState");
		$("#promptsState").removeClass("futureState").addClass("activeState");
		
		$("#gameContainer").show("slide", {direction: "right"}, "slow", function() {});
	}
	
	function saveResponses() {
		var db = App.getDatabase();
		var gameResponsesRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		
		var responseArray = $("input.promptResponse");
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
	
	function editPromptResponses() {
		// Do this before the animation
		setUserStatusToWorking();
		
		$("#gameContainer").hide("slide", {direction: "right"}, "slow", function() {
			$("#gameRoomSetupPage").hide();
			$("#gamePage").show();
			$("#gamePromptsSection").show();
			$("#responseWaitingSection").hide();
			$("#gameUserStatusSection").show();
			
			var gamePageBannerMarkup = 'Alright, <span id="gamePageBannerUserName" class="preserve-spaces"></span>, it\'s game time!';
			$("#gamePageBanner").html(gamePageBannerMarkup);
			$("#gamePageBannerUserName").text(UserInfo.getUserName());
			
			$("#editPromptResponsesButton").off("click");
			
			$("#transitionMessage").text("Retrieving  your answers ...");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
						// Show the game page again so the user can submit their new answers.
						$("#gameContainer").show("slide", {direction: "left"}, "slow", function() {});
					});
				}, 1000);
			});
		});
	}

	function refreshResponseWaitingScreen() {
		$("#gamePromptsSection").hide();
		$("#votingSection").hide();
		$("#responseWaitingSection").show();
		$("#gameUserStatusSection").show();
		
		var gameState = GameStateInfo.getGameState();
		
		if(gameState.stepName == "COLLECT_RESPONSES") {
			var gamePageBannerMarkup = 'Nice answers <span id="gamePageBannerUserName" class="preserve-spaces"></span>!';
			$("#gamePageBanner").html(gamePageBannerMarkup);
			$("#gamePageBannerUserName").text(UserInfo.getUserName());
			$("#responseWaitingBanner").text("Sit tight while the slowpokes finish up!");
				
			$("#editPromptResponsesContainer").show();
			$("#editPromptResponsesMessage").text("You'll be able to vote " +
				"on the answers once everyone is done. In the meantime, if you weren't happy with some of your responses, " + 
				"there's still time to change them!");
			$("#editPromptResponsesButton").on("click", editPromptResponses);
		}
		else if (gameState.stepName == "VOTING") {
			var gamePageBannerMarkup = 'Thanks for voting <span id="gamePageBannerUserName" class="preserve-spaces"></span>!';
			$("#gamePageBanner").html(gamePageBannerMarkup);
			$("#gamePageBannerUserName").text(UserInfo.getUserName());
			$("#responseWaitingBanner").text("Hang in there while we collect the votes from the other players.");
			$("#editPromptResponsesContainer").hide();
			$("#editPromptResponsesMessage").empty();
		}
		
		console.log("Showed waiting section.");
	}
	
	function setUserStatus(newStatus) {
		var db = App.getDatabase();
  		var userStatusRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game/userStatus");
		var myUserStatusRef = userStatusRef.child("user/" + UserInfo.getUserKey());
		myUserStatusRef.set(newStatus);
		
		console.log("Updated user status to " + newStatus + " for " + UserInfo.getUserName() + ".");
	}
	
	function setUserStatusToWorking() {
		setUserStatus(false);
	}
	
	function setUserStatusToDone() {
		setUserStatus(true);
		
		/*var db = App.getDatabase();
  		var userStatusRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game/userStatus");
		var myUserStatusRef = userStatusRef.child("user/" + UserInfo.getUserKey());
		myUserStatusRef.set(true);
		
		console.log("Updated user status to complete for " + UserInfo.getUserName() + ".");
		*/
	}
	
	function createMessage(invalidPromptIndices) {
		var message = null;
		
		if(invalidPromptIndices.length > 0) {
			message = "You must answer all of the questions before submitting. "
			
			if(invalidPromptIndices.length == 1) {
				message += "You have an invalid or empty response for Prompt #" + (invalidPromptIndices[0] + 1) + ".";
			}
			else if(invalidPromptIndices.length == 2) {
				message += "You have invalid or empty responses for Prompts #" + (invalidPromptIndices[0] + 1) + " and " +
					"#" + (invalidPromptIndices[1] + 1) + ".";
			}
			else if(invalidPromptIndices.length > 2) {
				
				message += "You have an invalid or empty responses for Prompts #" + (invalidPromptIndices[0] + 1) + ", ";
				var index = 1;
				while(index < invalidPromptIndices.length - 1) {
					message += ("#" + (invalidPromptIndices[index] + 1) + ", ")
					index ++;
				}
				message += "and #" + (invalidPromptIndices[invalidPromptIndices.length - 1] + 1) + ".";
			}
		}
		
		return message;
	}
	
	function findInvalidPromptNumbers() {
		var responseArray = $("input.promptResponse");
		var responseCount = responseArray.length;
		var invalidPromptNumbers = [];
		
		for(var i = 0; i < responseCount; i++) {
			var jqResponse = $(responseArray[i]);
			var responseText = jqResponse.val();
			var responseToSave = null; 
			if(responseText) {
				responseToSave = responseText.trim();
			}
			
			if(!responseToSave) {
				invalidPromptNumbers.push(i);
			}
		}
		
		return invalidPromptNumbers;
	}
	
	function submitResponsesClicked(event) {
		var invalidPromptNumbers = findInvalidPromptNumbers();
		
		if(invalidPromptNumbers.length == 0) {
			// 0a. Clear out the error message div.
			$("#submitResponseErrorMessage").empty();
			$("#submitResponseErrorMessage").hide();
			
			// 0b. Remove listener?
			// No - this will be done when the game progresses to voting
			//$("#submitResponsesButton").off("click");
			
			// 1. Save Responses
			saveResponses();
			
			$("#gameContainer").hide("slide", {direction: "left"}, "slow", function() {
				$("#transitionMessage").text("Saving your responses ...");
				$("#transitionMessage").show("fade", {}, "slow", function() {
					setTimeout(function() {
						$("#transitionMessage").hide("fade", {}, "slow", function() {
							
							// 2. Update screen
							refreshResponseWaitingScreen();
							
							// 3. Slide in the game page and mark user status completed
							$("#gameContainer").show("slide", {direction: "right"}, "slow", function(){
								setUserStatusToDone();
							});
						});
					}, 1000);
				});
			});
			
			

		}
		else {
			var errorMessage = createMessage(invalidPromptNumbers);
			$("#submitResponseErrorMessage").show();
			$("#submitResponseErrorMessage").text(errorMessage);
		}
		
		// 4. Kill off further processing
		event.preventDefault();
		event.returnValue = false;
		return false;		
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
		$("#gameContainer").hide("slide", {direction: "left"}, "slow", function() {
			$("#transitionMessage").text("Recording your choice. Every vote matters!");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
						
						// Show the response waiting screen
						refreshResponseWaitingScreen();
						
						// Set set the status to done
						$("#gameContainer").show("slide", {direction: "right"}, "slow", function(){
							setUserStatusToDone();
						});
					});
				}, 1000);
			});
		});
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
								'<button type="button" data-user-key="' + responseUserKey + '" id="vote-button-' + z + '" ' + 
								' class="vote-button">' + responseTextSafe + '</button>';
							
							$("#votingChoicesDiv").append(sectionText);
						}
						else {
							var myAnswerSafe = $("<div>").text(responseText).html();
							$("#myAnswer").html(myAnswerSafe);
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
		
		var gamePageBannerMarkup =
			'Hey <span id="gamePageBannerUserName" class="preserve-spaces"></span>, it\'s time to vote!';
		
		$("#gamePageBanner").html(gamePageBannerMarkup);
		$("#gamePageBannerUserName").text(UserInfo.getUserName());
		$("#votingTitle").text("Voting for Question " + (promptNumber + 1) + " of " + promptCount);
		$("#votingInstructions").text("Review the prompt and choose the answer from the other players that you liked the best!");		
		$("#votingPrompt").text(prompt.promptText);
	}
	
	function initializeVotingPage() {
		// 0. Cleanup prompt listeners
		$("#submitResponsesButton").off("click");
		
		// 0a. Slide the game container out and build the page.
		$("#gameContainer").hide("slide", {direction: "left"}, "slow", function() {
			
			// 1. Show the elements on the page.
			showVotingSection();
			
			// 2. Query and display the voting choices in the section.
			populateVotingChoices();
			
			var gameState = GameStateInfo.getGameState();
			var promptNumber = gameState.promptNumber;
			
			var previousStatusBarStateIds = ["#promptsState", "#votingState1", "#votingState2"];
			var currentStatusBarStateIds = ["#votingState1", "#votingState2", "#votingState3"];
			
			var previousStatusBarStateId = previousStatusBarStateIds[promptNumber];
			var currentStatusBarStateId = currentStatusBarStateIds[promptNumber]; 
			
			
			$("#transitionMessage").text("Collecting responses to Prompt #" + (promptNumber + 1) + " for voting.");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
			
						$(previousStatusBarStateId).removeClass("activeState").addClass("completedState");
						$(currentStatusBarStateId).removeClass("futureState").addClass("activeState");
						
						// Show the game page again so the user can submit their new answers.
						$("#gameContainer").show("slide", {direction: "right"}, "slow", function() {});
					});
				}, 1000);
			});
		});
		
		
		
	}
		
	function showResultsSection() {
		var promptIndex = GameReviewStateInfo.getReviewPromptIndex(); 
		
		var prompts = GamePromptsInfo.getGamePromptsList();
		var promptCount = prompts.length;
		var prompt = prompts[promptIndex];
		
		
		var descriptionDiv = $("<div>").addClass("instructions");
		descriptionDiv.text("Prompt " + (promptIndex + 1) + " of " + promptCount + ". We asked:");
		
		//var promptTextDiv = $("<h3>").css("margin-top", "5px").text(prompt.promptText);
		$("#resultsTitle").text("Results for prompt " + (promptIndex + 1) + " of " + promptCount + ". We asked:");
		$("#resultsPrompt").text(prompt.promptText);
		
		// Show the results
		$("#resultsSection").show();
		
		// Show the navigation
		$("#reviewPhaseNavContainer").show();
		displayReviewPhaseButtons();
		
		// Show the game scores section
		$("#gameScoresPageBanner").text("Let's take a look at the voting results!");
		$("#gameScoresPage").show();
	}
	
	function populateVotingResultsFromLocal() {
		var prompts = GamePromptsInfo.getGamePromptsList();
		var promptNumber = GameReviewStateInfo.getReviewPromptIndex();
		
		var prompt = prompts[promptNumber];
		var gameResponses = GameResponsesInfo.getGameResponseForPrompt(prompt.promptKey);
		
		var responseUserKeys = Object.keys(gameResponses);
		var gameUsersMap = GameUsersInfo.getGameUsersMap();
		
		var votingResults = GameVotingInfo.getVotingResultsForPrompt(prompt.promptKey);
		
		for(var i = 0; i < responseUserKeys.length; i++) {
			var responseUserKey = responseUserKeys[i];
			var votedForAnswerUserKeys = votingResults[responseUserKey];
			
			var responseDiv = $("<div>").attr("id", "vote-response-" + i).css("margin-bottom", "25px").addClass("resultsSectionDiv");
			
			var introDiv = $("<div>").addClass("instructions");
			
			if(UserInfo.getUserKey() == responseUserKey) {
				introDiv.append("Here's your answer! ");
			}
			var nameSpan = $("<span>").addClass("preserve-spaces").text(gameUsersMap[responseUserKey]);
			introDiv.append(nameSpan);
			introDiv.append(" wrote: ");			
			
			responseDiv.append(introDiv);
			
			responseDiv.append($("<div>").addClass("resultAnswer").text(gameResponses[responseUserKey]));
			
			
			if(votedForAnswerUserKeys.length > 0) {
				votedForUserList = $("<ul>").addClass("userList");
				
				for(var j = 0; j < votedForAnswerUserKeys.length; j++) {
					var votedForAnswerUserKey = votedForAnswerUserKeys[j];
					var divListItem = $("<li>")
					//.css("margin-left", "10px");
					//divListItem.html("&bull; ");
					
					var nameSpanListItem = $("<span>").addClass("preserve-spaces").text(gameUsersMap[votedForAnswerUserKey]);
					divListItem.append(nameSpanListItem);
					//var liText = "- " + gameUsersMap[votedForAnswerUserKey];
					
					if(UserInfo.getUserKey() == votedForAnswerUserKey) {
						divListItem.append(" (your vote)");
						//liText += " (your vote)";
					}
					
					votedForUserList.append(divListItem);
					//votedForUserList.append($("<div>").css("margin-left", "10px").text(liText));
				}
				
				responseDiv.append(votedForUserList);
			}
			else {
				var noVotesDiv = $("<div>").addClass("noVotes").html("<span>Nobody voted for this answer. &#128549;</span>");
				responseDiv.append(noVotesDiv);
			}
			
			$("#resultsContentDiv").append(responseDiv);
		}
		
		$("#reviewPhaseNavContainer").show();
		displayReviewPhaseButtons();
	}
	
	function displayReviewPhaseButtons() {
		var prompts = GamePromptsInfo.getGamePromptsList();
		var categoryName = GameReviewStateInfo.getReviewCategoryName();
		var promptNumber = GameReviewStateInfo.getReviewPromptIndex();
		
		$(".review-nav-button").off("click");
		$("#reviewPhaseNavDiv").empty();
		var previousPromptButtonShown = false;
		var hasLeft = false;
		var hasRight = false;
		
		if((categoryName == "PROMPT_RESULTS" && promptNumber > 0 ) ||  (categoryName == "FINAL_SUMMARY")) {
			hasLeft = true;
			previousPromptButtonShown = true;
			var previousPromptNumber = promptNumber;
			if(categoryName == "FINAL_SUMMARY") {
				previousPromptNumber = prompts.length;
			}
			
			var previousPromptButton = 
				$("<button>")
					.attr("id", "previousPromptButton")
					.attr("type", "button")
					.addClass("review-nav-button")
					.addClass("reviewPrevious")
					.text("Go Back to Results for Prompt #" + previousPromptNumber);
			
			$("#reviewPhaseNavDiv").append(previousPromptButton);
			$("#previousPromptButton").on("click", reviewPreviousPrompt);
		}
		
		if(categoryName == "PROMPT_RESULTS") {
			hasRight = true;
			if(promptNumber < prompts.length - 1) {
				var nextPromptButton = 
					$("<button>")
						.attr("id", "nextPromptButton")
						.attr("type", "button")
						.addClass("review-nav-button")
						.addClass("reviewNext")
						.text("Continue to Results for Prompt #" + (promptNumber + 2));
				if(previousPromptButtonShown) {
					nextPromptButton.css("margin-left", "25px")
				}
				$("#reviewPhaseNavDiv").append(nextPromptButton);
				$("#nextPromptButton").on("click", reviewNextPrompt);
			}
			else if(promptNumber == prompts.length - 1) {
				var showFinalScoresButton = 
					$("<button>")
						.attr("id", "showFinalScoresButton")
						.attr("type", "button")
						.addClass("review-nav-button")
						.addClass("reviewNext")
						.css("margin-left", "25px")
						.text("Continue to the Final Scores!");
						
				$("#reviewPhaseNavDiv").append(showFinalScoresButton);
				$("#showFinalScoresButton").on("click", showFinalScores);
			}
			else {
				console.log("Ooops. Seems like prompt index is not correct. Value is: " + promptNumber);
			}
		}
		
		$("#reviewPhaseNavDiv").removeClass("twoButtons oneRightButton oneLeftButton");
		
		var flexClass = "twoButtons";
		if(hasLeft && !hasRight) {
			flexClass = "oneLeftButton";
		}
		else if(!hasLeft && hasRight) {
			flexClass = "oneRightButton";
		}
		
		$("#reviewPhaseNavDiv").addClass(flexClass);
		
		setupReturnToLobbyButton();
		
		/*
		$("#returnToLobbyButton").click()
		var returnToLobbyButton = 
			$("<button>")
				.attr("id", "returnToLobbyButton")
				.attr("type", "button")
				.addClass("review-nav-button")
				.css("margin-left", "30px")
				.text("Return to the Lobby");
		$("#resultsNavDiv").append(returnToLobbyButton);				
		*/
		/*		
			var continueButtonText =
				'<div><button id="continueFromResultsButton">Done Reviewing Results</button><div>';
			
			$("#resultsContentDiv").append(continueButtonText);
			$("#continueFromResultsButton").on("click", doneReviewingClicked);
		*/
	}
	
	function showFinalScores() {
		$(".review-nav-button").off("click");
		GameReviewStateInfo.setReviewCategoryName("FINAL_SUMMARY");
		GameReviewStateInfo.setReviewPromptIndex(-1);
		
		displayGameReviewPhasePage();
	}
		
	function reviewPreviousPrompt() {
		$(".review-nav-button").off("click");
		var currentPromptIndex = GameReviewStateInfo.getReviewPromptIndex();
		var currentCategoryName = GameReviewStateInfo.getReviewCategoryName();
		
		if(currentCategoryName == "PROMPT_RESULTS") {
			GameReviewStateInfo.setReviewPromptIndex(currentPromptIndex - 1);
		}
		else if(currentCategoryName == "FINAL_SUMMARY") {
			var prompts = GamePromptsInfo.getGamePromptsList();
			GameReviewStateInfo.setReviewPromptIndex(prompts.length - 1);
			GameReviewStateInfo.setReviewCategoryName("PROMPT_RESULTS");
		}
		
		displayGameReviewPhasePage();
	}
	
	function reviewNextPrompt() {
		$(".review-nav-button").off("click");
		var currentPromptIndex = GameReviewStateInfo.getReviewPromptIndex();
		GameReviewStateInfo.setReviewPromptIndex(currentPromptIndex + 1);
		displayGameReviewPhasePage();
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
	
	function displayGameReviewPhasePage() {
		var reviewCategoryName = GameReviewStateInfo.getReviewCategoryName();
		
		if(reviewCategoryName == "PROMPT_RESULTS") {
			// 0. Empty everything
			hideGamePage();
			hideGameScoresPage();
			
			// 1. Query and populate the results
			populateVotingResults();
			
			// 2. Show the results section on the page
			showResultsSection();
		}
		else if(reviewCategoryName == "FINAL_SUMMARY") {
			// 1. Hide the Game Page
		    hideGamePage();
			hideGameScoresPage();
		
			// 2. Build and show the game summary page.
			displayGameSummaryPage();
		}
		else {
			console.log("Oh no! Review Category Name is not valid! Value is: " + reviewCategoryName)
		}
	}
	
	function initializeResultsPhase() {
		// 1. Stop Firebase DB listeners for game stuff
		stopListeningToGameState();
		stopListeningToUserStatus();
		
		// 2. Set up GameReviewState object.
		GameReviewStateInfo.setReviewCategoryName("PROMPT_RESULTS");
		GameReviewStateInfo.setReviewPromptIndex(0);
		
		// 3. Display the page, according to the current state.
		$("#gameContainer").hide("slide", {direction: "left"}, "slow", function() {
			
			// Make the page components visible
			displayGameReviewPhasePage();
						
			$("#transitionMessage").text("All done voting. Let's take a look at the results to see how everyone did!'");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
						
						// Update the status bar so the "Review" state is active
						$("#votingState3").removeClass("activeState").addClass("completedState");
						$("#resultsState").removeClass("futureState").addClass("activeState");
						
						// Show the game page again so the user can submit their new answers.
						$("#gameContainer").show("slide", {direction: "right"}, "slow", function() {});
					});
				}, 1000);
			});
			
		});
	}
	
	function hideGameScoresPage() {
		
		// Results Section
		$("#resultsTitle").empty();
		$("#resultsPrompt").empty();
		$("#resultsContentDiv").empty();
		$("#resultsSection").hide();
		
		// Final Game Summary Section
		$("#finalGameSummaryBanner").empty();
		$("#finalGameSummaryDetails").empty();
		$("#finalGameSummaryPage").hide();
		
		// Hide the nav container
		$("#reviewPhaseNavDiv").empty();
		$("#reviewPhaseNavContainer").hide();
		
		// Last, hide the game scores
		$("#gameScoresPageBanner").empty();
		$("#gameScoresPage").hide();
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
		$("#votingTitle").empty();
		$("#votingInstructions").empty();
		$("#votingPrompt").empty();
		$("#votingChoicesDiv").empty();
		$("#votingSection").hide();
				
		// User Status Section
		$("#userStatusWorkingList").empty();
		$("#userStatusFinishedList").empty();
		$("#gameUserStatusSection").hide();
		
		// The Game page
		$("#gamePageBanner").empty();
		$("#gamePage").hide();
	}
	
	function hideFinalGameSummaryPage() {
		$("#finalGameSummaryBanner").empty();
		$("#finalGameSummaryDetails").empty();
		$("#finalGameSummaryPage").hide();
	}
	
	function hideReviewPhaseNavContainer() {
		$("#reviewPhaseNavDiv").empty();
		$("#reviewPhaseNavContainer").hide();
	}
	
	function setupReturnToLobbyButton() {
		$("#returnToLobbyButton").on("click", function(event) {
			// 0. Slide the game window out 
			
			// 1. Unbind buttons
			$(".review-nav-button").off("click");
			
			$("#statusBar").slideUp(500, function() {
				$("#gameContainer").hide("slide", {direction: "down"}, "slow", function() {
					$("#transitionMessage").text("Returning to the lobby ...");
					
					// 2. Hide stuff from the results			
					hideGamePage();
					hideGameScoresPage();
					//hideFinalGameSummaryPage();
					//hideReviewPhaseNavContainer();
					
					// 3. Turn of the Firebase DB listener for name changes
					GameSetupManager.stopListeningToRoomUsers();
					
					// 3a. Set the message to be shown when the user returns to the lobby.
					UserInfo.setUserLobbyMessage("Congratulations on successfully participating in the game with a " +
						"room code of " + RoomInfo.getRoomCode() + "! Continue your adventures by starting or joining " +
						"a new game.")
					
					// 4. Clear the local data
					clearAllLocalData();
					
					$("#transitionMessage").show("fade", {}, "slow", function() {
						setTimeout(function() {
							$("#transitionMessage").hide("fade", {}, "slow", function() {
	
								// 5. Go back to the lobby.
								AddUserManager.enterLobby(false);
							});
						}, 1000);
					});
				});
			});

		});
	}
	
	function getSortedScoresList(scoreMap) {
		
		function compareScoresReverse(a, b ) {
			if(a.scoreValue < b.scoreValue) {
				return 1;
			}
			if(a.scoreValue > b.scoreValue) {
				return -1;
			}
			
			return 0;
		}
		
		var scoreList = [];
		for(const [key, value] of Object.entries(scoreMap)) {
			scoreList.push({userKey: key, scoreValue: value});
		}
		
		scoreList.sort(compareScoresReverse);
		
		return scoreList;
	}
	
	function displayGameSummaryPage() {
		$("#finalGameSummaryDetails").empty();
		$("#finalGameSummaryPage").show();
		
		var finalGameSummaryBanner =
			'Hey <span id="finalGameSummaryUserName" class="preserve-spaces"></span>, ' + 
			'thanks for playing! We hope you enjoyed the game!';
		
		$("#finalGameSummaryBanner").html(finalGameSummaryBanner);
		$("#finalGameSummaryUserName").text(UserInfo.getUserName());
	  
		var finalScoreMap = GameVotingInfo.getVotingResultsForFullGame();
		var gameUsersMap = GameUsersInfo.getGameUsersMap();
		var sortedScoresList = getSortedScoresList(finalScoreMap);
		
		var descriptionDiv = $("<div>").text("The final game scores, representing the total vote counts, are below.");
		var scoreTable = $("<table>").addClass("finalScoresTable");
		
		scoreTable.append("<tr><th>Player</th><th>Score</th></tr>")
		
		//var userKeyArray = Object.keys(finalScoreMap);
		for(var i = 0; i < sortedScoresList.length; i++) {
			var sortedScoreElement = sortedScoresList[i];
			var userKey = sortedScoreElement.userKey;
			var userName = gameUsersMap[userKey];
			var itemElement = $("<tr>");
			
			// Build the username cell
			var displayName = userName;
			if(UserInfo.getUserKey() == userKey) {
				displayName += " (you)";
			}
			
			var usernameDiv = $("<div>").addClass("preserve-spaces").text(displayName);
			
			var nameTd = $("<td>").addClass("playerName");
			nameTd.append(usernameDiv);
			itemElement.append(nameTd);
			
			// Build the score cell
			var scoreTd = $("<td>").addClass("playerScore");
			var scoreDiv = $("<div>");
			var scoreDivText = finalScoreMap[userKey] + " Vote" + (finalScoreMap[userKey] == 1 ? "" : "s");
			scoreDiv.text(scoreDivText);
			scoreTd.append(scoreDiv);
			itemElement.append(scoreTd);
						
			//itemText += (": " + finalScoreMap[userKey]);
			//var itemElement = $("<li>").text(itemText);
			scoreTable.append(itemElement);
		}
		
		$("#finalGameSummaryDetails").append(descriptionDiv);
		$("#finalGameSummaryDetails").append(scoreTable);
		
		$("#reviewPhaseNavContainer").show();
		displayReviewPhaseButtons();
		
		// Show the game scores section
		$("#gameScoresPageBanner").text("All done! Here's the final scores:");
		$("#gameScoresPage").show();
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
		GameReviewStateInfo.clear();
		GamePromptsInfo.clear();
		GameUsersInfo.clear();
		RoomInfo.clear();
	}
	
	function initializeGameSummaryPage() {
		// 1. Hide the Game Page
		hideGamePage();
		hideGameScoresPage();
		
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
			else if(gameStateObj.stepName == "COMPLETE") {
				initializeResultsPhase();
			}
			else {
				console.log("Found invalid Game State!! Value was: " + gameStateObj.stepName);
			}
			
			/*
			else if(gameStateObj.stepName == "RESULTS") {
				initializeResultsPage();
			}
			else if(gameStateObj.stepName == "FINAL_TALLY") {
				initializeGameSummaryPage();
			}*/
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
				var finishedListItem = $("<li>").addClass("preserve-spaces").text(liText);
				$("#userStatusFinishedList").append(finishedListItem);
				finishedCount++;
			}
			else if(userStatusValue == false) {
				var workingListItem = $("<li>").addClass("preserve-spaces").text(liText);
				$("#userStatusWorkingList").append(workingListItem);
				workingCount++;
			}
			else {
				console.log("Uh oh. Bad status value of " + userStatusValue + " for user " + userKey);
			}
		}
		
		if(workingCount > 0) {
			// $("#userStatusWorkingHeader").show();
			$("#userStatusWorkingEmpty").hide();
			$("#userStatusWorkingList").show();
		}
		else {
			// $("#userStatusWorkingHeader").hide();
			$("#userStatusWorkingList").hide();
			$("#userStatusWorkingEmpty").show();
		}
		
		if(finishedCount > 0) {
			// $("#userStatusFinishedHeader").show();
			$("#userStatusFinishedEmpty").hide();
			$("#userStatusFinishedList").show();
		}
		else {
			// $("#userStatusFinishedHeader").hide();
			$("#userStatusFinishedList").hide();
			$("#userStatusFinishedEmpty").show();
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
		else if(currentGameState.stepName == "VOTING") {
			var gamePromptsList = GamePromptsInfo.getGamePromptsList();
			var totalPromptCount = gamePromptsList.length;
			
			var currentPromptNumber = currentGameState.promptNumber;
			if(currentPromptNumber < totalPromptCount - 1) {
				newGameState.stepName = currentGameState.stepName
				newGameState.promptNumber = currentPromptNumber + 1;
			}
			else {
				if(currentGameState.stepName == "VOTING") {
					newGameState.stepName = "COMPLETE";
					newGameState.promptNumber = -1;
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

					// Setup listener for gameState
					listenToGameState();
					
					// Setup listener for userStatus
					listenToUserStatus();
					
					// Show the page
					displayGamePromptsPage();
					

				}
				else {
					console.log("Uh oh - no game prompts exist!");
				}
			});
	}
	
	function refreshGamePromptResponseUI() {
		$("#gamePageBannerUserName").text(UserInfo.getUserName());
		updateUserStatusDisplay();
	}
	
	function refreshGameVotingUI() {
		$("#gamePageBannerUserName").text(UserInfo.getUserName());
		updateUserStatusDisplay();
	}
	
	function refreshGameReviewUI() {
		displayGameReviewPhasePage();
	}
	
	function setupPromptResponsePage() {
		// Get the prompts and setup the page for the user to enter their answers.
		retrieveAndDisplayGamePrompts();
				
		
		// Begin listener for 
	}
	
	return {
		setupPromptResponsePage: setupPromptResponsePage,
		refreshGamePromptResponseUI: refreshGamePromptResponseUI,
		refreshGameVotingUI: refreshGameVotingUI,
		refreshGameReviewUI: refreshGameReviewUI,
		hideGamePage: hideGamePage,
		clearAllLocalData: clearAllLocalData
	};
})();