AddUserManager = (function() {
	var initialized = false;
		
	function enterLobby(isFromStartPage) {
		var userName = UserInfo.getUserName();
        
		// Populate the title bar
		$("#nameBox").show();
		$("#navBarName").text(userName);

		LobbyManager.refreshLobbyUI();
		LobbyManager.setupListener();
		LobbyManager.slideInLobbyUI(isFromStartPage);
	}
		
	function setupListener() {
		// Clear the username input when the page loads. Some browsers don't do this.
		$("#usernameInput").val("");
		
		if(initialized === false) {
		    // Listen to the input button events
			//$("#usernameInputButton").on("click", function(event) {
			$("#usernameInputForm").submit(function(event) {
				// The form doesn't _actually_ need to be submitted.
				event.preventDefault();
				event.returnValue = false;
					
				var userNameSource = $("#usernameInput").val();
				var userName = "";
				
				if(userNameSource) {
					userName = userNameSource.trim(); 
				}
				
				if(userName.length > 0) {
					if(userName.length <= Constants.getMaxNameLength()) {
						console.log("Button clicked. Value of input is: " + userName);
						
				  		var newUserObject = {
				  			"userName": userName
				  		};
				  	
						var db = App.getDatabase(); 
				  		var userRef = db.ref().child("users");
				
						var insertUserRef = userRef.push({"userName" : userName});
						var userKey = insertUserRef.key;
						
						console.log("Got new key. Value is: " + userKey);
						
						// Populate the user info object					
						UserInfo.setUserKey(userKey);
						UserInfo.setUserName(userName);
	
						$("#startPage").hide("slide", {direction: "left"}, "slow", function() {
							$("#roomCodeErrorDiv").empty().hide();
							$("#usernameErrorDiv").empty().hide();
							$("#roomCodeInput").val("");
							
							$("#transitionMessage").text("Entering Lobby ...");
							$("#transitionMessage").show("fade", {}, "slow", function() {
								setTimeout(function() {
									$("#transitionMessage").hide("fade", {}, "slow", function() {
										enterLobby(true);
									});
								}, 1000);
							});
						});						
					}
					else {
						$("#changeNameErrorDiv").text("Username is too long. Must be less than " + Constants.getMaxNameLength() + " characters.").show();
					}
		      	}
				else {
					$("#usernameErrorDiv").text("Oops, username can't be empty.").show();
				}
				
				return false;
		    });

			initialized = true;
		}
	}
	
	return {
		setupListener: setupListener,
		enterLobby: enterLobby
	};

})();
