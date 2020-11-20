Constants = (function() {
	
	const maxNameLength = 40;
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