// const logos = {
//     clock: "clock-icon.png",
//     busstop: "busstop-icon.png",
//     arrow: "arrow-icon.png"
//   };
  
  let busStops = [];
  const busMarker = document.querySelector(".bus");
  const currentplc = document.getElementById("cp");
  const Busname = document.getElementById("busname");
  const Busplace = document.getElementById("busplace");
  const Busno = document.getElementById("busno");

  

  async function fetchBusdata(busId) {
    try {
      const response = await fetch(`/bus/${busId}/buses/`);
      if (!response.ok) throw new Error("Network response was not ok");
      const buses = await response.json();
      // Update DOM
      Busname.innerHTML = buses.Busname;
      Busplace.innerHTML = `${buses.route_start}-${buses.route_end}`;
      Busno.innerHTML = buses.Bus_NO;
    } catch (error) {
      console.error("Failed to fetch bus data:", error);
    }
    

  }
  
  // Fetch and render bus stops
  async function fetchAndRenderBusStops(busId) {
    console.log( `fetchbusstops${busId}` )
    try {
      const response = await fetch(`/bus/${busId}/stops/`);
      if (!response.ok) throw new Error(`Failed to fetch bus stops: ${response.statusText}`);
  
      busStops = await response.json();
      const timelineContainer = document.querySelector(".timeline .all");
      timelineContainer.innerHTML = "";
  
      busStops.forEach((stop) => {
        const stopElement = document.createElement("div");
        stopElement.className = "stop";
  
        stopElement.innerHTML = `
          <div class="tym">
            <img src=${logos.clock} alt="Clock">
            <span class="time">Pending</span>
          </div>
          <div class="spot">
            <div class="circle ${stop.reached ? "reached" : ""}"></div>
            <img src=${logos.busstop} alt="Bus Stop">
          </div>
          <div class="plc">
            <img src=${logos.arrow} alt="Arrow">
            <span class="location">${stop.title}</span>
          </div>
        `;
        timelineContainer.appendChild(stopElement);
      });
    } catch (error) {
      console.error("Error fetching bus stops:", error.message);
    }
  }
  
  // Fetch bus location and move the bus dynamically
  async function fetchBusLocation(busId) {
    console.log(`fetchbuslocation${busId} `)
    try {
      const response = await fetch(`/bus/${busId}/position/`);
      if (!response.ok) throw new Error(`Failed to fetch bus location: ${response.statusText}`);
  
      const { lat: latitude, lng: longitude } = await response.json();
      if (latitude == null || longitude == null) throw new Error("Latitude or Longitude is missing.");
  
      updateBusPosition(latitude, longitude);
      calculateEstimatedTimes(latitude, longitude);
    } catch (error) {
      console.error("Error fetching bus location:", error.message);
    }
  }
  
  // Update bus position
  function updateBusPosition(latitude, longitude) {
    let closestStopIndex = 0;
    let minDistance = Number.MAX_VALUE;
  
    busStops.forEach((stop, index) => {
      const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestStopIndex = index;
      }
    });
  
    const topPosition = (closestStopIndex / (busStops.length - 1)) * 95;
    busMarker.style.top = `${topPosition}%`;
  
    const stops = document.querySelectorAll(".stop .circle");
    stops.forEach((circle, index) => {
      if (index <= closestStopIndex) {
        circle.classList.add("reached");
      }
    });
  
    currentplc.innerHTML = `${busStops[closestStopIndex].title}`;
  }
  
  // Calculate estimated arrival times
  function calculateEstimatedTimes(latitude, longitude) {
    const timeInfoElements = document.querySelectorAll(".stop .tym .time");
  
    busStops.forEach((stop, index) => {
      const timeDiv = timeInfoElements[index];
      const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng);
      const timeToStop = (distance / (30 / 3.6)) * 60; // Average speed 30 km/h
      const arrivalTime = new Date(Date.now() + timeToStop * 60 * 1000);
  
      timeDiv.textContent = arrivalTime.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit"
      });
    });
  }
  
  // Calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  
  // Start real-time updates
  function startRealTimeBusUpdates(busId, interval = 10000) {
    fetchAndRenderBusStops(busId);
    fetchBusLocation(busId);
    setInterval(() => fetchBusLocation(busId), interval);
  }
  
  // Initialize
//   startRealTimeBusUpdates(1); // Replace `1` with actual bus ID
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const busId = getQueryParam("busId");

if (busId) {
    startRealTimeBusUpdates(busId);
    fetchBusdata(busId) // Use the bus ID dynamically
} else {
    console.error("Bus ID is missing from the URL.");
}