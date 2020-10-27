RoomInfo = (function() {
	var roomCode = null;
	var roomKey = null;
	var roomOwnerKey = null;
	var roomOwnerName = null;
	var roomSetupState = null;
	
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
	
	function clear() {
		roomCode = null;
		roomKey = null;
		roomOwnerKey = null;
		roomOwnerName = null;
		roomSetupState = null;
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
		clear: clear
	};
})();