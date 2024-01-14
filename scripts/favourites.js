// Function for retrieving user info and displaying their favorite routes
function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            userName = user.displayName;

            displayFavorites(user)

            // Update the user's display name in heading
            document.getElementById("name-goes-here").innerText = userName;
        } else {
            console.log("No user is signed in.")
        }
    });
}
getNameFromAuth();


// Function for populating user's favorited route cards
function displayFavorites(user) {
    db.collection("users").doc(user.uid).get()
        .then(userDoc => {

            // Get the array of favorites
            var favorited = userDoc.data().favorited;
            console.log(favorited);

            // Get saved card template from HTML
            let newcardTemplate = document.getElementById("savedCardTemplate");

            // Iterate through the array of favorited routes (route numbers)
            favorited.forEach(thisRouteID => {
                console.log(thisRouteID);
                db.collection("routes").doc(thisRouteID).get().then(doc => {
                    // Retrieve route info
                    let title = doc.data().name;
                    let routeNumber = doc.id
                    let subHeader = "Operated By:" + doc.data().operatingCompany;
                    let description = `Terminus Stop: ${doc.data().patterns[0].Destination}`.replace('/', ' ');
                    let picture = `https://upload.wikimedia.org/wikipedia/commons/e/ef/CMBC-B18007.jpg`;
                    let docID = doc.id;

                    // Clone the new card
                    let newCard = newcardTemplate.content.cloneNode(true);

                    // Populate cloned route card with route info
                    newCard.querySelector('.card-number').innerHTML = routeNumber;
                    newCard.querySelector('.card-title').innerHTML = title;
                    newCard.querySelector('.card-length').innerHTML = subHeader;
                    newCard.querySelector('.card-text').innerHTML = description;
                    newCard.querySelector('.card-image').src = picture;
                    newCard.querySelector('a').href = "eachRoute.html?docID=" + docID;

                    // Update the heart icon id dynamically
                    let heartIcon = newCard.querySelector('.material-icons');
                    heartIcon.id = `favorites-${thisRouteID}`;
                    
                    heartIcon.addEventListener('click', () => {
                        updateFavorite(thisRouteID);
                    });

                    // Append populated route card to container
                    routeCardGroup.appendChild(newCard);
                })
            });
        })
}



// Function called when user clicks the "favorite" icon
function updateFavorite(routeDocID) {
    // Get user data on favorited routes
    currentUser.get().then(userDoc => {
        let favorited = userDoc.data().favorited;
        let iconID = `favorites-${routeDocID}`;    // routeDocID is route number


        // Handle type error when 'favorited' in firestore is 'null'
        // && operator used to check if 'favorited' is not 'null' and if 'favorited.includes' is a function (i.e. is an array or string)
        // if both conditions true, 'isFavorited' is assigned the result of 'favorited.includes(routeDocID)'
        let isFavorited = favorited && favorited.includes && favorited.includes(routeDocID);

        if (isFavorited) {
            // Remove favorited routeDocID from database
            currentUser.update({
                favorited: firebase.firestore.FieldValue.arrayRemove(routeDocID)
            }).then(() => {
                // Find the heart icon by ID and update appearance
                let iconElement = document.getElementById(iconID);
                if (iconElement) {
                    iconElement.innerText = 'favorite_border';
                }
            }).catch(error => {
                console.error("Error removing from favorites:", error)
            });
        }
    });
}
