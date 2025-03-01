// const busStops = [
//     { title: "Kottakkal", position: 0, latitude: 11.0059, longitude: 76.0728 },
//     { title: "Bus Stop 1", position: 10, latitude: 11.0180, longitude: 76.0735 },
//     { title: "Bus Stop 2", position: 20, latitude: 11.0300, longitude: 76.0742 },
//     { title: "Bus Stop 3", position: 30, latitude: 11.0450, longitude: 76.0750 },
//     { title: "Bus Stop 4", position: 42, latitude: 11.0600, longitude: 76.0758 },
//     { title: "Bus Stop 5", position: 52, latitude: 11.0750, longitude: 76.0765 },
//     { title: "Bus Stop 6", position: 63, latitude: 11.0900, longitude: 76.0770 },
//     { title: "Bus Stop 7", position: 73 , latitude: 11.1050, longitude: 76.0780 },
//     { title: "Bus Stop 8", position: 84, latitude: 11.1200, longitude: 76.0790 },
//     // { title: "Bus Stop 9", position: 90, latitude: 11.1350, longitude: 76.0800 },
//     { title: "Tirur", position: 95, latitude: 11.1500, longitude: 76.0810 },
//   ];

//   const busMarker = document.querySelector(".bus");
//   const currentplc = document.getElementById("cp");
//   const busStopElements = document.querySelectorAll(".stop");
//   const timeInfoElements = document.querySelectorAll(".time");
//   const place = document.querySelectorAll(".location");
//   const stops= document.querySelectorAll(".circle");
//   const time= document.querySelectorAll(".tym .time");
  
//   const totalStops = busStops.length;
  
//   function fetchBusLocation() {
//     const latitude =  11.0600; // Example latitude
//     const longitude =   76.0758; // Example longitude
//     updateBusPosition(latitude, longitude);
//     calculateEstimatedTimes(latitude, longitude);
//   }

//   function updateBusPosition(latitude, longitude) {
//     console.log('working1')
//     let closestStopIndex = 0;
//     let minDistance = Number.MAX_VALUE;

//     busStops.forEach((stop, index) => {
//         console.log('working2')
//       const distance = calculateDistance(
//         latitude,
//         longitude,
//         stop.latitude,
//         stop.longitude
//       );
//       if (distance < minDistance) {
//         minDistance = distance;
//         closestStopIndex = index;
//       }
//     });

//     // Update bus position and color of all previous stops

//     const topPosition = (closestStopIndex / (busStops.length - 1)) * 95;
//     busMarker.style.top = `${topPosition}%`;
  

    

//     for (let i = 0; i <= closestStopIndex; i++) {
//       stops[i].classList.add("reached");
//       time[i].classList.add("timecolor");
      
//     }
    
//     currentplc.innerHTML = `${busStops[closestStopIndex].title}`;
//     console.log(`current stop:${busStops[closestStopIndex].title}`)
    
//   }

//   function calculateEstimatedTimes(latitude, longitude) {
// let closestStopIndex = 0;
// let minDistance = Number.MAX_VALUE;

// // Find the closest bus stop to the current location
// busStops.forEach((stop, index) => {
// const distance = calculateDistance(
//   latitude,
//   longitude,
//   stop.latitude,
//   stop.longitude
// );
// if (distance < minDistance) {
//   minDistance = distance;
//   closestStopIndex = index;
// }
// });

// // Update estimated times for all stops
// busStops.forEach((stop, index) => {
// const timeDiv = timeInfoElements[index];
// const placediv=place[index];

// // If the stop has been reached
// if (index <= closestStopIndex) {
//   placediv.innerHTML=`${stop.title}`
//   timeDiv.innerHTML = `Reached`;
//   return;
// }

// // Calculate remaining time for future stops
// const distance = calculateDistance(
//   latitude,
//   longitude,
//   stop.latitude,
//   stop.longitude
// );
// const timeToStop = (distance / (30 / 3.6)) * 60; // Time in minutes
// const currentTime = new Date();
// const arrivalTime = new Date(
//   currentTime.getTime() + timeToStop * 60 * 1000
// );

// // Format time to show only hours and minutes
// const formattedTime = arrivalTime.toLocaleTimeString("en-IN", {
//   timeZone: "Asia/Kolkata",
//   hour: "2-digit",
//   minute: "2-digit",
// });

// timeDiv.innerHTML = `${formattedTime}`;
// placediv.innerHTML = `${stop.title}`;

// });
// }

//   function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of Earth in km
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }

//   fetchBusLocation();

// // let busStops = []; // To store bus stops fetched from the backend

// // const busMarker = document.querySelector(".bus");
// // const currentplc = document.getElementById("cp");
// // const busStopElements = document.querySelectorAll(".stop");
// // const timeInfoElements = document.querySelectorAll(".time");
// // const place = document.querySelectorAll(".location");
// // const stops = document.querySelectorAll(".circle");
// // const time = document.querySelectorAll(".tym .time");

// // async function fetchAndRenderBusStops(busId) {
// //   try {
// //       // Fetch the bus stops from the backend
// //       const response = await fetch(`bus/${busId}/stops/`);
// //       if (!response.ok) {
// //           throw new Error(`Failed to fetch bus stops: ${response.statusText}`);
// //       }

// //       const stops = await response.json();

// //       // Get the timeline container
// //       const timelineContainer = document.querySelector('.timeline .all');
// //       timelineContainer.innerHTML = ''; // Clear existing static stops
      
// //       // Dynamically add stops
// //       stops.forEach((stop, index) => {
// //           const stopElement = document.createElement('div');
// //           stopElement.className = 'stop';

// //           stopElement.innerHTML = `
// //               <div class="tym">
// //                   <img src=${logos.clock} alt="">
// //                   <span class="time"></span>
// //               </div>
// //               <div class="spot">
// //                   <div class="circle ${stop.reached ? 'reached' : ''}"></div>
// //                   <img src=${logos.busstop} alt="">
// //               </div>
// //               <div class="plc">
// //                   <img src=${logos.arrow} alt="">
// //                   <span class="location">${stop.title}</span>
// //               </div>
// //           `;

// //           timelineContainer.appendChild(stopElement);
// //       });

// //       console.log('Bus stops successfully rendered!');
// //   } catch (error) {
// //       console.error('Error fetching bus stops:', error.message);
// //   }
// // }

// // // Call the function with the desired bus ID
// // fetchAndRenderBusStops(1); // Replace 1 with the dynamic bus ID



// // // Fetch bus stops from the backend
// // async function fetchBusStops(busId) {
// //     try {
// //         const response = await fetch(`bus/${busId}/stops/`); // Replace with your actual endpoint
// //         if (!response.ok) {
// //             throw new Error(`Failed to fetch bus stops: ${response.statusText}`);
// //         }

// //         busStops = await response.json(); // Update the busStops array with backend data
// //         console.log("Fetched bus stops:", busStops);

// //         // Fetch the real-time bus location
// //         fetchBusLocation(busId);
// //     } catch (error) {
// //         console.error("Error fetching bus stops:", error.message);
// //     }
// // }

// // // Fetch real-time bus location
// // async function fetchBusLocation(busId) {
// //     try {
// //         const response = await fetch(`bus/${busId}/position/`); // Replace with your actual endpoint
// //         if (!response.ok) {
// //             throw new Error(`Failed to fetch bus location: ${response.statusText}`);
// //         }

// //         const data = await response.json(); // Assuming API response contains { latitude, longitude }
// //         // const { latitude, longitude } = data;
// //         const latitude=data.lat;
// //         const longitude=data.lng;
// //         console.log(latitude,longitude)

// //         if (latitude == null || longitude == null) {
// //             throw new Error("Latitude or Longitude is missing in the API response.");
// //         }

// //         console.log("Current bus location:", { latitude, longitude });

// //         // Update bus position and calculate estimated times
// //         updateBusPosition(latitude, longitude);
// //         calculateEstimatedTimes(latitude, longitude);
// //     } catch (error) {
// //         console.error("Error fetching bus location:", error.message);
// //     }
// // }

// // // Update bus position and UI elements
// // function updateBusPosition(latitude, longitude) {
// //     console.log("Updating bus position...");

// //     let closestStopIndex = 0;
// //     let minDistance = Number.MAX_VALUE;

// //     // Find the closest bus stop to the current location
// //     busStops.forEach((stop, index) => {
// //         const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng);
// //         if (distance < minDistance) {
// //             minDistance = distance;
// //             closestStopIndex = index;
// //         }
// //     });

// //     // Update bus marker position
// //     const topPosition = (closestStopIndex / (busStops.length - 1)) * 95; // Percentage position
// //     busMarker.style.top = `${topPosition}%`;

// //     // Update colors for reached stops
// //     for (let i = 0; i <= closestStopIndex; i++) {
// //         stops[i].classList.add("reached");
// //         time[i].classList.add("timecolor");
// //     }

// //     // Update the current stop information
// //     currentplc.innerHTML = `${busStops[closestStopIndex].title}`;
// //     console.log(`Current stop: ${busStops[closestStopIndex].title}`);
// // }

// // function calculateEstimatedTimes(latitude, longitude) {
// //   console.log("Calculating estimated times...");
// //   let closestStopIndex = 0;
// //   let minDistance = Number.MAX_VALUE;

// //   // Find the closest bus stop to the current location
// //   busStops.forEach((stop, index) => {
// //       const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng);
// //       if (distance < minDistance) {
// //           minDistance = distance;
// //           closestStopIndex = index;
// //       }
// //   });

// //   // Update times and locations for all stops
// //   busStops.forEach((stop, index) => {
// //       const timeDiv = timeInfoElements[index];
// //       const placeDiv = place[index];
      

// //       if (index <= closestStopIndex) {
// //           // Stops already reached
// //           placeDiv.innerHTML = `${stop.title}`;
// //           timeDiv.innerHTML = `Reached`;
// //       } else {
// //           // Calculate remaining time
// //           const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng);
// //           const timeToStop = (distance / (30 / 3.6)) * 60; // Assume average speed of 30 km/h
// //           const currentTime = new Date();
// //           const arrivalTime = new Date(currentTime.getTime() + timeToStop * 60 * 1000);

// //           // Handle invalid times
// //           if (isNaN(arrivalTime)) {
// //               console.error("Invalid arrival time for:", stop.title);
// //               timeDiv.innerHTML = "Invalid Time";
// //               placeDiv.innerHTML = `${stop.title}`;
// //           } else {
// //               const formattedTime = arrivalTime.toLocaleTimeString("en-IN", {
// //                   timeZone: "Asia/Kolkata",
// //                   hour: "2-digit",
// //                   minute: "2-digit",
// //               });

// //               timeDiv.innerHTML = `${formattedTime}`;
// //               placeDiv.innerHTML = `${stop.title}`;
// //               console.log(timeDiv);
// //               console.log(placeDiv);
// //               console.log(formattedTime, stop.title);
// //           }
// //       }
// //   });
// // }


// // // Calculate the distance between two coordinates (Haversine formula)
// // function calculateDistance(lat1, lon1, lat2, lon2) {
// //     const R = 6371; // Radius of Earth in km
// //     const dLat = ((lat2 - lat1) * Math.PI) / 180;
// //     const dLon = ((lon2 - lon1) * Math.PI) / 180;
// //     const a =
// //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// //         Math.cos((lat1 * Math.PI) / 180) *
// //             Math.cos((lat2 * Math.PI) / 180) *
// //             Math.sin(dLon / 2) *
// //             Math.sin(dLon / 2);
// //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //     return R * c; // Distance in km
// // }

// // // Fetch stops and initialize for a specific bus
// // fetchBusStops(1); // Pass bus ID dynamically
