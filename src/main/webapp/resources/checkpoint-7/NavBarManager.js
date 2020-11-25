NavBarManager = (function() {
	var initialized = false;
	const OVERLAY_FADE_TIME = 500;
	
	function refreshForLobby() {
		setNavBarUserInfo();
		$("#hamburgerChangeNameContainer").show();
		$("#hamburgerChangeEmailContainer").show();
		$("#hamburgerLogoutContainer").show();
		refreshViewStatisticsItem();
		
		$("#navTools").show();
	}
	
	function refreshForGame() {
		setNavBarUserInfo();
		$("#hamburgerChangeNameContainer").show();
		$("#hamburgerChangeEmailContainer").show();
		$("#hamburgerLogoutContainer").hide();
		refreshViewStatisticsItem();
		$("#navTools").show();
	}
	
	function refreshViewStatisticsItem() {
		if(CompletedGamesInfo.getCompletedGamesCount() > 0) {
			$("#hamburgerViewStatisticsContainer").show();			
		}
		else {
			$("#hamburgerViewStatisticsContainer").hide();
		}
	}
	
	function refreshForWelcome() {
		$("#navBarName").text("").hide();
		$("#navBarEmail").text("").hide();
		
		$("#hamburgerChangeNameContainer").hide();
		$("#hamburgerChangeEmailContainer").hide();
		$("#hamburgerViewStatisticsContainer").hide();
		$("#hamburgerLogoutContainer").hide();
		
		$("#navTools").show();
	}
	
	
	
	function setNavBarUserInfo() {
		// Set the username
		$("#navBarName").text(UserInfo.getUserName()).show();
		
		// Set the email, if available
		if(UserInfo.getUserEmail()) {
			$("#navBarEmail").text(UserInfo.getUserEmail()).show();
		}
		else {
			$("#navBarEmail").text("").hide();
		}
	}
	
	function initialize() {
		if(!initialized) {
			
			// Set up the main buttons	
			$("#hamburgerChangeNameContainer").on("click", showChangeNameCard);
			$("#hamburgerChangeEmailContainer").on("click", showChangeEmailCard);
			$("#hamburgerViewStatisticsContainer").on("click", showViewStatisticsCard);
			$("#hamburgerSwitchThemesContainer").on("click", showSwitchThemesCard);
			$("#hamburgerLogoutContainer").on("click", showLogoutCard);
			
			$("#navShowHamburgerMenuButton").on("click", showHamburgerMenu);
		
			// Set up the "Cancel" links
			$("a.overlayCancelLink").on("click", cancelOverlay);
			
			// Set up the form submission
			$("#navChangeNameForm").submit(changeNameFormSubmitted);
			$("#navChangeEmailForm").submit(changeEmailFormSubmitted);
			$("#navLogoutForm").submit(logoutFormSubmitted);
			
			// Set up the "skip email" listener
			$("#navSkipEmailInput").change(navSkipEmailChanged);
			
			// Theme Switch Listener
			setupSwitchThemeRadioButtonHandler();
			
			initialized = true;
		}
	}
	
	function setupSwitchThemeRadioButtonHandler() {
		$("input[type='radio'][name='themeOptionInput']").change(function() {
		    var themeValue = $(this).val();
			setTheme(themeValue);
		});
	}
	
	
	function navSkipEmailChanged() {
		var isVisible = $("#navEmailInputDiv").is(":visible");
		var showHideTimeMs = 500;
		
		if(this.checked) {
			if(isVisible) {
				$("#navEmailInputDiv").slideUp(showHideTimeMs);
			}
		}
		else {
			if(!isVisible) {
				$("#navEmailInputDiv").slideDown(showHideTimeMs);
			}
		}
	};
	
	function showChangeNameCard() {
		$("#overlayHamburgerMenu").hide();
		$("#overlay").off("click");
		
		$("#navUsernameInput").val(UserInfo.getUserName());
		$("#navUsernameErrorDiv").text("").hide();
		$("#overlayChangeNameCard").fadeIn(OVERLAY_FADE_TIME);
	}
	
	function showChangeEmailCard() {
		var currentUserEmail = "";
		if(UserInfo.getUserEmail()) {
			currentUserEmail = UserInfo.getUserEmail();
		}
		
		$("#overlayHamburgerMenu").hide();
		$("#overlay").off("click");
		
		$("#navEmailInputDiv").show();
		$("#navEmailInput").val(currentUserEmail);
		$("#navSkipEmailInput").prop("checked", false);
		$("#navEmailErrorDiv").text("").hide();
		$("#overlayChangeEmailCard").fadeIn(OVERLAY_FADE_TIME);
	}
	
	function computeGameScore(promptCount, playerCount, totalVotes) {
		var totalPossible = promptCount * (playerCount - 1);
		var expected = promptCount;
		var expectedFrac = expected / totalPossible;
		
		
		var exp = Math.log(0.5) / Math.log(expectedFrac);
		
		var actualFrac = totalVotes / totalPossible;
		
		var gameScore = Math.pow(actualFrac, exp);
		return Math.round(gameScore * 1000) / 10;
	}
	
	function showViewStatisticsCard() {
		$("#overlayHamburgerMenu").hide();
		$("#overlay").off("click");
		
		var gamesList = CompletedGamesInfo.getCompletedGamesList();
		
		var gameScoreLabels = [];
		var gameScoresData = [];
		var gameScoresColor = [];
		
		var i = 0; 
		while(i < gamesList.length) {
			var current = gamesList[i];
			
			
			var date1 = new Date();
			date1.setTime(current.gameDate);
			date1.toLocaleString('en-US', {timeZone: 'America/New_York'});
			
			var str = "votes";
			if(current.totalVotes == 1) {
				str = "vote";
			}
			
			var label = [current.roomCode + ": " + current.totalVotes + " " + str, date1.toLocaleString()]; 
			
			gameScoreLabels.push(label);
			gameScoresColor.push("#0062ff");
			var gameScore = computeGameScore(current.promptCount, current.playerCount, current.totalVotes);
			gameScoresData.push(gameScore);
			i++;
		}
		
		new Chart(document.getElementById("bar-chart"), {
		    type: 'bar',
		    data: {
		      labels: gameScoreLabels,
		      datasets: [
		        {
		          label: "Game Score for Room Code and Date",
		          backgroundColor: gameScoresColor, /*["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],*/
		          data: gameScoresData/*[2478,5267,734,784,433]*/
		        }
		      ]
		    },
		    options: {
		      legend: { display: false },
		      title: {
		        display: true,
		        text: 'Your Light Quest Game Scores over Time'
		      }
		    }
		});
		
		
		$("#overlayStatisticsCard").fadeIn(OVERLAY_FADE_TIME);
	}
	
	function getCurrentTheme() {
		if($("body").hasClass("classic-theme")) {
			return "classic-theme";
		}
		
		return "checkpoint7-theme";
	}
	
	function setTheme(newTheme) {
		$("body")
			.removeClass("classic-theme")
			.removeClass("checkpoint7-theme")
			.addClass(newTheme);
	}
	
	function showSwitchThemesCard() {
		$("#overlayHamburgerMenu").hide();
		$("#overlay").off("click");
		
		var currentTheme = getCurrentTheme();
		$("input[value='" + currentTheme + "']").prop("checked", true);
		
		$("#overlaySwitchThemeCard").fadeIn(OVERLAY_FADE_TIME);
	}
	
	function showHamburgerMenu() {
		//$("#overlayLogoutCard").show();
		
		//$("#hamburgerMenuContainer").show();
		
		var buttonPosition = $("#navShowHamburgerMenuButton").position();
		var buttonWidth = $("#navShowHamburgerMenuButton").width();
		var buttonHeight = $("#navShowHamburgerMenuButton").innerHeight();
		var windowWidth = $(window).width();
		
		$("#overlayHamburgerMenu")
			.css("right", windowWidth - (buttonPosition.left + (buttonWidth / 2)))
			.css("top", buttonPosition.top + buttonHeight)
			.show();
			
		$("#overlay").fadeIn(OVERLAY_FADE_TIME);
		
		$("#overlay").on("click", overlayClicked);
	}
	
	function overlayClicked(clickEvent) {
		clickEvent.preventDefault();
		clickEvent.returnValue = false;
		
		$("#overlay").fadeOut(OVERLAY_FADE_TIME, function() {
			$("#overlayHamburgerMenu").hide();
		});
		
		$("#overlay").off("click");
		return false;
	}
	
	function showLogoutCard() {
		$("#overlayHamburgerMenu").hide();
		$("#overlay").off("click");
		
		$("#overlayLogoutCard").fadeIn(OVERLAY_FADE_TIME);
	}
	
	function cancelOverlay(clickEvent) {
		clickEvent.preventDefault();
		clickEvent.returnValue = false;

		closeOverlay();
		return false;
	}
	
	function closeOverlay(customFunc) {
		$("#overlay").fadeOut(OVERLAY_FADE_TIME, function() {
			$("#overlayChangeNameCard").hide();
			$("#overlayChangeEmailCard").hide();
			$("#overlayStatisticsCard").hide();
			$("#overlaySwitchThemeCard").hide();
			$("#overlayLogoutCard").hide();
			$("#overlayHamburgerMenu").hide();
			
			if(customFunc) {
				customFunc();
			}
		});
	}
	
	function changeNameFormSubmitted(submitFormEvent) {
		// The form doesn't _actually_ need to be submitted.
		submitFormEvent.preventDefault();
		submitFormEvent.returnValue = false;
		
		var userNameSource = $("#navUsernameInput").val();
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
				var userNameRef = db.ref("users/" + UserInfo.getUserKey()).child("userName");
				userNameRef.set(userName);
				
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
				$("#navUsernameErrorDiv").empty().hide();
				$("#navUsernameInput").val("");
				
				// Update the username on the page
				$("#navBarName").text(userName);
				
				// Close the overlay
				closeOverlay();
			}
			else {
				$("#navUsernameErrorDiv").text("Username is too long. Maximum length is " + Constants.getMaxNameLength() + " characters.").show();
			}
		}
		else {
			$("#navUsernameErrorDiv").text("Oops, username can't be empty.").show();
		}
		
		return false;
	}
	
	function setUserEmail(newUserEmail) {
		var db = App.getDatabase();
		var userEmailRef = db.ref("users/" + UserInfo.getUserKey()).child("userEmail");
		userEmailRef.set(newUserEmail);
	}
	
	function setUserEmailLowercase(newUserEmailLowercase) {
		var db = App.getDatabase();
		var userEmailLowercaseRef = db.ref("users/" + UserInfo.getUserKey()).child("userEmailLowercase");
		userEmailLowercaseRef.set(newUserEmailLowercase);
	}
		
	function changeEmailFormSubmitted(submitFormEvent) {
		// The form doesn't _actually_ need to be submitted.
		submitFormEvent.preventDefault();
		submitFormEvent.returnValue = false;
		
		var validationErrors = [];
		var userEmailSource = $("#navEmailInput").val();
		var userEmail = "";
		var userEmailLowercase = "";
		
		var userSkippedEmail = $("#navSkipEmailInput").prop("checked");
		
		if(!userSkippedEmail && userEmailSource) {
			userEmail = userEmailSource.trim();
			userEmailLowercase = userEmail.toLowerCase(); 
		}
			
		// Check the length of the email
		if(userEmail.length > Constants.getMaxEmailLength()) {
			validationErrors.push("Email is too long. The maximum length is " + Constants.getMaxEmailLength() + " characters.");
		}
			
		// Check the format of the email
		if(validationErrors.length == 0 && userEmail.length > 0) {
			var validEmailFormat = Util.emailIsValid(userEmail);
			if(!validEmailFormat) {
				validationErrors.push("The format of the email you entered is not valid.");
			}
		}
		
		if(validationErrors.length == 0) {
			if(userEmail.length > 0) {
				var db = App.getDatabase();
					
				db.ref("users").orderByChild("userEmailLowercase").equalTo(userEmailLowercase).limitToLast(1).once('value')
					.then(function (snapshot) {
						var currentUserKey = UserInfo.getUserKey();
						var emailCollision = false;
						
						if(snapshot.exists() && snapshot.hasChildren()) {
							snapshot.forEach(function(childSnapshot) { 
								var emailMatchUserKey = childSnapshot.key;
								if(currentUserKey != emailMatchUserKey) {
									emailCollision = true;
								}
							});
						}
						
						if(emailCollision) {
							validationErrors.push("The email you entered is already being used. Please choose a different email.");
							$("#navEmailErrorDiv").text(validationErrors[0]).show();
						}
						else {
							// Update the emails in the database
							setUserEmail(userEmail);
							setUserEmailLowercase(userEmailLowercase);
							
							// Update the emails in local memory
							UserInfo.setUserEmail(userEmail);
							UserInfo.setUserEmailLowercase(userEmailLowercase);
							
							// Update the email in the nav bar
							$("#navBarEmail").text(userEmail).show();
							
							// Close the overlay
							closeOverlay();
						}
					});
			}
			else {
				// Remove the email from the database
				setUserEmail(null);
				setUserEmailLowercase(null);
				
				// Remove the emails from local memory
				UserInfo.setUserEmail(null);
				UserInfo.setUserEmailLowercase(null);
				
				// Remove the email in the nav bar
				$("#navBarEmail").text("").hide();
				
				// Close the overlay
				closeOverlay();
			}
		}
		else {
			$("#navEmailErrorDiv").text(validationErrors[0]).show();
		}
		
		return false;
	}
	
	function completeLogout() {
		// Save off the current user email value
		var currentUserEmail = UserInfo.getUserEmail();
		
		// Clear the game and room state
		GameManager.clearAllLocalData();
		
		// Clear the user info
		UserInfo.clear();
		
		// Remove the currently saved user key from local storage
		window.localStorage.removeItem("LightQuestUserKey");
		
		// Reset the menu for the start page
		refreshForWelcome();
		
		// Slide out the lobby and slide in the welcome page again
		$("#lobbyPage").hide("slide", {direction: "right"}, "slow", function() {
			$("#roomCodeErrorDiv").empty().hide();
			$("#roomCodeInput").val("");
			AddUserManager.resetStartPage();
					
			$("#transitionMessage").text("Logging out ...");
			$("#transitionMessage").show("fade", {}, "slow", function() {
				setTimeout(function() {
					$("#transitionMessage").hide("fade", {}, "slow", function() {
						$("#startPage").show("slide", {direction: "left"}, "slow", function() {
							// Set the email to be pre-populated on the start page
							if(currentUserEmail) {
								$("#returningUserEmail").val(currentUserEmail);
							}
						});
					});
				}, 1000);
			});
		});
	}
	
	function logoutFormSubmitted(submitFormEvent) {
		// The form doesn't _actually_ need to be submitted.
		submitFormEvent.preventDefault();
		submitFormEvent.returnValue = false;
		
		// Close the overlay
		closeOverlay(completeLogout);
		
		return false;
	}
	
	return {
		initialize: initialize,
		refreshForWelcome: refreshForWelcome,
		refreshForLobby: refreshForLobby,
		refreshForGame: refreshForGame
	};
})();
