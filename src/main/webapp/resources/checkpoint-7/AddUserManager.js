AddUserManager = (function() {
	var initialized = false;

	/*
	var returningUserEmail = null;
	function setReturningUserEmail(newReturningUserEmail) {
		returningUserEmail = newReturningUserEmail;
	}
	*/
		
	function enterLobby(isFromStartPage, sourceLocation) {
		//var userName = UserInfo.getUserName();
		
		var tryJoinGame = false;
		var roomCode = "";
		
		if("GAME" != sourceLocation) {
			var urlString = window.location.href;
			var url = new URL(urlString);
			var roomCode = url.searchParams.get("roomCode");
			
			if(roomCode != null) {
				tryJoinGame = true;
			}
			
			var baseUrl = urlString.split("?")[0];
			if(baseUrl != urlString) {
				window.history.pushState({},"", baseUrl);
			}
		}
		
		if(tryJoinGame) {
			GameSetupManager.tryJoinExistingGameRoom(roomCode, sourceLocation);
		}
		else {
			LobbyManager.enterLobbyValid(isFromStartPage);
		}
	}
	
	function startLobbyTransition() {
		$("#startPage").hide("slide", {direction: "left"}, "slow", function() {
			// Clean up the welcome page
			resetStartPage();
			
			// Clean up the lobby page
			$("#roomCodeErrorDiv").empty().hide();
			$("#usernameErrorDiv").empty().hide();
			$("#roomCodeInput").val("");
			
			$("#transitionMessage").text("Entering Lobby ...");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
						enterLobby(true, "WELCOME");
					});
				}, 1000);
			});
		});
	}
	
	function insertValidUser(userObject) {
		var db = App.getDatabase(); 
  		var userRef = db.ref().child("users");
		var insertUserRef = userRef.push(userObject);
		var userKey = insertUserRef.key;
		var userName = userObject.userName;
		
		var userEmail = null;
		if(userObject.userEmail) {
			userEmail = userObject.userEmail;
		}
		
		var userEmailLowercase = null;
		if(userObject.userEmailLowercase) {
			userEmailLowercase = userObject.userEmailLowercase;
		}
		
		// Populate the user info object					
		UserInfo.setUserKey(userKey);
		UserInfo.setUserName(userName);
		UserInfo.setUserEmail(userEmail);
		UserInfo.setUserEmailLowercase(userEmailLowercase);
		
		// Save the user key in local storage
		window.localStorage.setItem("LightQuestUserKey", userKey);

		// Go to the lobby
		startLobbyTransition();
	}
		
	function setupListener() {
		if(!initialized) {
			
			$("#skipEmailInput").change(function() {
				var isVisible = $("#userEmailInputDiv").is(":visible");
				var showHideTimeMs = 500;
				
				if(this.checked) {
					if(isVisible) {
						$("#userEmailInputDiv").slideUp(showHideTimeMs);
					}
				}
				else {
					if(!isVisible) {
						$("#userEmailInputDiv").slideDown(showHideTimeMs);
					}
				}
			});
			
		    // Listen to the input button events
			$("#returningUsersForm").submit(function(event) {
				event.preventDefault();
				event.returnValue = false;
				
				var userEmailSource = $("#returningUserEmail").val();
				var userEmailLowercase = "";
				
				if(userEmailSource) {
					userEmailLowercase = userEmailSource.trim().toLowerCase();
				}
				
				if(userEmailLowercase.length > 0) {
					var db = App.getDatabase();
					db.ref("users").orderByChild("userEmailLowercase").equalTo(userEmailLowercase).limitToLast(1).once('value')
						.then(function (snapshot) {
							var foundUserAccount = false;
							
							if(snapshot.exists()) {
								snapshot.forEach(function(childSnapshot) {
									var userKey = childSnapshot.key;
																		
									if(userKey) {
										// User has successfully logged in
										foundUserAccount = true;
										
										// Set the user info
										var userData = childSnapshot.val();
										UserInfo.setUserKey(userKey);
										UserInfo.setUserName(userData.userName);
										if(userData.userEmail && userData.userEmailLowercase) {
											UserInfo.setUserEmail(userData.userEmail);
											UserInfo.setUserEmailLowercase(userData.userEmailLowercase);
										}
										else {
											UserInfo.setUserEmail(null);
											UserInfo.setUserEmailLowercase(null);
										}
										
										// Save the user key in local storage
										window.localStorage.setItem("LightQuestUserKey", userKey);
									}
								});
							}
							
							if(foundUserAccount) {
								startLobbyTransition();
							}
							else {
								$("#returningUserErrorDiv").text("Could not find account for that email. Did you type it correctly?").show();
							}
						});
				}
				else {
					$("#returningUserErrorDiv").text("Email field cannot be blank.").show();
				}
				
				return false;
			});
				
			$("#usernameInputForm").submit(function(event) {
				// The form doesn't _actually_ need to be submitted.
				event.preventDefault();
				event.returnValue = false;
				
				// Validation errors
				var validationErrors = [];
				var dbSearch = false;
				
				// Get the username and validate it.
				var userNameSource = $("#usernameInput").val();
				var userName = "";
				
				if(userNameSource) {
					userName = userNameSource.trim(); 
				}
				
				if(userName.length < 1) {
					validationErrors.push("Oops, username can't be empty.");
				}
				
				if(userName.length > Constants.getMaxNameLength()) {
					validationErrors.push("Username is too long. The maximum length is " + Constants.getMaxNameLength() + " characters.");
				}
				
				// If the username is ok, parse and validate the email input.
				if(validationErrors.length == 0) {
					// Store the checkbox value, but allow users to skip the
					// field without entering the email.
					var userSkippedEmail = $("#skipEmailInput").prop("checked");
	
					// Read and validate the email if the user entered one
					var userEmail = "";
					var userEmailLowercase = "";
					if(!userSkippedEmail) {
						var userEmailSource = $("#userEmailInput").val();
						
						if(userEmailSource) {
							userEmail = userEmailSource.trim();
							userEmailLowercase = userEmail.toLowerCase();
						}
						
						if(userEmail.length > 0) {
							if(userEmail.length <= Constants.getMaxEmailLength()) {
								var validEmailFormat = Util.emailIsValid(userEmail);
								if(validEmailFormat) {
									dbSearch = true;
									var db = App.getDatabase();
									db.ref("users").orderByChild("userEmailLowercase").equalTo(userEmailLowercase).limitToLast(1).once('value')
										.then(function (snapshot) {
											if(snapshot.exists() && snapshot.hasChildren()) {
												validationErrors.push("The email you entered is already being used. Please choose a different email.");
												$("#usernameErrorDiv").text(validationErrors[0]).show();
											}
											else {
												var userObject = {
													"userName": userName,
													"userEmail": userEmail,
													"userEmailLowercase": userEmailLowercase
												};
												insertValidUser(userObject);
											}
										});
								}
								else {
									validationErrors.push("The format of the email you entered is not valid.");
								}
							}
							else {
								validationErrors.push("Email is too long. The maximum length is " + Constants.getMaxEmailLength() + " characters.");
							}
						}
					}
				}
				
				if(!dbSearch) {
					if(validationErrors.length == 0) {
						insertValidUser({"userName": userName});
					}
					else {
						$("#usernameErrorDiv").text(validationErrors[0]).show();
					}
				}
				
				return false;
		    });

			initialized = true;
		}
	}
	
	function resetStartPage() {
		// Clean up the welcome page
		// Clear the input fields when the page loads. Some browsers don't do this.
		$("#returningUserEmail").val("");
		$("#usernameInput").val();
		$("#userEmailInputDiv").show();
		$("#userEmailInput").val("");
		$("#skipEmailInput").prop("checked", false);
		$("#usernameErrorDiv").hide().text("");
		$("#returningUserErrorDiv").hide().text("");
	}
	
	/*
	function refreshAndShowStartPage() {
		// Clear the input fields when the page loads. Some browsers don't do this.
		$("#usernameInput").val("");
		$("#returningUserEmail").val();
		$("#userEmailInput").val();
		
		// Clear the checkbox as well
		$("#skipEmailInput").prop("checked", false);
		
		// Show the Start/Welcome page
		$("#startPage").show();
	}*/
	
	return {
		setupListener: setupListener,
		enterLobby: enterLobby,
		resetStartPage: resetStartPage
	};

})();
