let currentUser;

function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            displayRouteInfo(user);
        } else {
            console.log("No user is signed in.")
        }
    });
}
getNameFromAuth();


function displayRouteInfo(user) {
    let params = new URL(window.location.href); //get URL of search bar
    let ID = params.searchParams.get("docID"); //get value for key "docID"
    console.log(ID);

    db.collection("routes")
        .doc(ID)
        .get()
        .then(doc => {
            thisRoute = doc.data();
            routeCode = thisRoute.code;
            routeName = doc.data().name;

            // only populate title, and image
            document.getElementById("routeName").innerHTML = routeName;
            let imgEvent = document.querySelector(".route-img");
            imgEvent.src = "https://upload.wikimedia.org/wikipedia/commons/e/ef/CMBC-B18007.jpg";
        });

    // Set data-docID attribute to ID (route number) for favorite icon element
    let favoriteIcon = document.getElementById("favorite");
    favoriteIcon.setAttribute("data-docID", ID);

    // Check if user is authenticated
    if (currentUser) {
        currentUser.get()
            .then(userDoc => {
                // Get favorited array from user document
                let favorited = userDoc.data().favorited;
                console.log(favorited)

                // Update heart icon appearance based on whether route is in user favorited array
                if (favorited.includes(ID)) {
                    favoriteIcon.innerHTML = '<i class="material-icons heart-icon">favorite</i>';;
                } else {
                    favoriteIcon.innerHTML = '<i class="material-icons heart-icon">favorite_border</i>';
                }
                // Set function when favorite icon is clicked
                favoriteIcon.onclick = function () {
                    updateFavorite(ID);
                };
            });
    }
}

displayRouteInfo();

// Function to save route document ID to local storage and redirect to review form page
function saveRouteDocumentIDAndRedirect() {
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID"); // get value for key "docID"
    localStorage.setItem('routeDocID', ID); 
    window.location.href = 'review.html';
}

function populateReviews() {
    // console.log("test");
    let routeCardTemplate = document.getElementById("reviewCardTemplate");
    let routeCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href); // get the url from the search bar
    let routeID = params.searchParams.get("docID"); // get value for key "docID"

    db.collection("reviews")
        .where("routeDocID", "==", routeID) // routeID is the route number
        .get()
        .then((allReviews) => {
            // Get the review documents that match route number
            reviews = allReviews.docs;
            console.log(reviews);
            // Loop through each review document and populate the review info
            reviews.forEach((doc) => {
                var title = doc.data().title;
                var ontime = doc.data().ontime;
                var crowding = doc.data().crowding;
                var safety = doc.data().safety;
                var description = doc.data().description;
                var reliable = doc.data().reliable;
                var time = doc.data().timestamp.toDate();
                var rating = doc.data().rating; // Get the rating value

                console.log(rating)
                console.log(time);

                // Clone review card template
                let reviewCard = routeCardTemplate.content.cloneNode(true);

                // Populate cloned review card with review info
                reviewCard.querySelector(".title").innerHTML = title;
                reviewCard.querySelector(".time").innerHTML = new Date(time ).toLocaleString();
                reviewCard.querySelector(".ontime").innerHTML = `On-time: ${ontime}`;
                reviewCard.querySelector(".crowding").innerHTML = `Crowding: ${crowding}`;
                reviewCard.querySelector(".safety").innerHTML = `Safety: ${safety}`;
                reviewCard.querySelector(".reliable").innerHTML = `Reliable: ${reliable}`;
                reviewCard.querySelector(".description").innerHTML = `Description: ${description}`;

                // Populate the star rating based on the rating value
                // Initialize an empty string to store the star rating HTML
                let starRating = "";
                // Append full star icon based on rating
                for (let i = 0; i < rating; i++) {
                    starRating += '<span class="material-icons">star</span>';
                }
                // Append outlined star icon based on rating
                for (let i = rating; i < 5; i++) {
                    starRating += '<span class="material-icons">star_outline</span>';
                }

                // Display star rating 
                reviewCard.querySelector(".star-rating").innerHTML = starRating;

                // Append populated review card to container
                routeCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();


// Function called when user clicks the "favorite" icon
function updateFavorite(routeDocID) {
    // Get user data on favorited routes
    currentUser.get().then(userDoc => {
        let favorited = userDoc.data().favorited;
        let iconID = 'favorite';
        let iconElement = document.getElementById(iconID)
        // Handle type error when 'favorited' in firestore is 'null'
        // && operator used to check if 'favorited' is not 'null' and if 'favorited.includes' is an array or string
        // if both conditions true, 'isFavorited' is assigned the result of 'favorited.includes(routeDocID)'
        let isFavorited = favorited && favorited.includes && favorited.includes(routeDocID);    // routeDocID is route number

        if (isFavorited) {
            // Remove favorited routeDocID from database
            currentUser.update({
                favorited: firebase.firestore.FieldValue.arrayRemove(routeDocID)
            }).then(() => {
                // Update icon appearance after clicking to unfavorite
                document.getElementById(iconID).innerHTML = '<i class="material-icons heart-icon">favorite_border</i>';
            });
        } else {
            // Add favorited routeDocID to database
            currentUser.update({
                favorited: firebase.firestore.FieldValue.arrayUnion(routeDocID)
            }).then(() => {
                // Update icon appearance after clicking to favorite
                document.getElementById(iconID).innerHTML = '<i class="material-icons heart-icon">favorite</i>';
            });
        }
    });
}