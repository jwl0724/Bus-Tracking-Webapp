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

async function getNearbyRoutes() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(position => {
            let long = position.coords.longitude;
            let lat = position.coords.latitude;
            let command = `https://api.translink.ca/rttiapi/v1/stops?apikey=${TRANSLINK_API_KEY}&lat=${lat.toFixed(6)}&long=${long.toFixed(6)}`;

            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: command,
                dataType: 'json',
                error: function (error) { console.error(error) },
                success: function (array) {
                    let nearbyRoutes = []
                    array.forEach(stop => {
                        routes = stop.Routes.split(', ');
                        if (routes) {
                            routes.forEach(route => nearbyRoutes.push(route))
                        };
                    });
                    filteredList = [...new Set(nearbyRoutes)].filter((route) => { if (route) return route; })
                    resolve(filteredList);
                }
            })
        });
    });
}

async function displayRoutes() {
    let cardTemplate = document.getElementById('routeCardTemplate');
    let nearbyRoutes = await getNearbyRoutes();

    for (let i = 0; i <= nearbyRoutes.length; i++) {
        docID = nearbyRoutes[i];
        route = db.collection('routes').doc(docID);
        if (route) {
            route.get().then(doc => {
                if (!doc.data()) return;
                let title = doc.data().name;
                let routeNumber = doc.id
                let subHeader = `Operated By: ${doc.data().operatingCompany}`;
                let description = `Terminus Stop: ${doc.data().patterns[0].Destination}`.replace('/', ' ');
                let picture = `https://upload.wikimedia.org/wikipedia/commons/e/ef/CMBC-B18007.jpg`;
                let docID = doc.id;
                let newCard = cardTemplate.content.cloneNode(true);

                newCard.querySelector('.card-number').innerHTML = `No. ${parseInt(routeNumber)}`;
                newCard.querySelector('.card-title').innerHTML = title;
                newCard.querySelector('.card-length').innerHTML = subHeader;
                newCard.querySelector('.card-text').innerHTML = description;
                newCard.querySelector('.card-image').src = picture;
                newCard.querySelector('a').href = 'eachRoute.html?docID=' + docID;
                newCard.querySelector('i').id = 'save-' + docID
                newCard.querySelector('i').onclick = () => updateFavorite(docID);

                // Ensure favorited routes show correctly when page is refreshed
                currentUser.get().then(userDoc => {
                    let favorited = userDoc.data().favorited;
                    if (favorited.includes(docID)) {
                        document.getElementById('save-' + docID).innerText = 'favorite';
                    } else {
                        document.getElementById('save-' + docID).innerText = 'favorite_border';
                    }
                });

                document.getElementById('routes-go-here').appendChild(newCard);
            })
        }
    }
}

displayRoutes();


// Function called when user clicks the "favorite" icon
function updateFavorite(routeDocID) {
    // Get user data on favorited routes
    currentUser.get().then(userDoc => {
        let favorited = userDoc.data().favorited;
        let iconID = 'save-' + routeDocID;
        // Handle type error when 'favorited' in firestore is 'null'
        // && operator used to check if 'favorited' is not 'null' and if 'favorited.includes' is a function (i.e. is an array or string)
        // if both conditions true, 'isFavorited' is assigned the result of 'favorited.includes(routeDocID)'
        let isFavorited = favorited && favorited.includes && favorited.includes(routeDocID);

        if (isFavorited) {
            // Remove favorited routeDocID from database
            currentUser.update({
                favorited: firebase.firestore.FieldValue.arrayRemove(routeDocID)
            }).then(() => {
                // Update icon appearance after clicking to unfavorite
                document.getElementById(iconID).innerText = 'favorite_border';
            });
        } else {
            // Add favorited routeDocID to database
            currentUser.update({
                favorited: firebase.firestore.FieldValue.arrayUnion(routeDocID)
            }).then(() => {
                // Update icon appearance after clicking to favorite
                document.getElementById(iconID).innerText = 'favorite';
            });
        }
    });
}
