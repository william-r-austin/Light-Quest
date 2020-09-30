AddUserManager = (function(){
	var initialized = false;
		
	function enterLobby() {
		var userName = UserInfo.getUserName();
      	
      	$("#lobbyWelcomeBanner").text("Welcome to the Lobby " + userName + "! Choose one of the options below to begin.");
		$("#usernameErrorDiv").empty().hide();
      	$("#startPage").hide();
		$("#roomCodeErrorDiv").empty().hide();
      	$("#lobbyPage").show();

		LobbyManager.setupListener();
	}
	
	function setupListener() {
		if(initialized === false) {
		    // Listen to the input button events
			$("#usernameInputButton").on("click", function(event) {
				var userNameSource = $("#usernameInput").val();
				var userName = "";
				
				if(userNameSource) {
					userName = userNameSource.trim(); 
				}
				
				if(userName.length > 0) {
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

					enterLobby();
		      	}
				else {
					$("#usernameErrorDiv").text("Oops, username can't be empty.").show();
				}
		    });

			initialized = true;
		}
	}
	
	return {
		setupListener: setupListener,
		enterLobby: enterLobby
	};

})();
