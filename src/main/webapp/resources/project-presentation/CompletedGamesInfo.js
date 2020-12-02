CompletedGamesInfo = (function() {
	var completedGamesMap = {};
	var completedGamesList = [];

	function loadFromDatabase(postFunction) {
		completedGamesMap = {};
		completedGamesList = [];
		
		var db = App.getDatabase();
		var completedGamesRef = db.ref("users/" + UserInfo.getUserKey()).child("completedGames");
		completedGamesRef.orderByChild("gameDate").once("value")
			.then(function (dataSnapshot) {
				if(dataSnapshot.exists()) {
					dataSnapshot.forEach(function(childSnapshot) {
						var completedGameObj = childSnapshot.val();
						var completedGameKey = childSnapshot.key;
						completedGamesMap[completedGameKey] = completedGameObj;
						completedGamesList.push(completedGameObj);	
					});
				}
				
				if(postFunction) {
					postFunction();
				}
			});
	}
	
	// Guaranteed to be ordered by date
	function getCompletedGamesList() {
		return completedGamesList;
	}
	
	// Guaranteed to be ordered by date
	function getCompletedGamesCount() {
		return completedGamesList.length;
	}
	
	function addCompletedGame(gameResultObj) {
		var db = App.getDatabase();
		var completedGamesRef = db.ref("users/" + UserInfo.getUserKey()).child("completedGames");
		var gameResultKey = completedGamesRef.push(gameResultObj);
		completedGamesMap[gameResultKey] = gameResultObj;
		completedGamesList.push(gameResultObj);		
	}
	
	return {
		loadFromDatabase: loadFromDatabase,
		getCompletedGamesList: getCompletedGamesList,
		getCompletedGamesCount: getCompletedGamesCount,
		addCompletedGame: addCompletedGame
	};
})();