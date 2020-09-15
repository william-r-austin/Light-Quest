GameVotingInfo = (function(){
	var votingResults = null;
	var gameUserKeys = null;
	var initialized = false;
	
	function setVotingResults(newVotingResults, newGameUserKeys) {
		votingResults = newVotingResults;
		gameUserKeys = newGameUserKeys;
		initialized = true;
	}
	
	function getVotingResultsForPrompt(promptKey) {
		var results = {};
				
		// Set the initial results to empty
		for(var i = 0; i < gameUserKeys.length; i++) {
			var userKey = gameUserKeys[i];
			results[userKey] = [];
		}
		
		// Tally the votes
		var fullVotingResultsForPrompt = votingResults[promptKey];
		var votingResultsForPrompt = fullVotingResultsForPrompt.user;
		
		for(const [voteKey, voteValue] of Object.entries(votingResultsForPrompt)) {
			var votedForArray = results[voteValue]; 
			if(votedForArray !== undefined) {
				votedForArray.push(voteKey);
			}
			else {
				console.log("We have a problem. User voted for invalid user key. Value was: " + voteValue);
			}
		}
		
		return results;
	}
	
	function getVotingResultsForFullGame() {
		var results = {};
				
		// Set the initial results to empty
		for(var i = 0; i < gameUserKeys.length; i++) {
			var userKey = gameUserKeys[i];
			results[userKey] = 0;
		}
		
		var promptsArray = Object.keys(votingResults);
		
		for(var i = 0; i < promptsArray.length; i++) {
			var promptKey = promptsArray[i];
			var promptResults = getVotingResultsForPrompt(promptKey);
			
			for(var j = 0; j < gameUserKeys.length; j++) {
				var userKey = gameUserKeys[j];
				var votesArray = promptResults[userKey];
				if(votesArray !== undefined) {
					var currentScore = results[userKey]; 
					results[userKey] = currentScore + votesArray.length;
				}
				else {
					console.log("We have a problem. User voted for invalid user key. Value was: " + voteValue);
				}
			}
		}
		
		return results;
	}
	
	function isInitialized() {
		return initialized;
	}
	
	function clear() {
		votingResults = null;
		gameUserKeys = null;
		initialized = false;
	}
	
	return {
		setVotingResults: setVotingResults,
		getVotingResultsForPrompt: getVotingResultsForPrompt,
		getVotingResultsForFullGame: getVotingResultsForFullGame,
		isInitialized: isInitialized,
		clear: clear
	};
	
})();