Constants = (function() {
	
	const maxNameLength = 30;
	const maxEmailLength = 50;
	
	function getMaxNameLength() {
		return maxNameLength;
	}
	
	function getMaxEmailLength() {
		return maxEmailLength;
	}
	
	return {
		getMaxNameLength: getMaxNameLength,
		getMaxEmailLength: getMaxEmailLength
	}
})();