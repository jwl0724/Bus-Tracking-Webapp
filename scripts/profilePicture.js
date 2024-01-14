function loadProfilePicture() {
    firebase.auth().onAuthStateChanged(user => {
        if(user){
            if (user.photoURL) {
                document.getElementById('profile-picture').src = user.photoURL;
            } else {
                document.getElementById('profile-picture').src = './images/blankprofile.webp';
            }
        } else {
            console.log('Error, something went wrong.')
        }
        
    })
}

loadProfilePicture();