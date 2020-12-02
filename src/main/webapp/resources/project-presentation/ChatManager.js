ChatManager = (function() {
	var chatMode = "no-chat";
	
	function parsePixels(stringValue) {
		return parseInt(stringValue);
	}
	
	function setChatModeClassOnBody(newChatMode) {
		$("body")
			.removeClass("no-chat")
			.removeClass("small-chat")
			.removeClass("min-chat")
			.removeClass("full-chat")
			.addClass(newChatMode);
	}
		
	function setChatMode(newChatMode) {
		if(newChatMode != chatMode) {
			chatMode = newChatMode;
			setChatModeClassOnBody(chatMode);
			refreshChatWidget();
		}
	}
	
	function getChatMode() {
		return chatMode;
	}
	
	function refreshChatWidget() {
		if(chatMode == "no-chat") {
			$("#smallChatContainerDiv").css("position", "fixed");
			$("#smallChatContainerDiv").css("width", "0");
			$("#smallChatContainerDiv").hide();
			
			$("#outerChatContainer").css("width", "0");
			$("#outerChatContainer").hide();
			
			$("#contentContainer").css("width", "100%");
			$("#contentContainer").show();
		}
		else if(chatMode == "min-chat") {
			$("#smallChatContainerDiv").css("position", "fixed");
			$("#smallChatContainerDiv").css("width", "0");
			$("#smallChatContainerDiv").hide();
			
			$("#outerChatContainer").css("width", "0");
			$("#outerChatContainer").hide();
			
			$("#contentContainer").css("width", "100%");
			$("#contentContainer").show();
		}
		else if(chatMode == "small-chat") {
			$("#smallChatContainerDiv").css("width", "0");
			
			$("#outerChatContainer").css("width", "35%");
			$("#contentContainer").css("width", "65%");
			$("#outerChatContainer").show();
			$("#contentContainer").show();
			
			var headerSize = parsePixels($("#headerContent").css("height"));
			var margin = 16;
			var windowHeight = window.innerHeight;
			
			var width = parsePixels($("#outerChatContainer").css("width"));
			
			var topVal = headerSize + margin;
			var heightVal = windowHeight - headerSize - margin - margin;
			
			$("#smallChatContainerDiv").css("margin", "0");
			$("#smallChatContainerDiv").css("position", "fixed");
			
			$("#smallChatContainerDiv").css("top", "" + topVal + "px");
			$("#smallChatContainerDiv").css("left", "0");
			$("#smallChatContainerDiv").css("width", $("#outerChatContainer").css("width"));
			$("#smallChatContainerDiv").css("height", "" + heightVal + "px");
			$("#smallChatContainerDiv").show();
		}
		else if(chatMode =="full-chat") {
			$("#outerChatContainer").css("width", "100%");
			$("#contentContainer").css("width", "0");
			$("#outerChatContainer").show();
			$("#contentContainer").hide();
			
			var headerSize = parsePixels($("#headerContent").css("height"));
			var margin = 16;
			var windowHeight = window.innerHeight;
			
			var width = parsePixels($("#outerChatContainer").css("width"));
			
			var topVal = headerSize + margin;
			var heightVal = windowHeight - headerSize - margin - margin;
			
			$("#smallChatContainerDiv").css("margin", "1em auto");
			$("#smallChatContainerDiv").css("position", "static");
			//$("#smallChatContainerDiv").css("margin-top", "1em");
			
			
			$("#smallChatContainerDiv").css("top", "auto");
			$("#smallChatContainerDiv").css("left", "auto");
			$("#smallChatContainerDiv").css("width", "90%");
			$("#smallChatContainerDiv").css("height", "" + heightVal + "px");
			$("#smallChatContainerDiv").show();
		}
	}
	
	return {
		setChatMode: setChatMode,
		getChatMode: getChatMode,
		refreshChatWidget: refreshChatWidget
		
	};
})();
