function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            userName = user.displayName;

            document.getElementById("name-goes-here").innerText = userName;
        } else {
            // No user is signed in.
        }
    });
}
getNameFromAuth(); 