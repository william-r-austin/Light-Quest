ChatManager = (function() {
	function parsePixels(stringValue) {
		return parseInt(stringValue);
	}
	
	function setChatMode(newChatMode) {
		if(newChatMode == "no-chat") {
			$("#outerChatContainer").css("width", "0");
			$("#contentContainer").css("width", "100%");
			$("#outerChatContainer").hide();
			$("#smallChatContainerDiv").hide();
		}
		else if(newChatMode == "min-chat") {
			
		}
		else if(newChatMode == "small-chat") {
			$("#outerChatContainer").css("width", "35%");
			$("#contentContainer").css("width", "65%");
			$("#outerChatContainer").show();
			
			var headerSize = parsePixels($("#headerContent").css("height"));
			var margin = 16;
			var windowHeight = window.innerHeight;
			
			var width = parsePixels($("#outerChatContainer").css("width"));
			
			var topVal = headerSize + margin;
			var heightVal = windowHeight - headerSize - margin - margin;
			
			$("#smallChatContainerDiv").css("top", "" + topVal + "px");
			$("#smallChatContainerDiv").css("left", "0");
			$("#smallChatContainerDiv").css("width", $("#outerChatContainer").css("width"));
			$("#smallChatContainerDiv").css("height", "" + heightVal + "px");
			$("#smallChatContainerDiv").show();
		}
	}
	
	return {
		setChatMode: setChatMode
	};
})();
