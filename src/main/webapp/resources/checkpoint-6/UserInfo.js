UserInfo = (function() {
	var userName = null;
	var userKey = null;
	var userEmail = null;
	var userEmailLowercase = null;
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
	
	function setUserEmail(newUserEmail) {
		userEmail = newUserEmail;
	}
	
	function getUserEmail() {
		return userEmail;
	}
	
	function setUserEmailLowercase(newUserEmailLowercase) {
		userEmailLowercase = newUserEmailLowercase;
	}
	
	function getUserEmailLowercase() {
		return userEmailLowercase;
	}
	
	function setUserLobbyMessage(newUserLobbyMessage) {
		userLobbyMessage = newUserLobbyMessage;
	}
	
	function getUserLobbyMessage() {
		return userLobbyMessage;
	}
	
	function clear() {
		userName = null;
		userKey = null;
		userEmail = null;
		userEmailLowercase = null;
		userLobbyMessage = null;
	}
	
	return {
		setUserName : setUserName,
		getUserName: getUserName,
		setUserKey: setUserKey,
		getUserKey: getUserKey,
		setUserEmail: setUserEmail,
		getUserEmail: getUserEmail,
		setUserEmailLowercase: setUserEmailLowercase,
		getUserEmailLowercase: getUserEmailLowercase,
		setUserLobbyMessage: setUserLobbyMessage,
		getUserLobbyMessage: getUserLobbyMessage,
		clear: clear
	};
})();