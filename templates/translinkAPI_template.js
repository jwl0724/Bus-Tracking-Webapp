fetchCommand = `https://api.translink.ca/rttiapi/v1/routes/99?apikey=${TRANSLINK_API_KEY}`;

function getData(response) {
    console.log(response);
}

function setup() {
    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: fetchCommand,
        dataType: 'json',
        success: getData,
    })
}