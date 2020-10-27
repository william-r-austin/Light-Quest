function createApp() {
	// Your web app's Firebase configuration
	// For Firebase JS SDK v7.20.0 and later, measurementId is optional
	var firebaseConfig = {
		// Firebase Config omitted for GitHub

	};
    
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	firebase.analytics();
  
	return {
		getDatabase: function() {
			return firebase.database();
		}
	}
}

App = createApp();