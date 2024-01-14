mapboxgl.accessToken = MAPBOX_API_KEY;
var trackingBus = false;
var routeSelected;

var displayMap = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-122.80, 49.25],
    zoom: 13
});

displayMap.addControl(new mapboxgl.NavigationControl());

const size = 1000;

const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d', {willReadFrequently: true});
    },

    // Call once before every frame where the icon will be used.
    render: function () {
        const duration = 600;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = `rgba(94, 111, 255, ${1 - t})`;
        context.fill();

        // Draw the inner circle.
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(60, 187, 255, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // Update this image's data with data from the canvas.
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        displayMap.triggerRepaint();

        // Return `true` to let the map know that the image was updated.
        return true;
    }
};

displayMap.on('load', async () => {
    const userGeoJson = await getUserLocation();

    displayMap.addSource('user', {
        type: 'geojson',
        data: userGeoJson
    });

    displayMap.addImage('pulsing-dot', pulsingDot, {pixelRatio: 2});

    displayMap.addLayer({
        'id': 'user',
        'type': 'symbol',
        'source': 'user',
        'layout': {
            'icon-image': 'pulsing-dot',
            'icon-size': 0.1,
            'icon-allow-overlap': true
        },
        'paint': {
            'icon-color': '#FFFFFF',
            'icon-halo-color': '#cfc',
            'icon-halo-width': 2
        }
    })

    // center map to user
    displayMap.flyTo({
        center: userGeoJson.geometry.coordinates,
        speed: 2,
        zoom: 15
    })

});

// update user location every 2s
setInterval(async () => {
    const geojson = await getUserLocation(displayMap);

    displayMap.getSource('user').setData(geojson);
}, 5000);


// get user location
async function getUserLocation() {

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = [position.coords.longitude, position.coords.latitude];
            if (userLocation) {
                userGeoJson = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': userLocation
                    },
                    'properties': {
                        'name': 'You Are Here'
                    }
                }
                resolve(userGeoJson);
            }
        });
    });
}

// tracks bus live, updates at 20s intervals
setInterval(async () => {
    if (trackingBus) {
        const busCollection = await getBuses(routeSelected);
        const geojsonSource = displayMap.getSource('buses');

        geojsonSource.setData({
            'type': 'FeatureCollection',
            'features': busCollection
        })
    }
}, 30000);

function time_difference(comparisonTime) {

    const time = new Date();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    
    hourDiff = hour - parseInt(comparisonTime.slice(0, 2));
    minuteDiff = minute - parseInt(comparisonTime.slice(3, 5));
    secondDiff = second - parseInt(comparisonTime.slice(6, 8));

    printableDifference = hourDiff > 1 && hourDiff < 12 ? `${hourDiff} hours` : hourDiff == 1 ? `${hourDiff} hour` :
        minuteDiff > 1 ? `${minuteDiff} minutes` : minuteDiff == 1 ? `${minuteDiff} minute` :
            secondDiff > 1 ? `${secondDiff} seconds` : `${secondDiff} second`

    return printableDifference
}

async function getBuses(route) {
    command = `https://api.translink.ca/rttiapi/v1/buses?apikey=${TRANSLINK_API_KEY}&routeNo=${route}`;

    return new Promise((resolve) => {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: command,
            dataType: 'json',
            error: function (error) { resolve(null) },
            success: function (array) {

                let features = [];

                for (let i = 0; i < array.length; i++) {
                    features.push({
                        'type': 'Feature',
                        'properties': {
                            'description':
                                `
                            <strong> ${parseInt(array[i].RouteNo)} </strong>
                            <p> Terminus Stop: ${array[i].Destination} </p>
                            <p> Direction: ${array[i].Direction} </p>
                            <a href="eachRoute.html?docID=${array[i].RouteNo}" target="_top"> View Page </a></br>
                            <sub>Bus ${array[i].VehicleNo}</sub></br>
                            <sub>Last updated ${time_difference(array[i].RecordedTime)} ago</sub>
                            `
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [array[i].Longitude, array[i].Latitude]
                        }
                    });
                };
                resolve(features);
            }
        })
    })
}

// draw buses
window.addEventListener('message', async event => {
    routeSelected = event.data;

    const busFeatures = await getBuses(routeSelected);
    if (!busFeatures) {
        window.parent.postMessage('404');
        return
    }

    if (trackingBus) {
        const geojsonSource = displayMap.getSource('buses');
        geojsonSource.setData({
            'type': 'FeatureCollection',
            'features': busFeatures
        })
    }

    displayMap.loadImage('https://cdn.iconscout.com/icon/free/png-512/free-bus-direction-travel-public-trasportation-30449.png?f=webp&w=256', (error, image) => {
        if (error) throw error;
        displayMap.addImage(`busIcon`, image);
    })

    displayMap.addSource('buses', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': busFeatures
        }
    });

    displayMap.addLayer({
        'id': 'buses',
        'type': 'symbol',
        'source': 'buses',
        'layout': {
            'icon-image': 'busIcon',
            'icon-size': 0.1,
            'icon-allow-overlap': true
        }
    });

    let sortedLongitude = busFeatures.sort((a, b) => { return b.geometry.coordinates[0] - a.geometry.coordinates[0] });
    let sortedLatitude = busFeatures.sort((a, b) => { return b.geometry.coordinates[1] - a.geometry.coordinates[1] });
    let longitudeCenter = (sortedLongitude[0].geometry.coordinates[0] + sortedLongitude[sortedLongitude.length - 1].geometry.coordinates[0]) / 2;
    let latitudeCenter = (sortedLatitude[0].geometry.coordinates[1] + sortedLatitude[sortedLatitude.length - 1].geometry.coordinates[1]) / 2;

    let mapCenter = [longitudeCenter, latitudeCenter];
    console.log(mapCenter);
    displayMap.flyTo({
        center: mapCenter,
        speed: 2,
        zoom: 10
    })

    trackingBus = true;
})

displayMap.on('click', 'buses', (event) => {
    const coordinates = event.features[0].geometry.coordinates.slice();
    const description = event.features[0].properties.description;

    while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += event.lngLate.lng > coordinates[0] ? 360 : -360
    }
    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(displayMap);
})

