GameReviewStateInfo = (function() {
	var reviewCategoryName = null;
	var reviewPromptIndex = null;
	
	function setReviewCategoryName(newReviewCategoryName) {
		reviewCategoryName = newReviewCategoryName;
	}
	
	function getReviewCategoryName() {
		return reviewCategoryName;
	}
	
	function setReviewPromptIndex(newReviewPromptIndex) {
		reviewPromptIndex = newReviewPromptIndex;
	}
	
	function getReviewPromptIndex() {
		return reviewPromptIndex;
	}
	
	function clear() {
		reviewCategoryName = null;
		reviewPromptIndex = null;
	}
	
	return {
		setReviewCategoryName: setReviewCategoryName,
		getReviewCategoryName: getReviewCategoryName,
		setReviewPromptIndex: setReviewPromptIndex,
		getReviewPromptIndex: getReviewPromptIndex,
		clear: clear
	}
})();