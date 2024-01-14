async function writeNewUser(authResult) {
    if (authResult) {
        let user = authResult.user;
        let userData = db.collection('users').doc(user.uid);
        await userData.set({
            name: user.displayName,
            city: null,
            username: user.email,
            profilePicture: user.photoURL,
            timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
            favorited: null,
            email: user.email,
            phoneNumber: user.phoneNumber
        })
    } else {
        console.log('Error, something went wrong.')
    }
    window.location.replace('main.html');
}