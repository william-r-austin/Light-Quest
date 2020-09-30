UserInfo = (function() {
	var userName = null;
	var userKey = null;
	
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
	
	return {
		setUserName : setUserName,
		getUserName: getUserName,
		setUserKey: setUserKey,
		getUserKey: getUserKey
	};
})();