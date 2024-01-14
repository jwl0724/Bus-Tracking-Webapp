let availableKeywords = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10", "14", "15", "16", "17", "19", "20", "22", "23", "25", "26", "27",
    "28", "29", "31", "33", "41", "49", "50", "68", "84", "99", "100", "101", "102", "103", "104", "105", "106", "109",
    "110", "112", "116", "119", "123", "128", "129", "130", "131", "132", "133", "134", "136", "144", "145", "146", "147",
    "148", "151", "152", "153", "155", "156", "157", "159", "160", "169", "170", "171", "172", "173", "174", "180", "181",
    "182", "183", "184", "185", "186", "187", "188", "189", "191", "209", "210", "211", "212", "214", "215", "227", "228",
    "229", "230", "232", "236", "240", "245", "246", "249", "250", "251", "252", "253", "254", "255", "256", "257", "262",
    "280", "281", "282", "301", "310", "312", "314", "316", "319", "320", "321", "322", "323", "324", "325", "326", "335",
    "337", "340", "341", "342", "350", "351", "360", "361", "362", "363", "364", "370", "371", "372", "373", "375", "401",
    "402", "403", "404", "405", "406", "407", "408", "410", "413", "430", "501", "502", "503", "531", "555", "560", "562",
    "563", "564", "595", "601", "609", "614", "616", "618", "619", "620", "640", "701", "733", "741", "743", "745", "746",
    "748", "749", "791", "R1", "R2", "R3", "R4", "R5"
];

//Result box displays search results
const resultsBox = document.querySelector(".result-box");

const inputBox = document.getElementById("search-box-input");

async function getFavorites() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = await db.collection('users').doc(user.uid);
                userInfo = await currentUser.get();
                favoritedRoutes = userInfo.data().favorited;
                for (let i = 0; i < favoritedRoutes.length; i++) {
                    favoritedRoutes[i] = parseInt(favoritedRoutes[i]);
                }
                resolve(favoritedRoutes);
            }
        })
    })
}


inputBox.onfocus = async function() {
    favorited = await getFavorites();
    display(favorited);
}

// When user types input
inputBox.onkeyup = async function(){
    let result = [];     // store filtered keywords
    let input = inputBox.value;    //store input value
    if(input.length){  // if input has some value
        //filter keywords to find input match
        result = availableKeywords.filter((keyword) => {  
            return keyword.toLowerCase().includes(input.toLowerCase()); 
        });
        result.splice(5, 182);    
    } 
    display(result);
    let favorited = await getFavorites()
    
    if(!result.length && !favorited.length){  // if no value in result box
        resultsBox.innerHTML = '';      // remove horizontal line
    } else if (!result.length){
        display(favorited);
    }
}

//Take filtered results and generate a list of matching keywords and update results box
function display(result){
    const content = result.map((list) => {
        return `<li onclick=selectInput(this)>${list}</li>`;
    });

    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

//Put bus number user clicked on into the input field
function selectInput(list){
    inputBox.value = list.innerHTML;
    routeSelected = inputBox.value;
    resultsBox.innerHTML = '';
    
    if (routeSelected[0] !== 'R') routeSelected = routeSelected.padStart(3, '0');

    // get kmz route map
    routeDB = db.collection('routes').doc(routeSelected);
    routeDB.get().then(response => {
       let routeData = response.data();
       let kmzFiles = [];
       
       for (let i = 0; i < routeData.patterns.length; i++) {
            kmzFiles.push(routeData.patterns[i].RouteMap.Href)
        }
    });

    // send route selected to map iframe
    const iframe = document.querySelector('iframe');
    iframe.contentWindow.postMessage(routeSelected);
}

window.addEventListener('message', () => {
    searchInput = document.getElementById('search-box-input');
    searchInput.value = "Translink is down";
    searchInput.disabled = true;
})