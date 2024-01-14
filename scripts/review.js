var routeDocID = localStorage.getItem("routeDocID");    //visible to all functions on this page

function getRouteName(id) {
    db.collection("routes")
        .doc(id)
        .get()
        .then((thisRoute) => {
            var routeName = thisRoute.data().name;
            document.getElementById("routeName").innerHTML = routeName;
        });
}

getRouteName(routeDocID);

// Add this JavaScript code to make stars clickable

// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll('.star');

// Iterate through each star element
stars.forEach((star, index) => {
    // Add a click event listener to the current star
    star.addEventListener('click', () => {
        // Fill in clicked star and stars before it
        for (let i = 0; i <= index; i++) {
            // Change the text content of stars to 'star' (filled)
            document.getElementById(`star${i + 1}`).textContent = 'star';
        }
        // Unfill the stars after the clicked star
        for (let i = index + 1; i < stars.length; i++) {
            // Change the text content of stars to 'star_outline' (unfilled)
            document.getElementById(`star${i + 1}`).textContent = 'star_outline';
        }
    });
});

function writeReview() {
    console.log("inside write review");
    let routeTitle = document.getElementById("title").value;
    let routeTime = document.getElementById("on-time").value;
    let routeCrowding = document.getElementById("crowding").value;
    let routeSafety = document.getElementById("safety").value;
    let routeDescription = document.getElementById("description").value;
    let routeReliable = document.querySelector('input[name="reliable"]:checked').value;

    // Get the star rating
    // Get all the elements with the class "star" and store them in the 'stars' variable
    const stars = document.querySelectorAll('.star');
    // Initialize a variable 'hikeRating' to keep track of the rating count
    let routeRating = 0;
    // Iterate through each element in the 'stars' NodeList using the forEach method
    stars.forEach((star) => {
        // Check if the text content of the current 'star' element is equal to the string 'star'
        if (star.textContent === 'star') {
            // If the condition is met, increment the 'hikeRating' by 1
            routeRating++;
        }
    });

    console.log(routeTitle, routeTime, routeCrowding, routeSafety, routeReliable, routeRating);

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("reviews").add({
            routeDocID: routeDocID,
            userID: userID,
            title: routeTitle,
            ontime: routeTime,
            crowding: routeCrowding,
            safety: routeSafety,
            description: routeDescription,
            reliable: routeReliable,
            rating: routeRating, // Include the rating in the review
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.location.href = "thanks.html"; // Redirect to the thanks page
        });
    } else {
        console.log("No user is signed in");
        window.location.href = 'review.html';
    }
}