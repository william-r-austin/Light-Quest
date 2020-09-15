GameSetupManager = (function() {
	
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
			if(gameUsersCount >= 3) {
				if($("#completeGameSetupDiv").length < 1) {
					var startGameDivText =
						'<div id="completeGameSetupDiv">' +
						'  <button type="button" id="completeGameSetupButton">Start the Game!</button>' +
						'</div>';
					var startGameDivElement = $(startGameDivText);
					$("#gameRoomSetupPage").append(startGameDivElement);
					
					$("#completeGameSetupButton").on("click", startGameButtonClicked);
					console.log("Added Start Game button for room owner.");
				}
			}
			else {
				$("#completeGameSetupDiv").remove();
			}
		}
	}
	
	function onChangeRoomUsers(dataSnapshot) {
		console.log("Got new room user change! Value is:");
		console.log(dataSnapshot.val());
		
		if(dataSnapshot.exists()) {
			$("#gameRoomSetupUsersList").empty();
			
			var gameUsersList = [];
			
			dataSnapshot.forEach(function(childSnapshot) {
				var addedUserData = childSnapshot.val();
				gameUsersList.push(addedUserData);
				
				var addedUserKey = addedUserData.userKey 
				var addedUserName = addedUserData.userName;
				var itemText = addedUserName;
				
				if(UserInfo.getUserKey() === addedUserKey) {
					itemText += " (you)";
				}
				
				var newListItem = $("<li>").text(itemText);	
				$("#gameRoomSetupUsersList").append(newListItem);
				
				console.log("Added user to game room: " + itemText);
			});
			
			GameUsersInfo.setGameUsersList(gameUsersList);
			addStartButtonForRoomOwner();

		}
		else {
			GameUsersInfo.setGameUsersList([]);
		}
	}
	
	function displayRoomPage() {
		$("#roomCodeErrorDiv").empty().hide();
		$("#lobbyPage").hide();
		$("#gameRoomSetupPage").show();
		$("#gameRoomSetupBanner").text("Welcome to the Game Room " + UserInfo.getUserName() + ". The room code is: " + RoomInfo.getRoomCode());
		$("#gameRoomSetupMessage").text("Share the code above with your friends to allow them to join. Once everyone has joined, the" + 
			" host (" + RoomInfo.getRoomOwnerName() + ") can start the game. At least three participants must join the room before the game" +
			" can be started.");
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
	
	function onChangeRoomSetupState(dataSnapshot) {
		console.log("Room setup state changed!");

		if(dataSnapshot.exists()) {
			var roomState = dataSnapshot.val();
			console.log("Room state is: " + roomState);
			
			//var roomState = snapshotVal.roomSetupState;
			
			if(roomState === "COMPLETE") {
				// Stop listening to changes in the room users
				stopListeningToRoomUsers();
					
				// Stop listening to changes in the room setup state
				stopListeningToRoomSetupState();
				
				// Start the game!
				GameManager.setupPromptResponsePage();
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
		displayRoomPage();
		
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
						
						joinValidGameRoom();
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
	
	return {
		createNewGameRoom: createNewGameRoom,
		tryJoinExistingGameRoom: tryJoinExistingGameRoom
	};
})();