GameStateInfo = (function() {
	var gameState = {};
	
	function setGameState(newGameState) {
		gameState = newGameState;
	}
	
	function getGameState() {
		return gameState;
	}
	
	function clear() {
		gameState = {};
	}
	
	return {
		setGameState: setGameState,
		getGameState: getGameState,
		clear: clear
	};
})();