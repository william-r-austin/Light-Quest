GameResponsesInfo = (function(){
	var gameResponses = {};
	
	function setGameResponseForPrompt(promptKey, responseMap) {
		gameResponses[promptKey] = responseMap;
	}
	
	function getGameResponseForPrompt(promptKey) {
		return gameResponses[promptKey];
	}
	
	function getGameResponseForPromptAndUser(promptKey, userKey) {
		var temp = getGameResponseForPrompt(promptKey);
		return temp[userKey];
	}
	
	function clear() {
		gameResponses = {};
	}
	
	return {
		setGameResponseForPrompt: setGameResponseForPrompt,
		getGameResponseForPrompt: getGameResponseForPrompt,
		getGameResponseForPromptAndUser: getGameResponseForPromptAndUser,
		clear: clear
	};
	
})();