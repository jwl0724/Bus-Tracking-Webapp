// routesTemplate = `https://api.translink.ca/rttiapi/v1/routes/${i}?apikey=${TRANSLINK_API_KEY}`;
// busesTemplate = `https://api.translink.ca/rttiapi/v1/buses?apikey=${TRANSLINK_API_KEY}&routeNo=${i}`;
testFetch = `https://api.translink.ca/rttiapi/v1/buses?apikey=${TRANSLINK_API_KEY}&routeNo=99`;

function processError() {
    console.log('Error, route doesn\'t exist');
}

function getData(httpURL, process) {
    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: httpURL,
        dataType: 'json',
        success: process,
        error: processError
    })
}

function writeAllRoutes(start, end) {
    for (let i = start; i <= end; i++) {
        httpURL = `https://api.translink.ca/rttiapi/v1/routes/${i}?apikey=${TRANSLINK_API_KEY}`;
        getData(httpURL, writeToDatabase);
    }
}

function writeSpecificRoute(route) {
    httpURL = `https://api.translink.ca/rttiapi/v1/routes/${route}?apikey=${TRANSLINK_API_KEY}`;
    getData(httpURL, writeToDatabase);
}

function writeToDatabase(response) {
    dbRoutes = db.collection('routes').doc(response.RouteNo);
    dbRoutes.set({
        name: response.Name,
        operatingCompany: response.OperatingCompany,
        patterns: response.Patterns
    }).then(() => {
        console.log('Route added.');
    })
}

function getAllBuses(route){
    command = `https://api.translink.ca/rttiapi/v1/buses?apikey=${TRANSLINK_API_KEY}&routeNo=${route}`;

    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: command,
        dataType: 'json',
        error: function(error) {console.log('No Buses Active')},
        success: function(response) {
            console.log(response);
        }
    })
}
