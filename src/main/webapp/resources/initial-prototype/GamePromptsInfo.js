GamePromptsInfo = (function() {
	var gamePromptsList = [];
	var gamePromptsMap = {};
	
	function setGamePromptsList(newGamePromptsList) {
		gamePromptsList = newGamePromptsList;
		
		newGamePromptsMap = {};
		for(var i = 0; i < gamePromptsList.length; i++) {
			var gamePrompt = gamePromptsList[i];
			newGamePromptsMap[gamePrompt.promptKey] = gamePrompt.promptText;
		}
		
		gamePromptsMap = newGamePromptsMap;
	}
	
	function getGamePromptsList() {
		return gamePromptsList;
	}
	
	function getGamePromptsMap() {
		return gamePromptsMap;
	}
	
	function clear() {
		gamePromptsList = [];
		gamePromptsMap = {};
	}
	
	return {
		setGamePromptsList: setGamePromptsList,
		getGamePromptsList: getGamePromptsList,
		getGamePromptsMap: getGamePromptsMap,
		clear: clear
	};
})();
