console.log('getloc working')
        window.onload = getLocation;

        function getLocation() {
            if (navigator.geolocation) {
                document.getElementById("output").innerHTML = "Fetching location...";
                navigator.geolocation.getCurrentPosition(fetchCity, showError, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            } else {
                document.getElementById("output").innerHTML = "not supported";
            }
        }

        function fetchCity(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Debug: log the coordinates
            console.log(`Coordinates received: Latitude = ${lat}, Longitude = ${lng}`);

            // Use Google Maps Reverse Geocoding API to get the location name
            const geocodingAPI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBVHXAjg4mpK11K-Dqjey1OrGNRNXDeP3o`;

            fetch(geocodingAPI)
                .then(response => response.json())
                .then(data => {
                    // Debug: log the API response
                    console.log("Geocoding API Response:", data);

                    if (data.status === "OK") {
                        // Extract the city from the address_components array
                        const addressComponents = data.results[0].address_components;
                        const city = addressComponents.find(component => 
                            component.types.includes("locality") || // City
                            component.types.includes("sublocality") || // Subdivision
                            component.types.includes("administrative_area_level_2")||
                            component.types.includes("administrative_area_level_1") 
                        )?.long_name || "City not found";

                        // Display the city name
                        document.getElementById("output").innerHTML = city;
                    } else {
                        document.getElementById("output").innerHTML = `Unable `;
                    }
                })
                .catch(error => {
                    document.getElementById("output").innerHTML = "Error fetching";
                    console.error("Fetch error:", error);
                });
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    document.getElementById("output").innerHTML = "User denied ";
                    break;
                case error.POSITION_UNAVAILABLE:
                    document.getElementById("output").innerHTML = "unavailable.";
                    break;
                case error.TIMEOUT:
                    document.getElementById("output").innerHTML = " timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    document.getElementById("output").innerHTML = "error occurred.";
                    break;
            }
        }
   
