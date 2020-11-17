LobbyManager = (function() {

	var initialized = false;
	
	function slideInLobbyUI(isFromStartPage) {
		// 1. Slide in the lobby component
		var slideDirection = isFromStartPage == true ? "right" : "up";
		$("#lobbyPage").show("slide", {direction: slideDirection}, "slow", function() {});
		
	}
	
	function refreshLobbyUI() {
        // Show the lobby page
		$("#lobbyBannerUsername").text(UserInfo.getUserName());
      	
		$("#roomCodeErrorDiv").empty().hide();
		$("#usernameErrorDiv").empty().hide();
		$("#roomCodeInput").val("");
	    
		// Commented out for IDI-2
		//$("#lobbyPage").show();

		var userLobbyMessage = UserInfo.getUserLobbyMessage();
		
		if(userLobbyMessage) {
			$("#lobbyUserMessage").text(userLobbyMessage);
			$("#lobbyUserMessageContainer").show();
			UserInfo.setUserLobbyMessage(null);
		}
	}
	
	function setupChangeNameLink() {
		$("#changeNameLink").on("click", function(event) {
			event.preventDefault();
			event.returnValue = false;
			
			$("#changeNameLinkContainer").hide();
			$("#changeNameActionContainer").show();
			
			return false;
		});
	}
	
	function setupChangeNameCancelButton() {
		$("#changeNameCancelLink").on("click", function(event) {
			event.preventDefault();
			event.returnValue = false;
			
			// Clear the input
			$("#changeNameInput").val("");
			$("#changeNameErrorDiv").empty().hide();
			
			$("#changeNameLinkContainer").show();
			$("#changeNameActionContainer").hide();
			
			return false;
		});
	}
		
	function setupChangeNameFormListener() {
		$("#changeNameForm").submit(function(event) {
			event.preventDefault();
			event.returnValue = false;
			
			// The form doesn't _actually_ need to be submitted.
			console.log("Changing Name!!");
			
			var userNameSource = $("#changeNameInput").val();
			var userName = "";
			
			if(userNameSource) {
				userName = userNameSource.trim(); 
			}
			
			if(userName.length > 0) {
				
				if(userName.length <= Constants.getMaxNameLength()) {
					// Update the user name in memory				
					UserInfo.setUserName(userName);
	
					// Update the user name in the database
					var db = App.getDatabase();
					var userRef = db.ref().child("users/" + UserInfo.getUserKey());
					userRef.set({"userName": userName});
					
					// Update the username in the user's current game.
					var roomKey = RoomInfo.getRoomKey();
					if(roomKey) {
						
						// Update the room info if this is the host
						if(RoomInfo.getRoomOwnerKey() == UserInfo.getUserKey()) {
							var roomOwnerNameRef = db.ref().child("rooms/" + roomKey + "/roomOwnerName");
							roomOwnerNameRef.set(userName);
						}
						
						// Update the game user sub-object
						var myGameUserRawKey = null;
						var gameUsersRawData = GameUsersInfo.getGameUsersRawData();
						for(const [gameUserRawKey, gameUserRawValue] of Object.entries(gameUsersRawData)) {
							var gameUserRawObj = gameUserRawValue;
							if(UserInfo.getUserKey() == gameUserRawObj.userKey) {
								myGameUserRawKey = gameUserRawKey;
								break;
							}
						}
						
						if(myGameUserRawKey) {
							var gameUserNameRef = db.ref().child("rooms/" + roomKey + "/users/" + myGameUserRawKey + "/userName");
							gameUserNameRef.set(userName);
						}
					}
					else {
						// The user is not currently in a game, so they are in the lobby. Make sure we update the Lobby UI
						// here because the event listener has not been set up, so it won't propagate back.
						$("#lobbyBannerUsername").text(userName);
					}
					
					// Clean up the "change name" widget
					$("#changeNameErrorDiv").empty().hide();
					$("#changeNameLinkContainer").show();
					$("#changeNameActionContainer").hide();
					$("#changeNameInput").val("");
					
					// Update the username on the page
					$("#navBarName").text(userName);
				}
				else {
					$("#changeNameErrorDiv").text("Username is too long. Must be less than " + Constants.getMaxNameLength() + " characters.").show();
				}
			}
			else {
				$("#changeNameErrorDiv").text("Oops, username can't be empty.").show();
			}
			
			return false;
		});
	}

	function setupListener() {
		if(!initialized) {
			$("#createRoomButton").on("click", function(event) {
				console.log("User chose to create a new game.");
				$("#lobbyPage").hide("slide", {direction: "up"}, "slow", function() {
					$("#roomCodeErrorDiv").empty().hide();
					$("#roomCodeInput").val("");
					
					$("#transitionMessage").text("Creating New Light Quest Game ...");
					$("#transitionMessage").show("fade", {}, "slow", function() {
						setTimeout(function() {
							$("#transitionMessage").hide("fade", {}, "slow", function() {
								GameSetupManager.createNewGameRoom();
							});
						}, 1000);
					});
				});
		    });
			
			$("#roomCodeInputForm").submit(function(event) {
				event.preventDefault();
				event.returnValue = false;
				
				var roomCodeInput = $("#roomCodeInput").val();
				
				if(!roomCodeInput) {
					roomCodeInput = "";
				}
				
				var trimmedRoomCode = roomCodeInput.trim().toUpperCase();
				if(trimmedRoomCode.length == 5) {
					GameSetupManager.tryJoinExistingGameRoom(trimmedRoomCode);					
				}
				else {
					$("#roomCodeErrorDiv").text("Please provide a five-digit room code.").show();
				}
				
				console.log("Trimmed room code input = " + trimmedRoomCode);
				
			});
			
			$("#lobbyUserMessageDismissLink").on("click", function(event) {
				$("#lobbyUserMessageContainer").hide();
				$("#lobbyUserMessage").empty();
				event.preventDefault();
				event.returnValue = false;
				return false;
			});
			
			// Set up change name
			/*setupChangeNameLink();
			setupChangeNameFormListener();
			setupChangeNameCancelButton();*/
			
			initialized = true;
		}
	}
		
	return {
		setupListener: setupListener,
		refreshLobbyUI: refreshLobbyUI,
		slideInLobbyUI: slideInLobbyUI
	};
})();