RoomInfo = (function() {
	var roomCode = null;
	var roomKey = null;
	var roomOwnerKey = null;
	var roomOwnerName = null;
	var roomSetupState = null;
	var roomGameType = null;
	
	function setRoomCode(newRoomCode) {
		roomCode = newRoomCode;
	}
	
	function getRoomCode() {
		return roomCode;
	}
	
	function setRoomKey(newRoomKey) {
		roomKey = newRoomKey;
	}
	
	function getRoomKey() {
		return roomKey;
	}
	
	function setRoomOwnerKey(newRoomOwnerKey) {
		roomOwnerKey = newRoomOwnerKey;
	}
	
	function getRoomOwnerKey() {
		return roomOwnerKey;
	}
	
	function setRoomOwnerName(newRoomOwnerName) {
		roomOwnerName = newRoomOwnerName;
	}
	
	function getRoomOwnerName() {
		return roomOwnerName;
	}
	
	function setRoomSetupState(newRoomSetupState) {
		roomSetupState = newRoomSetupState; 
	}
	
	function getRoomSetupState() {
		return roomSetupState;
	}
	
	function setRoomGameType(newRoomGameType) {
		roomGameType = newRoomGameType;
	}
	
	function getRoomGameType() {
		return roomGameType;
	}
	
	function clear() {
		roomCode = null;
		roomKey = null;
		roomOwnerKey = null;
		roomOwnerName = null;
		roomSetupState = null;
		roomGameType = null;
	}
	
	return {
		setRoomCode: setRoomCode,
		getRoomCode: getRoomCode,
		setRoomKey: setRoomKey,
		getRoomKey: getRoomKey,
		setRoomOwnerKey: setRoomOwnerKey,
		getRoomOwnerKey: getRoomOwnerKey,
		setRoomOwnerName: setRoomOwnerName,
		getRoomOwnerName: getRoomOwnerName,
		setRoomSetupState: setRoomSetupState,
		getRoomSetupState: getRoomSetupState,
		setRoomGameType: setRoomGameType,
		getRoomGameType: getRoomGameType,
		clear: clear
	};
})();