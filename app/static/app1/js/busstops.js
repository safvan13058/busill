// Fetch locations from the backend
async function fetchLocations() {
    console.log("busstop api working")
    try {
        const response = await fetch('api/busstopsname/'); // Backend API endpoint
        if (!response.ok) throw new Error('Failed to fetch locations');

        const data = await response.json();
        const locations = data.locations;

        // Populate the "From" and "To" datalists
        const fromDatalist = document.getElementById('from-locations');
        const toDatalist = document.getElementById('to-locations');

        locations.forEach(location => {
            const optionFrom = document.createElement('option');
            const optionTo = document.createElement('option');

            optionFrom.value = location;
            optionTo.value = location;

            fromDatalist.appendChild(optionFrom);
            toDatalist.appendChild(optionTo);
        });
    } catch (error) {
        console.error('Error fetching locations:', error.message);
    }
}

// Handle "My Bus" button click
function findMyBus() {
    const fromLocation = document.getElementById("from").value.trim();
    const toLocation = document.getElementById("to").value.trim();

    // Validate inputs
    if (!fromLocation || !toLocation) {
        alert("Please select both 'From' and 'To' locations.");
        return;
    }

    // Example: Redirect to search results page with query parameters
    window.location.href = `/bus?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`;
}

// Call fetchLocations on page load to populate datalists
fetchLocations();



// let locations = []; // Store fetched locations

// // Fetch locations from the backend
// async function fetchLocations() {
//     try {
//         const response = await fetch('api/busstopsname/'); // Backend API endpoint
//         if (!response.ok) throw new Error('Failed to fetch locations');

//         const data = await response.json();
//         locations = data.locations; // Save locations for filtering
//     } catch (error) {
//         console.error('Error fetching locations:', error.message);
//     }
// }

// // Show suggestions based on user input
// function showSuggestions(inputId) {
//     const input = document.getElementById(inputId);
//     const suggestionsContainer = document.getElementById(`${inputId}-suggestions`);

//     // Clear existing suggestions
//     suggestionsContainer.innerHTML = '';
//     suggestionsContainer.style.display = 'none'; // Hide by default

//     const query = input.value.trim().toLowerCase();

//     if (query.length > 0) {
//         // Filter locations based on query
//         const filteredLocations = locations.filter(location =>
//             location.toLowerCase().includes(query)
//         );

//         // Populate suggestions
//         filteredLocations.forEach(location => {
//             const suggestion = document.createElement('div');
//             suggestion.textContent = location;
//             suggestion.onclick = () => {
//                 input.value = location; // Set input value
//                 suggestionsContainer.style.display = 'none'; // Hide suggestions
//             };
//             suggestionsContainer.appendChild(suggestion);
//         });

//         if (filteredLocations.length > 0) {
//             suggestionsContainer.style.display = 'block'; // Show suggestions if any match
//         }
//     }
// }

// // Handle "My Bus" button click
// function findMyBus() {
//     const fromLocation = document.getElementById("from").value.trim();
//     const toLocation = document.getElementById("to").value.trim();

//     // Validate inputs
//     if (!fromLocation || !toLocation) {
//         alert("Please select both 'From' and 'To' locations.");
//         return;
//     }

//     // Example: Redirect to search results page with query parameters
//     window.location.href = `/search-bus?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`;
// }

// // Call fetchLocations on page load
// fetchLocations();
