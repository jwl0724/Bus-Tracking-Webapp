//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
    }).catch((error) => {
        // An error happened.
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (!document.URL.includes('index.html')) {
        firebase.auth().onAuthStateChanged(user => {if (!user) window.location.replace('../index.html')});
    } else {
        if (firebase.auth().onAuthStateChanged(user =>{
            if (user) {
                logout();
                location.reload();
            };
        }));
    };
});