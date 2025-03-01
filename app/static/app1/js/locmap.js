
        let map, userMarker,infoWindow;
        let userCircle;
        let currentCity = "";

        window.onload = getLocation;

        function getLocation() {
            if (navigator.geolocation) {
                document.getElementById("output").innerHTML = "Fetching location...";
                navigator.geolocation.watchPosition(updateLocation, showError, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            } else {
                document.getElementById("output").innerHTML = "not supported";
            }
        }

        function updateLocation(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userLatLng = {  lat: 11.0016, lng: 76.0027 };

            if (!map) {
                // Initialize map only once
                map = new google.maps.Map(document.getElementById("map"), {
                    center: userLatLng,
                    zoom: 18
                });

                // Add city name fetching and map features
                fetchCityAndShowMap(lat, lng);
                findNearestLocation(userLatLng);
                fetchBusStops()
                fetchAndUpdateBusLocations(map) 
            }

            // If marker doesn't exist, create it
            if (!userMarker) {
                userMarker = new google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,                 // Blue dot size
                        fillColor: "#4285F4",     // Blue fill
                        fillOpacity: 1,          // Solid fill
                        strokeWeight: 1,         // Thin border
                        strokeColor: "#ffffff",  // White border
                    },
                });
                infoWindow = new google.maps.InfoWindow({
                    content: `<div style="font-size: 18px; font-weight: 900; color:red;">You are here</div>`,
                    disableAutoPan: true, // Prevent auto-panning when info window opens
                });

                infoWindow.open(map, userMarker);

                // Create a circle for the marker
                userCircle = new google.maps.Circle({
                    strokeColor: "#4285F4",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#4285F4",
                    fillOpacity: 0.35,
                    map: map,
                    center: userLatLng,
                    radius: 50, // Radius in meters
                });
            } else {
                // Update the marker's position
                userMarker.setPosition(userLatLng);

                // Update the circle's position
                userCircle.setCenter(userLatLng);
            }

            // Center the map to the updated position
            map.setCenter(userLatLng);

            // Display updated coordinates
            // document.getElementById("output").innerHTML = `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`;
        }

        function fetchCityAndShowMap(lat, lng) {
            const geocodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBVHXAjg4mpK11K-Dqjey1OrGNRNXDeP3o`;

            fetch(geocodingAPI)
                .then(response => response.json())
                .then(data => {
                    if (data.status === "OK") {
                        const addressComponents = data.results[0].address_components;
                        const city = addressComponents.find(component =>
                            component.types.includes("locality") || // City
                            component.types.includes("sublocality") ||// Subdivision
                            component.types.includes("administrative_area_level_2")||
                            component.types.includes("administrative_area_level_1")  // County
                        )?.long_name || "City not found";

                         currentCity = city;

                        // Display city name
                        document.getElementById("output").innerHTML = city;
                    } else {
                        document.getElementById("output").innerHTML = `Unable.`;
                    }
                })
                .catch(error => {
                    document.getElementById("output").innerHTML = "Error fetching";
                    console.error("Fetch error:", error);
                });
        }

         // JavaScript function to set values in the "From" and "To" input fields
         function fillInputValues() {
            if (currentCity){
            console.log(`value${currentCity}`)
            // Set the value of the "From" input
            document.getElementById('from').value = currentCity;
            }
            else{
            console.log("city not available")
            }
           
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    document.getElementById("output").innerHTML = "User denied";
                    break;
                case error.POSITION_UNAVAILABLE:
                    document.getElementById("output").innerHTML = "unavailable.";
                    break;
                case error.TIMEOUT:
                    document.getElementById("output").innerHTML = "timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    document.getElementById("output").innerHTML = "unknown error";
                    break;
            }
        }
  


        // ------------------------advertisments--------------------
            async function findNearestLocation(userLatLng) {
                try {
                    // Fetch locations dynamically from the backend
                    const response = await fetch('/api/Advertisement/');
                    const locations = await response.json(); // Assuming the backend returns an array of locations
                    
                    // console.log(locations)
                    
                    if (!Array.isArray(locations) || locations.length === 0) {
                        throw new Error("No locations available.");
                    }
            
            setTimeout(() => {
            locations.forEach((location) => {
              const distance = calculateDistance(
                  userLatLng.lat,
                  userLatLng.lng,
                  location.lat,
                  location.lng
              );
            //   console.log(distance)
            
              if (distance <= 2) { // Show only locations within 2km radius
                  const marker = new google.maps.Marker({
                      position: { lat: location.lat, lng: location.lng },
                      map: map,
                      title: location.title,
                  });
            
                  const infoWindow = new google.maps.InfoWindow({
                      content: `<div>
                                  
                                  <img src="${location.image}" alt="${location.title}" style="width:100%;max-width:120px;border-radius:4px;max-hight:50px ;"/>
                                  <h3 style="margin:0;padding:0;">${location.title}</h3>
                                  <p style="margin:0;padding:0;"><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
                                </div>`,
                  });
            
                  infoWindow.open(map, marker);
            
                  // Close the InfoWindow when marker is clicked again
            
                  google.maps.event.addListener(infoWindow, "closeclick", () => {
                  marker.setMap(null); // Remove the marker from the map
              });
            
              // Optional: Close the InfoWindow and remove marker when the marker is clicked
              marker.addListener("click", () => {
                  infoWindow.close();  // Close the InfoWindow
                  marker.setMap(null); // Remove the marker
              });
              }
            });
            }, 30000); }

            catch (error) {
                console.error("Error finding nearest location:", error.message);
                return null; // Return null in case of error
            }
            }
            
              function calculateDistance(lat1, lng1, lat2, lng2) {
                  const R = 6371; // Radius of the Earth in kilometers
                  const dLat = ((lat2 - lat1) * Math.PI) / 180;
                  const dLng = ((lng2 - lng1) * Math.PI) / 180;
                  const a =
                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos((lat1 * Math.PI) / 180) *
                      Math.cos((lat2 * Math.PI) / 180) *
                      Math.sin(dLng / 2) *
                      Math.sin(dLng / 2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                  return R * c; // Distance in kilometers
              }
            // --------------------end--------------------------   

// add bus stopss--------------------------------------------------
// Fetch bus stops from the backend
function fetchBusStops() {
    console.log("api working123456")
    const apiEndpoint = "api/bus-stops/"; // Replace with your backend URL
    fetch(apiEndpoint)
        .then(response => response.json())
        .then(busStops => {
            addBusStopsToMap(busStops);
        })
        .catch(error => {
            console.error("Error fetching bus stops:", error);
        });
}

// Add bus stops to the map
function addBusStopsToMap(busStops) {
    busStops.forEach(stop => {
        const marker = new google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: map,
            title: stop.title,

            icon: {
                url: stop.type === "major" 
                ? staticUrls.stop
                : staticUrls.stop,
                scaledSize: new google.maps.Size(20, 20),
                }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<div>
                        <h3>${stop.title}</h3>
                        <p>${stop.description || "No description available"}</p>
                      </div>`,
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
    });
    console.log("123456234")
}
// --------------------------------------------------------------------------
console.log("123456")
let busMarkers = {};
async function fetchAndUpdateBusLocations(map) {
    console.log("helloo")
    try {
        console.log("helloo")
        const response = await fetch('api/real-time-bus-locations/');
        const buses = await response.json();
        // console.log(buses)

        buses.forEach(bus => {
            const position = { lat: bus.latitude, lng: bus.longitude };

            // If a marker already exists for this bus, update its position
            if (busMarkers[bus.bus_id]) {
                busMarkers[bus.bus_id].setPosition(position);
            } else {
                // Create a new marker for the bus
                busMarkers[bus.bus_id] = new google.maps.Marker({
                    position: position,
                    map: map,
                    title: `${bus.bus_name} (${bus.bus_no})`,
                    icon: {
                        url: "https://img.icons8.com/?size=100&id=KXKIFxpA3E9g&format=png&color=000000", // Bus icon
                        scaledSize: new google.maps.Size(30, 30),
                    },
                });
            }
        });
    } catch (error) {
        console.error("Error fetching bus locations:", error);
    }
}
