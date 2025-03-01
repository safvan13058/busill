
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
    const userLatLng = { lat: 11.0016, lng: 76.0027 };

    if (!map) {
        // Initialize map only once
        map = new google.maps.Map(document.getElementById("map"), {
            center: userLatLng,
            zoom: 15
        });

        // Add city name fetching and map features
        fetchCityAndShowMap(lat, lng);
        findNearestLocation(userLatLng);
        // directionswithbus(map);
        // fetchBusStops(1)
        getQueryParam();
    }
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    const busId = getQueryParam("busId");
    
    if (busId) {
        fetchBusStops(busId); // Use the bus ID dynamically
    } else {
        console.error("Bus ID is missing from the URL.");
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
        
        console.log(locations)
        
        if (!Array.isArray(locations) || locations.length === 0) {
            throw new Error("No locations available.");
        }


locations.forEach((location) => {
  const distance = calculateDistance(
      userLatLng.lat,
      userLatLng.lng,
      location.lat,
      location.lng
  );
  console.log(distance)

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
}
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

 let busMarker;

//  --------------------------------------------------------------------
      async function fetchBusStops(busId) {
        try {
            const response = await fetch(`/bus/${busId}/stops/`);
            const stops = await response.json(); // Assuming response is an array of stops
            console.log(stops)
            // Display each bus stop marker
            stops.forEach(stop => {
                new google.maps.Marker({
                    position: { lat: stop.lat, lng: stop.lng },
                    map: map,
                    icon:"https://img.icons8.com/?size=40&id=TfzCmm9w8wIV&format=png&color=000000", // Bus stop icon
                    scaledSize: new google.maps.Size(30, 30),
                    title: stop.title,
                });
            });
    
            // Pass bus stops to the directions function
            directionswithbus(stops);
        } catch (error) {
            console.error("Error fetching bus stops:", error);
        }
    }
// -----------------------------------------------------------

      let reachedStops = [];
      let currentStopIndex = 0;

  function directionswithbus(busStops) {
    console.log("Directions are being initialized3");

    // Ensure `reachedStops` array matches the length of the busStops
    reachedStops = new Array(busStops.length).fill(false);
    
    // Define origin and destination
    const origin = { lat: busStops[0].lat, lng: busStops[0].lng }; // First stop
    const destination = { lat: busStops[busStops.length - 1].lat, lng: busStops[busStops.length - 1].lng }; // Last stop
    console.log("he1");
    // Create the bus marker
    busMarker = new google.maps.Marker({
        position: origin,
        map: map,
        icon: "https://img.icons8.com/?size=30&id=KXKIFxpA3E9g&format=png&color=000000", // Bus icon
        scaledSize: new google.maps.Size(20, 20),
        title: "Real-Time Bus",
    });

    // Initialize an InfoWindow
    infoWindow = new google.maps.InfoWindow({
        content: generateInfoWindowContent("KODAATH", busStops[0].title, busStops[1]?.title),
    });
    infoWindow.open(map, busMarker);

    // Display the route
    displayRoute(origin, destination);

    // Start fetching real-time bus position
    fetchRealTimeLocation(busStops,1);
}

      function displayRoute(origin, destination) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
    
        directionsRenderer.setMap(map); // Bind the route renderer to the map
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
                if (status === "OK") {
                    directionsRenderer.setDirections(response);
                } else {
                    console.error("Directions request failed due to " + status);
                }
            }
        );
    }
    
// ------------------------------------------------------------------------------------------
    async function fetchRealTimeLocation(busStops,busId) {
      try {
          while (true) {
              const response = await fetch(`/bus/${busId}/position/`);
              const location = await response.json();
  
              if (!location.lat || !location.lng) {
                  console.log("Bus has reached the end of the route.");
                  break;
              }
  
              console.log(`Updating bus position to: ${location.lat}, ${location.lng}`);
              updateBusPosition(location);
  
              // Update the InfoWindow with the current and next stop
              const currentStopIndex = getClosestStopIndex(location, busStops);
              const currentStop = busStops[currentStopIndex]?.title || "N/A";
              const nextStop = busStops[currentStopIndex + 1]?.title || "End of Route";
  
              infoWindow.setContent(generateInfoWindowContent("KODAATH", currentStop, nextStop));
              infoWindow.open(map, busMarker);
  
              // Delay for the next fetch (polling every 3 seconds)
              await new Promise(resolve => setTimeout(resolve, 3000));
          }
      } catch (error) {
          console.error("Error fetching real-time bus location:", error);
      }
  }
  
  function updateBusPosition(location) {
      const newLatLng = new google.maps.LatLng(location.lat, location.lng);
      busMarker.setPosition(newLatLng);
      map.panTo(newLatLng); // Optionally center the map on the bus
  }
  
  function getClosestStopIndex(location, busStops) {
      // Find the nearest stop index based on the current location
      let closestIndex = 0;
      let smallestDistance = Infinity;
  
      busStops.forEach((stop, index) => {
          const distance = Math.sqrt(
              Math.pow(stop.lat - location.lat, 2) + Math.pow(stop.lng - location.lng, 2)
          );
          if (distance < smallestDistance) {
              smallestDistance = distance;
              closestIndex = index;
          }
      });
  
      return closestIndex;
  }
    

  function generateInfoWindowContent(busName, currentStop, nextStop) {
    return `
        <div style="font-size: 14px; line-height: 1.6;">
            <strong>${busName}</strong><br>
            <strong>Current Stop:</strong> ${currentStop}<br>
            <strong>Next Stop:</strong> ${nextStop}
        </div>
    `;
}




    // -----------------------------------------------------------end---------------------------
