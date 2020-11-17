GameUsersInfo = (function() {
	var gameUsersList = [];
	var gameUsersMap = {};
	var gameUsersStatusMap = {};
	var gameUsersRawData = {};
	
	function setGameUsersRawData(newGameUsersRawData) {
		gameUsersRawData = newGameUsersRawData;
	}
	
	function getGameUsersRawData() {
		return gameUsersRawData;
	}
	
	function setGameUsersList(newGameUsersList) {
		gameUsersList = newGameUsersList;
		
		newGameUsersMap = {};
		newGameUsersStatusMap = {};
		for(var i = 0; i < gameUsersList.length; i++) {
			var gameUser = gameUsersList[i];
			newGameUsersMap[gameUser.userKey] = gameUser.userName;
			
			// Need to copy from the old one.
			var existingValue = gameUsersStatusMap[gameUser.userKey];
			var newUserStatus = false;
			if(existingValue) {
				newUserStatus = true;
			}
			newGameUsersStatusMap[gameUser.userKey] = newUserStatus;
			
		}
		
		gameUsersMap = newGameUsersMap;
		gameUsersStatusMap = newGameUsersStatusMap;
	}
	
	function getGameUsersList() {
		return gameUsersList;
	}
	
	function getGameUsersMap() {
		return gameUsersMap;
	}
	
	function getGameUsersStatusMap() {
		return gameUsersStatusMap;
	}
	
	function setGameUsersStatus(userKey, userStatus) {
		var existing = gameUsersStatusMap[userKey];
		gameUsersStatusMap[userKey] = userStatus;
		
		var valueChanged = (existing !== userStatus);
		return valueChanged;
	}
	
	function resetGameUsersStatus() {
		var userKeys = Object.keys(gameUsersStatusMap);
		
		for(var k = 0; k < userKeys.length; k++) {
			var userKey = userKeys[k];
			gameUsersStatusMap[userKey] = false;
		}
	}
	
	function clear() {
		gameUsersRawData = {};
		gameUsersList = [];
		gameUsersMap = {};
		gameUsersStatusMap = {};
	}
	
	return {
		setGameUsersRawData: setGameUsersRawData,
		getGameUsersRawData: getGameUsersRawData,
		setGameUsersList: setGameUsersList,
		getGameUsersList: getGameUsersList,
		getGameUsersMap: getGameUsersMap,
		getGameUsersStatusMap: getGameUsersStatusMap,
		setGameUsersStatus: setGameUsersStatus,
		resetGameUsersStatus: resetGameUsersStatus,
		clear: clear
	};
})();

