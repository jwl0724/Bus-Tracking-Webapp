let currentUser;

// displayName, email, phoneNumber, photoURL

function loadInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection('users').doc(user.uid)
            currentUser.get().then(userInfo => {
                let username = userInfo.data().username;
                let realName = userInfo.data().name;
                let city = userInfo.data().city;
                let phoneNumber = userInfo.data().phoneNumber;

                if (username != null) {
                    document.getElementById('username').value = username;
                }
                if (realName != null) {
                    document.getElementById('name').value = realName;
                }
                if (city != null) {
                    document.getElementById('city').value = city;
                }
                if (phoneNumber != null) {
                    document.getElementById('phoneNumber').value = phoneNumber;
                }
            })
        } else {
            console.log('Error not logged in.')
        }
    })
}

loadInfo();

function editInfo() {
    document.getElementById('profileData').disabled = false;
}

function pushInfo() {
    // process profile picture
    firebase.auth().onAuthStateChanged(user => {
        let storageRef = storage.ref('images/' + user.uid + '.jpg');

        let imgFile = document.getElementById('profilePictureFile').files[0];
        let hasPicture = false;

        if (imgFile) hasPicture = true

        // process for when user puts a img file in field
        if (hasPicture) {

            // put file to cloud
            storageRef.put(imgFile).then(() => {
                console.log('Uploaded to cloud');

                // get url from cloud
                storageRef.getDownloadURL().then(url => {

                    document.getElementById('profileData').disabled = true;
                    let username = document.getElementById('username').value;
                    let realName = document.getElementById('name').value;
                    let city = document.getElementById('city').value;
                    let phoneNumber = document.getElementById('phoneNumber').value;
                    let profilePicture = url;

                    currentUser.update({
                        name: realName,
                        city: city,
                        profilePicture: profilePicture,
                        username: username,
                        phoneNumber: phoneNumber
                    }).then(() => {
                        user.updateProfile({
                            displayName: realName,
                            photoURL: profilePicture,
                            phoneNumber: phoneNumber,
                        })

                        console.log('Document updated')
                    })
                })
            })
        } else {

            // process for when user does not put img file in field
            document.getElementById('profileData').disabled = true;
            let username = document.getElementById('username').value;
            let realName = document.getElementById('name').value;
            let city = document.getElementById('city').value;
            let phoneNumber = document.getElementById('phoneNumber').value;

            currentUser.update({
                name: realName,
                city: city,
                username: username,
                phoneNumber: phoneNumber
            }).then(() => {
                user.updateProfile({
                    displayName: realName,
                    phoneNumber: phoneNumber,
                })
            })
            console.log('Document updated')
        }
    })
}

document.getElementById('profilePictureFile').addEventListener('input', () => {
    let img = document.getElementById('profilePictureFile').files[0];
    let fr = new FileReader();
    fr.onload = function () {
        document.getElementById('profile-picture').src = fr.result;
    }
    fr.readAsDataURL(img);
})