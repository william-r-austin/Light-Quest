GameSetupManager = (function() {
	
	var exitContainerInitialized = false;
	
	function getNewRoomCode() {
		var length = 5;
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		
		return result;
	}
	
	function insertNewRoom() {
		var roomCode = getNewRoomCode();
		console.log("New room code is: " + roomCode);
		
		var db = App.getDatabase();
  		var roomsRef = db.ref().child("rooms");

		var insertRoomRef = roomsRef.push({
			"roomCode" : roomCode, 
			"roomOwnerKey": UserInfo.getUserKey(), 
			"roomOwnerName": UserInfo.getUserName(),
			"roomSetupState": "WAITING"
		});
		
		var roomKey = insertRoomRef.key;
		
		console.log("Got new room key. Value is: " + roomKey);
		
		RoomInfo.setRoomCode(roomCode);
		RoomInfo.setRoomKey(roomKey);
		RoomInfo.setRoomOwnerKey(UserInfo.getUserKey());
		RoomInfo.setRoomOwnerName(UserInfo.getUserName());
		RoomInfo.setRoomSetupState("WAITING");
	}
	
	function createGamePrompts() {
		var db = App.getDatabase();
		var roomPromptsRef = db.ref("rooms/" + RoomInfo.getRoomKey()).child("game/prompts");
		var prompts = PromptsLibrary.getRandomPrompts(3);
		
		// var promptInfo = [];
		
		var promptsSize = prompts.length;
		for(var i = 0; i < promptsSize; i++) {
			var currentPrompt = prompts[i];
			var promptTextObj = {"promptText": currentPrompt};
			var promptRef = roomPromptsRef.push(promptTextObj);
			console.log("Inserted Game Prompt. Key = " + promptRef.key + ", Text = " + currentPrompt);
			
			//var fullPromptObj = JSON.parse(JSON.stringify(promptTextObj));
			//fullPromptObj.promptKey = promptRef.key;
			//promptInfo.push(fullPromptObj);
		}

		console.log("Inserted game prompts!");
		//return promptInfo;
	}
	
	function createGameUserStatus() {
		var db = App.getDatabase();
		var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		var userStatusRef = gameRef.child("userStatus");
		
		var userStatusObj = {
			"user": {}
		};
		
		var gameUsersList = GameUsersInfo.getGameUsersList();
		
		for(var k = 0; k < gameUsersList.length; k++) {
			var gameUser = gameUsersList[k];
			userStatusObj.user[gameUser.userKey] = false; 
		}
		
		userStatusRef.set(userStatusObj);
		
		console.log("Created game/userStatus");
		console.log(userStatusObj);
	}
	
	function createGameState() {
		var db = App.getDatabase();
		var gameRef = db.ref("rooms/" + RoomInfo.getRoomKey() + "/game");
		var gameStateRef = gameRef.child("gameState");
		
		var gameStateObj = {
			"stepName": "COLLECT_RESPONSES"
		};
		
		gameStateRef.set(gameStateObj);
		GameStateInfo.setGameState(gameStateObj);
		
		console.log("Created game/gameState");
		console.log(gameStateObj);
	}
	
	function setRoomSetupStateComplete() {
		var db = App.getDatabase();
		var roomSetupStateRef = db.ref("rooms/" + RoomInfo.getRoomKey());
		roomSetupStateRef.child("roomSetupState").set("COMPLETE");
		console.log("Set room state to complete!");
	}
	
	function startGame() {
		// Create the game/prompts
		createGamePrompts();
		
		// Create the game/userStatus
		createGameUserStatus();
				
		// Create the game/gameState
		createGameState();
		
		// Setup the response and voting areas in the DB
		
		// Send the Room Setup State Complete event
		setRoomSetupStateComplete();
	}
	
	function startGameButtonClicked(event) {
		// Remove the click handler
		$("#completeGameSetupButton").off("click");
		
		// Start the game
		startGame();
	}
	
	function addStartButtonForRoomOwner() {
		if(RoomInfo.getRoomOwnerKey() === UserInfo.getUserKey()) {
			var gameUsersList = GameUsersInfo.getGameUsersList(); 
			var gameUsersCount = gameUsersList.length;
			
			if($("#completeGameSetupDiv").length < 1) {
				var startGameDivText =
					'<div id="completeGameSetupDiv">' +
					'  <button type="button" id="completeGameSetupButton"></button>' +
					'</div>';
				
				$("#gameStatusCardContainer").append($(startGameDivText));
			}
			
			var currentlyDisabled =	$("#completeGameSetupButton").hasClass("disabled-waiting");
			
			if(gameUsersCount >= 3) {
				var currentlyDisabled =	$("#completeGameSetupButton").hasClass("disabled-waiting");
				
				if(currentlyDisabled) {
					$("#completeGameSetupButton").removeClass("disabled-waiting");
					$("#completeGameSetupButton").text("Start the Game!");
					$("#completeGameSetupButton").on("click", startGameButtonClicked);
					console.log("Added Start Game button for room owner.");
				}
			}
			else {
				if(!currentlyDisabled) {
					$("#completeGameSetupButton").addClass("disabled-waiting");
					$("#completeGameSetupButton").text("Waiting for at least 3 players to join");
					$("#completeGameSetupButton").off("click");
				}
			}
		}
		else {
			// User is not the host
			$("#completeGameSetupDiv").remove();
		}
	}
	
	function refreshGameSetupUI(gameUserChanges) {
		
		$("#gameRoomSetupUserName").text(UserInfo.getUserName());
		$("#gameRoomSetupHostName").text(RoomInfo.getRoomOwnerName());
		
		$("#gameRoomSetupUsersList").empty();
			
		var gameUsersList = GameUsersInfo.getGameUsersList();
		var userCount = 0;
		
		for (const gameUserObj of gameUsersList) {
			var itemText = gameUserObj.userName;
			
			if(UserInfo.getUserKey() == gameUserObj.userKey) {
				itemText += " (you)";
			}
			
			var newListItem = $("<li>").addClass("preserve-spaces").text(itemText);
			$("#gameRoomSetupUsersList").append(newListItem);
			
			console.log("Added or modified game user in game room: " + itemText);
			userCount++;
		}
		
		var tempDiv = $("<div>").addClass("roomUpdateMessage");
		
		var gameUserChangesSize = gameUserChanges.length;
		if(gameUserChangesSize > 0) {
			//tempDiv.append("The most recent update is: ");
			var gameUserChange = gameUserChanges[gameUserChangesSize - 1];

			if(gameUserChange.changeType == "ADD_USER") {
				tempDiv.append("A new user named ");
				var spanEl = $("<span>").addClass("preserve-spaces").text(gameUserChange.userName);
				tempDiv.append(spanEl);
				tempDiv.append(" has joined the game.");
			}
			else if(gameUserChange.changeType == "REMOVE_USER") {
				var spanEl2 = $("<span>").addClass("preserve-spaces").text(gameUserChange.userName);
				tempDiv.append(spanEl2);
				tempDiv.append(" has left the game.");
			}
			else if(gameUserChange.changeType == "NAME_CHANGE") {
				var spanEl3 = $("<span>").addClass("preserve-spaces").text(gameUserChange.oldUserName);
				tempDiv.append(spanEl3);
				tempDiv.append(" has updated their username to: ");
				var spanEl4 = $("<span>").addClass("preserve-spaces").text(gameUserChange.userName);
				tempDiv.append(spanEl4);
				tempDiv.append(".");
			}
			
			$("#gameSetupStatusContainer").append(tempDiv);
		}
		
		var tempDiv2 = $("<div>");
		
		if(userCount < 1) {
			tempDiv2.append("Uh-oh. Your game doesn't have any users! ");
		}
		else if(userCount == 1) {
			tempDiv2.append("Looks like it's just you. You'll need a couple more people to join before you can start the game.");
		}
		else if(userCount == 2) {
			tempDiv2.append("Almost there! You only need one more person before you can play.");
		}
		else if(userCount == 3) {
			tempDiv2.append("Great news: you've got enough people to start the game! The host can choose to start now, or you can " +
			"continue waiting for additional players.");
		}
		else {
			tempDiv2.append("You've got " + userCount + " users for your game! That's more than enough to get started, but you can " +
				" continue waiting if you're expecting others to join. Bug the host (");
			var spanHost = $("<span>").addClass("preserve-spaces").text(RoomInfo.getRoomOwnerName());
			tempDiv2.append(spanHost);
			tempDiv2.append(") when you're ready to begin!");
		}
		
		$("#gameStatusSetupMessage").html(tempDiv2.html());
		
		addStartButtonForRoomOwner();
	}
	
	function findChanges(oldData, newData) {
		var changes = [];
		
		for (const [newKey, newValue]  of Object.entries(newData)) {
			var oldValue = oldData[newKey];
			if(!oldValue) {
				var addUserChange = {
					"changeType": "ADD_USER",
					"userKey": newValue.userKey,
					"userName": newValue.userName
				};
				changes.push(addUserChange);
			}
			else {
				if(oldValue.userName != newValue.userName) {
					var userNameChange = {
						"changeType": "NAME_CHANGE",
						"userKey": newValue.userKey,
						"userName": newValue.userName,
						"oldUserName": oldValue.userName
					};
					changes.push(userNameChange);
				}
			}
		}
		
		for (const [oldKey, oldValue]  of Object.entries(oldData)) {
			var newValue = newData[oldKey];
			if(!newValue) {
				var removeUserChange = {
					"changeType": "REMOVE_USER",
					"userKey": oldValue.userKey,
					"userName": oldValue.userName
				};
				changes.push(removeUserChange);
			}
		}
		
		return changes;
	}
	
	function onChangeRoomUsers(dataSnapshot) {
		console.log("Got new room user change! Value is:");
		console.log(dataSnapshot.val());
		var gameUserChanges = [];
		
		if(dataSnapshot.exists()) {
			var gameUsersRawData = dataSnapshot.val();
			var oldGameUsersRawData = GameUsersInfo.getGameUsersRawData();
			
			gameUserChanges = findChanges(oldGameUsersRawData, gameUsersRawData);
			console.log("Found Room User Changes!");
			console.log(gameUserChanges);
			
			GameUsersInfo.setGameUsersRawData(gameUsersRawData);
					
			var gameUsersList = [];
			
			for (const gameUserRawValue of Object.values(gameUsersRawData)) {
				var addedUserData = gameUserRawValue;

				gameUsersList.push(addedUserData);
				
				var addedUserKey = addedUserData.userKey 
				var addedUserName = addedUserData.userName;
				
				if(RoomInfo.getRoomOwnerKey() == addedUserKey) {
					RoomInfo.setRoomOwnerName(addedUserName);
				}

				console.log("Refreshed Game Users Data.");
			}
			
			GameUsersInfo.setGameUsersList(gameUsersList);

		}
		else {
			GameUsersInfo.setGameUsersRawData({});
			GameUsersInfo.setGameUsersList([]);
		}
		
		DisplayManager.refreshDisplayFromState(gameUserChanges);
	}
	
	function exitRoomInDatabase() {
		if(UserInfo.getUserKey() == RoomInfo.getRoomOwnerKey()) {
			// Send a message on the game setup node.
			var db = App.getDatabase();
			var roomSetupStateRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/roomSetupState");
			roomSetupStateRef.set("ABANDONED_BY_HOST");
		}
		else {
			var gameUsersRawData = GameUsersInfo.getGameUsersRawData();
			
			for (const [rawGameUserKey, rawGameUserValue] of Object.entries(gameUsersRawData)) {
				
				if(UserInfo.getUserKey() == rawGameUserValue.userKey) {
					var db = App.getDatabase();
  					var roomUserRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/users/" + rawGameUserKey);
					roomUserRef.remove();
					
					console.log("Finished removing user from room room users. User removed was: ");
					console.log(rawGameUserValue);
					
					break;
				}
			}
		}
	}
	
	function handleAbandonedByHost() {
		// 1. Remove Firebase listener for room users
		stopListeningToRoomUsers();
		stopListeningToRoomSetupState();
		
		// 2. Slide the status bar up and the game container to the right
		$("#statusBar").slideUp(500, function() {
			$("#gameContainer").hide("slide", {direction: "down"}, "slow", function() {
						
				$("#transitionMessage").text("Uh oh, game was abandoned!! Returning to the Lobby ...");
				$("#transitionMessage").show("fade", {}, "slow", function() {
					setTimeout(function() {
						$("#transitionMessage").hide("fade", {}, "slow", function() {
							
							// 3. Clear the UI
							resetGameSetupPage();
							
							// 3a. Hide the setup and game pages
							GameManager.hideGamePage();
							$("#gameRoomSetupPage").hide();
							
							// 4. Set the Lobby message
							UserInfo.setUserLobbyMessage("Oops - your host abandoned the game. The room code was: " + RoomInfo.getRoomCode() + ".");
														
							// 3. Clear the local data
							GameManager.clearAllLocalData();
							
							// 5. Go back to the lobby.
							AddUserManager.enterLobby(false);
						});
					});
				});
			});
		})	
	}
	
	function showCopyResult(resultText) {
		// Set the text and hide it if it's already active.
		$("#copyResults").hide().text(resultText);
		
		$("#copyResults").fadeIn(500, function() {
			setTimeout(function() {
				$("#copyResults").fadeOut(500, function() {
					$("#copyResults").empty();
				});
			}, 5000);
		});	
	}
	
	function buildAndShowResultMessage(successVal, copyData, copyTypeName, appendData) {
		// Build the result message
		var message = "Copied " + copyTypeName + " to clipboard";
		if(appendData) {
			message += (": " + copyData); 
		}
		
		if(!successVal) {
			message = "Could not copy " + copyTypeName + " to clipboard";
		}
		
		// Show the result (success/failure)			
		showCopyResult(message);
	}
	
	function copyGameUrlClicked() {
		// Remove any existing click handlers
		// $("#copyGameUrlButton").off("click");
		
		// Add the new click handler
		//$("#copyGameUrlButton").on("click", function(clickEvent) {
		//	clickEvent.preventDefault();
		//	clickEvent.returnValue = false;
			
		// Set the data in a dummy input
		$("#dummyInputForCopy").val(getGameUrl());
		
		var copyText = document.getElementById("dummyInputForCopy");
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		var success;
		try {
			success = document.execCommand("copy");
			console.log("Copy result was: " + success);	
		}
		catch(e) {
			success = false;
			console.log("Copy failed!! Error below:");
			console.log(e);
		}
		
		// Show the copy results			
		buildAndShowResultMessage(success, getGameUrl(), "Game URL", false);
		
		// Clear the dummy input
		$("#dummyInputForCopy").val("");
			
			//return false;
		//});
		
	}
	
	function setupCopyRoomCodeButton() {
		// Remove any existing click handlers
		$("#copyRoomCodeButton").off("click");
		
		// Add the new click handler
		$("#copyRoomCodeButton").on("click", function(clickEvent) {
			clickEvent.preventDefault();
			clickEvent.returnValue = false;
			
			// Do the copy			
			//performCopy(RoomInfo.getRoomCode(), "Room Code", true);
			return false;
		});
	}
		
	
	function setupExitRoomContainer() {
		if(!exitContainerInitialized) {
			$("#leaveGameRoomMessage").text("Need to leave? If you abandon the game, you'll be taken back to the lobby.");
			if(UserInfo.getUserKey() == RoomInfo.getRoomOwnerKey()) {
				var roomHostWarning = $("<span>").css("font-weight", "bold").text(" However, because you're the host for this room, if " +
					"you choose to leave, the game will end for everyone else as well!!");
				$("#leaveGameRoomMessage").append(roomHostWarning);
			}
			
			$("#leaveGameRoomButton").on("click", function(event) {
				// 1. Turn off the listener
				$("#leaveGameRoomButton").off("click");
				
				// 2. Remove Firebase listener for room users
				stopListeningToRoomUsers();
				stopListeningToRoomSetupState();
				
				// 3. Remove self from Firebase list of room users.
				exitRoomInDatabase();
				
				// 3a. Slide the status bar up and the  game container to the right
				$("#statusBar").slideUp(500, function() {
				
					$("#gameContainer").hide("slide", {direction: "down"}, "slow", function() {
						
						$("#transitionMessage").text("Returning to the Lobby ...");
						$("#transitionMessage").show("fade", {}, "slow", function() {
							setTimeout(function() {
								$("#transitionMessage").hide("fade", {}, "slow", function() {
	
									// 3. Clear the UI
									resetGameSetupPage();
									
									// 3a. Hide the setup and game pages
									GameManager.hideGamePage();
									$("#gameRoomSetupPage").hide();
									
									// 4. Set the Lobby message
									UserInfo.setUserLobbyMessage("You've left the game room with code " + RoomInfo.getRoomCode() + ".");
																
									// 3. Clear the local data
									GameManager.clearAllLocalData();
									
									// 5. Go back to the lobby.
									AddUserManager.enterLobby(false);								
								});
							}, 1000);
						});
					});
				});
			});
			
			exitContainerInitialized = true;
		}
	}
	
	function resetStatusBar() {
		$("span.statusBarGameState")
			.removeClass("completedState")
			.removeClass("activeState")
			.removeClass("futureState")
			.addClass("futureState");
		
		$("span.statusBarRoomCode").text("");
	}
	
	function getGameUrl() {
		var baseSiteUrl = window.location.href.split('?')[0];
		var gameUrl = baseSiteUrl + "?roomCode=" + RoomInfo.getRoomCode();
		return gameUrl;
	}
	
	function displayRoomPage() {
		//$("#roomCodeErrorDiv").empty().hide();
		//$("#lobbyPage").hide();
		
		// Populate the elements of the game setup page.
		$("#gameRoomSetupUserName").text(UserInfo.getUserName());
		$("#gameRoomSetupRoomCode").text(RoomInfo.getRoomCode());
		$("#gameRoomSetupHostName").text(RoomInfo.getRoomOwnerName());
		
		// Set the Game URL
		var gameUrl = getGameUrl();
		$("#gameUrlDisplay").text(gameUrl);
		
		// Set up the buttons on the page
		setupExitRoomContainer();
		//setupCopyGameUrlButton();
		//setupCopyRoomCodeButton();
		
		// Initialize the status bar before we show it.
		resetStatusBar();
		$("#setupState").removeClass("futureState").addClass("activeState");
		$("span.statusBarRoomCode").text(RoomInfo.getRoomCode());
		
		$("#statusBar").slideDown(500, function() {
			NavBarManager.refreshForGame();
			
			
			
			
			$("#gameRoomSetupPage").show();
			
			
			$("#gameContainer").show("slide", {direction: "down"}, "slow", function() {
				connectToRoom();
			});
		});
	}
	
	function listenToRoomUsers() {
		var db = App.getDatabase();
  		var roomUsersRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/users");
		roomUsersRef.on("value", onChangeRoomUsers);
		console.log("Registered Room User Listener");
	}
	
	function stopListeningToRoomUsers() {
		var db = App.getDatabase();
  		var roomUsersRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/users");
		roomUsersRef.off("value");
		console.log("Unregistered Room User Listener");
		//roomUsersRef.off("value", onChangeRoomUsers);
	}
	
	function resetGameSetupPage() {
		// Basic fields
		$("#gameRoomSetupUserName").empty();
		$("#gameRoomSetupRoomCode").empty();
		$("#gameRoomSetupHostName").empty();
		$("#gameUrlDisplay").empty();
		
		
		// Other fields
		$("#gameStatusSetupMessage").empty();
		$("#gameSetupStatusContainer").empty();
		$("#leaveGameRoomMessage").empty();
		$("#gameRoomSetupUsersList").empty();
		$("#completeGameSetupDiv").remove();
		exitContainerInitialized = false;
	}
	
	function onChangeRoomSetupState(dataSnapshot) {
		console.log("Room setup state changed!");

		if(dataSnapshot.exists()) {
			var roomState = dataSnapshot.val();
			console.log("Room state is: " + roomState);
			
			//var roomState = snapshotVal.roomSetupState;
			RoomInfo.setRoomSetupState(roomState);
			
			if(roomState === "COMPLETE") {
				// Stop listening to changes in the room users
				//stopListeningToRoomUsers();
					
				// Stop listening to changes in the room setup state
				stopListeningToRoomSetupState();
				
				// Slide out the setup page.
				$("#gameContainer").hide("slide", {direction: "left"}, "slow", function() {
					$("#gameRoomSetupPage").hide();
					
					// Clean up the game setup page
					resetGameSetupPage();

					
					$("#transitionMessage").text("Starting the game now. Get ready!");
					$("#transitionMessage").show("fade", {}, "slow", function() {
						setTimeout(function() {
							$("#transitionMessage").hide("fade", {}, "slow", function() {
								// Start the game!
								GameManager.setupPromptResponsePage();
							});
						}, 1000);
					});
				});
			}
			else if(roomState == "WAITING") {
				console.log("Detected waiting room state.");
			} 
			else if(roomState == "ABANDONED_BY_HOST") {
				handleAbandonedByHost();
			}
			else {
				console.log("Oops. Invalid room state: " + roomState);
			}
		}
		else {
			console.log("Oops. Room state does not exist.");
		}
	}
	
	function listenToRoomSetupState() {
		var db = App.getDatabase();
  		var roomSetupStateRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/roomSetupState");
		roomSetupStateRef.on("value", onChangeRoomSetupState);
		console.log("Registered Room Setup State Listener");
	}
	
	function stopListeningToRoomSetupState() {
		var db = App.getDatabase();
  		var roomSetupStateRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/roomSetupState");
		roomSetupStateRef.off("value");
		console.log("Unregistered Room Setup State Listener");
	}
	
	function insertSelfAsRoomUser() {
		var db = App.getDatabase();
  		var roomUsersRef = db.ref().child("rooms/" + RoomInfo.getRoomKey() + "/users");
		var newUserRef = roomUsersRef.push({
			"userKey": UserInfo.getUserKey(),
			"userName": UserInfo.getUserName()
		});
		
		console.log("Inserted self as room user. Key = " + newUserRef.key);
	}
	
	function createNewGameRoom() {
		// Insert the room into the database
		insertNewRoom();
		
		joinValidGameRoom();
		
		// Update the UI so the user (room owner) see the code
		//displayRoomPage();
		
		// Start the Firebase Listener for Room Users		
		//listenToRoomUsers();
		
		// Insert the current user to to room.
		//insertSelfAsRoomUser();
				
		// Do this later
		/*
		var roomPromptsRef = db.ref("rooms/" + roomKey).child("prompts");
		
		roomPromptsRef.push({"promptText": "Text 1."});
		roomPromptsRef.push({"promptText": "Text 2."});
		roomPromptsRef.push({"promptText": "Text 3."});
		*/
				
		//var roomStateRef = db.ref("rooms/" + roomKey).child("roomState");
		
		//roomStateRef.set({"currentAction": "GAME_SETUP"});
				
		
		//var roomUserRef = db.ref("rooms/" + roomKey).child("roomState");
		
		//roomStateRef.set({"currentAction": "GAME_SETUP"});
		
		console.log("Created room with prompts!");
	}
	
	function joinValidGameRoom() {
		// Update the UI so the user (room owner) see the code
		// This will connect to the room once it's displayed.
		displayRoomPage();
		

	}
	
	function connectToRoom() {
		// Start the Firebase Listener for Room Users		
		listenToRoomUsers();
		
		// Insert the current user to to room.
		insertSelfAsRoomUser();
		
		// Add listener for the Room Setup State
		listenToRoomSetupState();
	}
	
	function tryJoinExistingGameRoom(roomCodeInput) {
		var db = App.getDatabase();
		
		var roomRef = db.ref("rooms");
		var result = roomRef.orderByChild("roomCode").equalTo(roomCodeInput).limitToLast(1).once('value')
			.then(function (dataSnapshot) {
				console.log("Got data snapshot");
				if(dataSnapshot.exists()) {
					console.log("Success!");
					var roomKey = null;
					var roomData = null;
					
					dataSnapshot.forEach(function(childSnapshot) {
						roomKey = childSnapshot.key;
						roomData = childSnapshot.val();
						console.log("Room Data (child). Key = " + roomKey);
						console.log(roomData);
					});
					
					var roomSetupState = roomData.roomSetupState;
					
					if(roomSetupState == "WAITING") {
						RoomInfo.setRoomKey(roomKey);
						RoomInfo.setRoomCode(roomCodeInput);
						RoomInfo.setRoomOwnerKey(roomData.roomOwnerKey);
						RoomInfo.setRoomOwnerName(roomData.roomOwnerName);
						RoomInfo.setRoomSetupState(roomData.roomSetupState);
						
						$("#lobbyPage").hide("slide", {direction: "up"}, "slow", function() {
							$("#roomCodeErrorDiv").empty().hide();
							$("#roomCodeInput").val("");
							
							$("#transitionMessage").text("Joining Light Quest Game "  + roomCodeInput + " ...");
							$("#transitionMessage").show("fade", {}, "slow", function() {
								setTimeout(function() {
									$("#transitionMessage").hide("fade", {}, "slow", function() {
										joinValidGameRoom();
									});
								}, 1000);
							});
						});
					}
					else {
						$("#roomCodeErrorDiv").text("Looks like you missed the boat. This game room (" + roomCodeInput + ") isn't open for new users to join anymore.").show();
					}
				}
				else {
					$("#roomCodeErrorDiv").text("Ooops, we couldn't find the room with a room code of " + roomCodeInput + ". Did you enter it correctly?").show();
					console.log("No room exists");
				}
			});
	}
	
	function copyToClipboard2(elem) {
		var range = document.createRange();
		range.selectNode(emailLink);
		window.getSelection().addRange(range);
	}
	
	function copyToClipboard(elem) {
		  // create hidden text element, if it doesn't already exist
	    var targetId = "_hiddenCopyText_";
	    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
	    var origSelectionStart, origSelectionEnd;
	    if (isInput) {
	        // can just use the original source element for the selection and copy
	        target = elem;
	        origSelectionStart = elem.selectionStart;
	        origSelectionEnd = elem.selectionEnd;
	    } else {
	        // must use a temporary form element for the selection and copy
	        target = document.getElementById(targetId);
	        if (!target) {
	            var target = document.createElement("textarea");
	            target.style.position = "absolute";
	            target.style.left = "-9999px";
	            target.style.top = "0";
	            target.id = targetId;
	            document.body.appendChild(target);
	        }
	        target.textContent = elem.textContent;
	    }
	    // select the content
	    var currentFocus = document.activeElement;
	    target.focus();
		target.select();
	    target.setSelectionRange(0, target.value.length);
	    
	    // copy the selection
	    var succeed;
	    try {
	    	  succeed = document.execCommand("copy");
	    } catch(e) {
		    console.log("Copy failed!! Error below:");
			console.log(e);
	        succeed = false;
	    }
	    // restore original focus
	    if (currentFocus && typeof currentFocus.focus === "function") {
	        currentFocus.focus();
	    }
	    
	    if (isInput) {
	        // restore prior selection
	        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
	    } else {
	        // clear temporary content
	        target.textContent = "";
	    }
	    return succeed;
	}
	
	return {
		createNewGameRoom: createNewGameRoom,
		tryJoinExistingGameRoom: tryJoinExistingGameRoom,
		refreshGameSetupUI: refreshGameSetupUI,
		stopListeningToRoomUsers: stopListeningToRoomUsers,
		copyGameUrlClicked: copyGameUrlClicked
	};
})();