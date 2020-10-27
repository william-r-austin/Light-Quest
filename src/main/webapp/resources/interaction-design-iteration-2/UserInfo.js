UserInfo = (function() {
	var userName = null;
	var userKey = null;
	var userLobbyMessage = null;
	
	function setUserName(newUserName) {
		userName = newUserName;
	}
	
	function getUserName() {
		return userName;
	}
	
	function setUserKey(newUserKey) {
		userKey = newUserKey;
	}
	
	function getUserKey() {
		return userKey;
	}
	
	function setUserLobbyMessage(newUserLobbyMessage) {
		userLobbyMessage = newUserLobbyMessage;
	}
	
	function getUserLobbyMessage() {
		return userLobbyMessage;
	}
	
	return {
		setUserName : setUserName,
		getUserName: getUserName,
		setUserKey: setUserKey,
		getUserKey: getUserKey,
		setUserLobbyMessage: setUserLobbyMessage,
		getUserLobbyMessage: getUserLobbyMessage
		
	};
})();