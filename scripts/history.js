// Function for retrieving user info and displaying their reviews history
function getNameFromAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userName = user.displayName;
            displayHistory(user)

            document.getElementById("name-goes-here").innerText = userName;
        } else {
            console.log("No user is signed in.")
        }
    });
}
getNameFromAuth();

// Function for populating user's review history cards
function displayHistory(user) {
    // Get review card template and container for review cards
    let historyCardTemplate = document.getElementById("reviewCardTemplate");
    let historyCardGroup = document.getElementById("reviewCardGroup");

    db.collection("reviews")
        .where("userID", "==", user.uid)
            .get()
            .then((allReviews) => {
                reviews = allReviews.docs;
                console.log(reviews);
                // Iterate through each review document
                reviews.forEach((doc) => {
                    // Retrieve the review info
                    var route = doc.data().routeDocID;
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

                    // Clone the review card template
                    let reviewCard = historyCardTemplate.content.cloneNode(true);

                    // Populate cloned review card with review info
                    reviewCard.querySelector(".route").innerHTML = route;
                    reviewCard.querySelector(".title").innerHTML = title;
                    reviewCard.querySelector(".time").innerHTML = new Date(
                        time
                    ).toLocaleString();
                    reviewCard.querySelector(".ontime").innerHTML = `Ontime: ${ontime}`;
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
                    historyCardGroup.appendChild(reviewCard);
                });
            });
}

displayHistory();