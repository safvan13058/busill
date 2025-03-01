// Function to Get CSRF Token from Cookies
function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            let trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('csrftoken=')) {
                cookieValue = trimmedCookie.substring('csrftoken='.length);
            }
        });
    }
    return cookieValue;
}

// Function to Save Bus Owner
function saveOwner() {
    let name = document.getElementById("ownerName").value.trim();
    let phone = document.getElementById("ownerPhone").value.trim();
    let email = document.getElementById("ownerEmail").value.trim();
    let address = document.getElementById("ownerAddress").value.trim();

    // 🚨 Prevent empty submissions
    if (!name || !phone || !email || !address) {
        alert("All fields are required!");
        return;
    }

    let ownerData = { name, phone, email, address };

    fetch("/ceo/api/bus-owners/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken() // Add CSRF Token
        },
        body: JSON.stringify(ownerData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("✅ Owner added successfully!");

                // Clear form fields after successful submission
                document.getElementById("ownerName").value = "";
                document.getElementById("ownerPhone").value = "";
                document.getElementById("ownerEmail").value = "";
                document.getElementById("ownerAddress").value = "";

                closeModal(); // Close modal after saving
            } else {
                // 🚨 Show validation errors from Django
                alert("❌ Error: " + JSON.stringify(data));
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("⚠️ Failed to add owner! Please try again.");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    fetchBusOwners();
});

function fetchBusOwners(searchQuery = "") {
    console.log("working data")
    let url = "/ceo/api/bus-owners/";
    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.getElementById("busOwnerTableBody");
            tableBody.innerHTML = "";  // Clear existing content

            data.forEach((owner, index) => {
                let row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${owner.name}</td>
                    <td>${owner.email}</td>
                    <td>${owner.phone}</td>
                    <td>${owner.address}</td>
                    <td><button class="btns edit" onclick="showBusPopup(${owner.id})">Bus</button></td>
                    <td>
                        <button class="btns edit" onclick="showEditPopup(${owner.id})">Edit</button>
                        <button class="btns delete" onclick="showDeletePopup(${owner.id})">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
}

// Handle search input change
document.getElementById("searchInput").addEventListener("input", function () {
    fetchBusOwners(this.value);
});



function editOwner(ownerId) {
    alert("Edit functionality for Owner ID: " + ownerId);
    // Implement edit logic here
}
let deleteId = null; // Store the owner ID for deletion
function showDeletePopup(ownerId) {
    deleteId = ownerId;
    document.getElementById("confirmPopup").classList.add("show");
}

function closePopup() {
    document.getElementById("confirmPopup").classList.remove("show");
}
function confirmDelete() {
    if (deleteId !== null) {
        fetch(`/ceo/api/bus-owners/delete/${deleteId}/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
            .then(response => {
                if (response.ok) {
                    alert("Owner deleted successfully");
                    fetchBusOwners();  // Refresh the table
                } else {
                    alert("Failed to delete owner");
                }
            })
            .catch(error => console.error("Error deleting owner:", error))
            .finally(() => {
                closePopup(); // Close the popup after action
            });
    }
}

let editOwnerId = null; // Store owner ID for editing

function showEditPopup(ownerId) {
    editOwnerId = ownerId; // Store ID

    // Fetch the current data of the owner
    fetch(`/ceo/api/bus-owners/update/${ownerId}/`)

        .then(response => response.json())
        .then(data => {
            console.log("edit working")
            // Fill form with existing data
            document.getElementById("editOwnerId").value = data.id;
            document.getElementById("editName").value = data.name;
            document.getElementById("editEmail").value = data.email;
            document.getElementById("editPhone").value = data.phone;
            document.getElementById("editAddress").value = data.address;

            // Show the popup
            // document.getElementById("editPopup").style.display = "flex";
            document.getElementById("editPopup").classList.add("show");
        })
        .catch(error => console.error("Error fetching owner data:", error));
}

function closeEditPopup() {
    document.getElementById("editPopup").classList.remove("show");
    // document.getElementById("editPopup").style.display = "none"; // Hide popup
}

function saveEdit() {
    const updatedData = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        phone: document.getElementById("editPhone").value,
        address: document.getElementById("editAddress").value
    };

    fetch(`/ceo/api/bus-owners/update/${editOwnerId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Bus Owner updated successfully");
                fetchBusOwners();  // Refresh the table
                closeEditPopup();  // Close popup
            } else {
                alert("Failed to update owner: " + JSON.stringify(data));
            }
        })
        .catch(error => console.error("Error updating owner:", error));
}
let currentOwnerId = null;
function showBusPopup(ownerId) {
    console.log(`Fetching buses for owner: ${ownerId}`);
    
    fetch(`/ceo/api/buses/${ownerId}/`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);  // ✅ Check what the API returns

            const busList = document.getElementById("busList");
            busList.innerHTML = "";  // Clear previous entries
            currentOwnerId = ownerId;
            if (!Array.isArray(data)) {
                busList.innerHTML = "<li>Error: Unexpected response format</li>";
            } else if (data.length === 0) {
                busList.innerHTML = "<li>No buses found</li>";
            } else {
                data.forEach(bus => {
                    busList.innerHTML += `
                        <li>
                            <strong>${bus.Busname}</strong> (No: ${bus.Bus_NO})<br>
                            Route: ${bus.route_start} ➝ ${bus.route_end}<br>
                            ${bus.url ? `<a href="${bus.url}" target="_blank">GPS Link</a>` : ""}
                        </li>
                    `;
                });
            }

            document.getElementById("busPopup").classList.add("show");  // ✅ Show popup regardless of data
        })
        .catch(error => {
            console.error("Error fetching buses:", error);
            document.getElementById("busList").innerHTML = "<li>Error fetching data</li>";
            document.getElementById("busPopup").classList.add("show");
        });
}

// function showBusPopup(ownerId) {
//   fetch(`/ceo/api/buses/${ownerId}/`)
//       .then(response => response.json())
//       .then(data => {
//           console.log("API Response:", data);  // ✅ Check what the API returns

//           const busTableBody = document.querySelector("#busTable tbody");
//           busTableBody.innerHTML = "";  // Clear previous entries

//           if (!Array.isArray(data)) {
//               busTableBody.innerHTML = `
//                   <tr>
//                       <td colspan="4">Error: Unexpected response format</td>
//                   </tr>
//               `;
//           } else if (data.length === 0) {
//               busTableBody.innerHTML = `
//                   <tr>
//                       <td colspan="4">No buses found</td>
//                   </tr>
//               `;
//           } else {
//               data.forEach(bus => {
//                   busTableBody.innerHTML += `
//                       <tr>
//                           <td>${bus.Busname}</td>
//                           <td>${bus.Bus_NO}</td>
//                           <td>${bus.route_start} ➝ ${bus.route_end}</td>
//                           <td>
//                               ${bus.url ? `<a href="${bus.url}" target="_blank">GPS Link</a>` : "N/A"}
//                           </td>
//                       </tr>
//                   `;
//               });
//           }

//           document.getElementById("busPopup").classList.add("show");  // ✅ Show popup regardless of data
//       })
//       .catch(error => {
//           console.error("Error fetching buses:", error);
//           const busTableBody = document.querySelector("#busTable tbody");
//           busTableBody.innerHTML = `
//               <tr>
//                   <td colspan="4">Error fetching data</td>
//               </tr>
//           `;
//           document.getElementById("busPopup").classList.add("show");
//       });
// }
function closeBusPopup() {
    document.getElementById("busPopup").classList.remove("show");  // Hide popup
}

// Show add bus form popup
function addBusPopup() {
    document.getElementById("addBusPopup").classList.add("show");
}

// Close add bus form popup
function closeAddBusPopup() {
    document.getElementById("addBusPopup").classList.remove("show");
}

// Save new bus
function saveBus() {
    console.log(`buses for owner: ${currentOwnerId}`);
    const busData = {
        Busname: document.getElementById("busName").value.trim(),
        Bus_NO: document.getElementById("busNumber").value.trim(),
        route_start: document.getElementById("routeStart").value.trim(),
        route_end: document.getElementById("routeEnd").value.trim(),
        url: document.getElementById("busUrl").value.trim(),
        owner_id: currentOwnerId
    };

    // Validate required fields
    if (!busData.Busname || !busData.Bus_NO || !busData.route_start || !busData.route_end) {
        alert("Please fill in all required fields.");
        return;
    }
    console.log(`busData: ${JSON.stringify(busData, null, 2)}`);  // Pretty-print object
    fetch("/ceo/api/buses/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(busData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("✅ Bus added successfully!");
            closeAddBusPopup();   // Close the add bus form
            showBusPopup(currentOwnerId);  // Refresh bus list
        } else {
            alert("❌ Error: " + JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error("Error adding bus:", error);
        alert("⚠️ Failed to add bus!");
    });
}



let selectedBusId = null;

// 🚀 Show Add Bus Modal
function showAddBusPopup() {
    document.getElementById("busModal").classList.add("show");
}

// 🚀 Close Add Bus Modal
function closeBusModal() {
    document.getElementById("busModal").classList.remove("show");
    clearBusForm();
}

// // 🚀 Save Bus
// function saveBus() {
//     const busData = {
//         Busname: document.getElementById("busName").value.trim(),
//         Bus_NO: document.getElementById("busNumber").value.trim(),
//         route_start: document.getElementById("routeStart").value.trim(),
//         route_end: document.getElementById("routeEnd").value.trim(),
//         url: document.getElementById("gpsUrl").value.trim()
//     };

//     if (!busData.Busname || !busData.Bus_NO || !busData.route_start || !busData.route_end) {
//         alert("❗ All fields except GPS URL are required.");
//         return;
//     }

//     fetch("/ceo/api/buses/add/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCSRFToken()
//         },
//         body: JSON.stringify(busData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.message) {
//             alert("✅ Bus added successfully!");
//             closeBusModal();
//             fetchBuses();  // Refresh table
//         } else {
//             alert(`❌ Error: ${JSON.stringify(data)}`);
//         }
//     })
//     .catch(error => {
//         console.error("Error adding bus:", error);
//         alert("⚠️ Failed to add bus!");
//     });
// }

// 🚀 Fetch and Display Buses
function fetchBuses() {
    fetch("/ceo/api/buses/")
        .then(response => response.json())
        .then(data => {
            const busTableBody = document.getElementById("busTableBody");
            busTableBody.innerHTML = "";

            if (data.length === 0) {
                busTableBody.innerHTML = `<tr><td colspan="7">No buses found.</td></tr>`;
                return;
            }
            console.log(JSON.stringify(data, null, 2));
            data.forEach((bus, index) => {
                busTableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${bus.Busname}</td>
                        <td>${bus.Bus_NO}</td>
                        <td>${bus.route_start}</td>
                        <td>${bus.route_end}</td>
                        <td>${bus.owner_name||"--"}</td>
                        <td>${bus.url ? `<a href="${bus.url}" target="_blank">GPS Link</a>` : "N/A"}</td>
                        <td>
                            <button class="btns edit" onclick="trackBus(${bus.id})">Track</button>
                            <button class="btns edit" onclick="Busstops(${bus.id})">Stops</button>
                            <button class="btns edit" onclick="editBus(${bus.id})">Edit</button>
                            <button class="btns delete" onclick="showDeletePopups(${bus.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Error fetching buses:", error);
        });
}

// 🚀 Search Buses by Name or Number
function searchBuses() {
    const query = document.getElementById("busSearchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#busTableBody tr");

    rows.forEach(row => {
        const busName = row.children[1]?.textContent.toLowerCase();
        const busNumber = row.children[2]?.textContent.toLowerCase();
        row.style.display = (busName.includes(query) || busNumber.includes(query)) ? "" : "none";
    });
}

// 🚀 Show Delete Confirmation Popup
function showDeletePopups(busId) {
    console.log("workingbuseses")
    selectedBusId = busId;
    document.getElementById("confirmPopups").classList.add("show");
}

// 🚀 Confirm Bus Deletion
function confirmDeleteBus() {
    if (!selectedBusId) return;

    fetch(`/ceo/bus/delete/${selectedBusId}/`, {
        method: "DELETE",
        headers: {
            "X-CSRFToken": getCSRFToken()
        }
    })
    .then(response => {
        if (response.ok) {
            alert("✅ Bus deleted successfully!");
            fetchBuses();  // Refresh table
            closeConfirmPopup();
        } else {
            alert("❌ Failed to delete bus.");
        }
    })
    .catch(error => {
        console.error("Error deleting bus:", error);
    });
}

// 🚀 Close Confirmation Popup
function closeConfirmPopup() {
    document.getElementById("confirmPopups").classList.remove("show");
}

// 🚀 Clear Bus Form Fields
function clearBusForm() {
    document.getElementById("busName").value = "";
    document.getElementById("busNumber").value = "";
    document.getElementById("routeStart").value = "";
    document.getElementById("routeEnd").value = "";
    document.getElementById("gpsUrl").value = "";
}

// 🚀 Fetch Buses on Page Load
window.onload = fetchBuses();

let currentEditBusId = null;

// 🚀 Show Edit Bus Popup with Pre-filled Data
function editBus(busId) {
    fetch(`/ceo/api/buses/single/${busId}/`)
        .then(response => response.json())
        .then(bus => {
            currentEditBusId = bus.id;
            document.getElementById("editBusName").value = bus.Busname;
            document.getElementById("editBusNumber").value = bus.Bus_NO;
            document.getElementById("editRouteStart").value = bus.route_start;
            document.getElementById("editRouteEnd").value = bus.route_end;

            document.getElementById("editBusPopup").classList.add("show");  // Show popup
        })
        .catch(error => {
            console.error("Error fetching bus details:", error);
            alert("❌ Failed to load bus details.");
        });
}

// 🚀 Save Edited Bus
function saveEditedBus() {
    const updatedData = {
        Busname: document.getElementById("editBusName").value.trim(),
        Bus_NO: document.getElementById("editBusNumber").value.trim(),
        route_start: document.getElementById("editRouteStart").value.trim(),
        route_end: document.getElementById("editRouteEnd").value.trim(),
    };

    fetch(`/ceo/api/buses/update/${currentEditBusId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("✅ Bus updated successfully!");
            fetchBuses();  // Refresh table
            closeEditBusPopup();
        } else {
            alert(`❌ Error: ${JSON.stringify(data)}`);
        }
    })
    .catch(error => {
        console.error("Error updating bus:", error);
        alert("⚠️ Failed to update bus.");
    });
}

// 🚀 Close Edit Bus Popup
function closeEditBusPopup() {
    document.getElementById("editBusPopup").classList.remove("show");
}
let currentBusId = null;
// 🚀 Show Bus Stops Popup
// function Busstops(busId) {
//     currentBusId = busId;  
//     document.getElementById("busStopsPopup").classList.add("show");

//     fetch(`/ceo/api/buses/${busId}/stops/`)
//         .then(response => response.json())
//         .then(stops => {
//             const busStopsList = document.getElementById("busStopsList");
//             busStopsList.innerHTML = "";

//             if (stops.length === 0) {
//                 busStopsList.innerHTML = "<li>No stops available.</li>";
//                 return;
//             }

//             // Sort by index before displaying
//             stops.sort((a, b) => a.index - b.index);

//             stops.forEach(stop => {
//                 busStopsList.innerHTML += `
//                     <li>
//                         <strong>#${stop.index}</strong>: ${stop.title} 
//                         <br>📍 Lat: ${stop.lat}, Lng: ${stop.lng}
//                         <div style="margin-top: 8px;">
//                             <button class="btns edit" onclick="editBusStop(${stop.id})">✏️ Edit</button>
//                             <button class="btns delete" onclick="deleteBusStop(${stop.id})">🗑️ Delete</button>
//                         </div>
//                     </li>
//                 `;
//             });
//         })
//         .catch(error => {
//             console.error("Error fetching bus stops:", error);
//             alert("⚠️ Failed to load bus stops.");
//         });
// }
function Busstops(busId) {
    currentBusId = busId;  
    document.getElementById("busStopsPopup").classList.add("show");

    fetch(`/ceo/api/buses/${busId}/stops/`)
        .then(response => response.json())
        .then(stops => {
            const tableBody = document.getElementById("busStopsTableBody");
            tableBody.innerHTML = "";

            if (stops.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5">No stops available.</td></tr>`;
                return;
            }

            // Sort stops by index
            stops.sort((a, b) => a.index - b.index);

            stops.forEach(stop => {
                tableBody.innerHTML += `
                    <tr>
                      <td>${stop.index}</td>
                      <td>${stop.title}</td>
                      <td>${stop.lat}</td>
                      <td>${stop.lng}</td>
                      <td>
                        
                        <button class="btns delete" onclick="deleteBusStops(${stop.id})">🗑️</button>
                      </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Error fetching bus stops:", error);
            alert("⚠️ Failed to load bus stops.");
        });
}


// 🚀 Close Bus Stops Popup
function closeBusStopsPopup() {
    document.getElementById("busStopsPopup").classList.remove("show");
}
// 🚀 Show Add Bus Stop Popup
function showAddBusStopPopups() {

  console.log("workinggggg showAddBusStopPopup")
  fetchBusStopss();
    document.getElementById("addBusStopPopup").classList.add("show");
  }
  
  // 🚀 Close Add Bus Stop Popup
  function closeAddBusStopPopup() {
    document.getElementById("addBusStopPopup").classList.remove("show");
    clearBusStopForm();
  }
  
  // 🚀 Save Bus Stop (POST Request)
//   function saveBusStop() {
//     const stopData = {
//       title: document.getElementById("stopTitle").value.trim(),
//       index: parseInt(document.getElementById("stopIndex").value),
//       lat: parseFloat(document.getElementById("stopLat").value),
//       lng: parseFloat(document.getElementById("stopLng").value),
//       bus_id:currentBusId
//     };
  
//     // Validate inputs
//     if (!stopData.title || isNaN(stopData.index) || isNaN(stopData.lat) || isNaN(stopData.lng)) {
//       alert("❗ Please fill in all fields correctly.");
//       return;
//     }
//     console.log(JSON.stringify(stopData,null,2));
// //   bus/<int:bus_id>/add-stop/</int:bus_id>
//     fetch(`/ceo/bus/${currentBusId}/add-stop/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRFToken": getCSRFToken()
//       },
//       body: JSON.stringify(stopData)
//     })
//     .then(response => response.json())
//     .then(data => {
//       if (data.id) {
//         alert("✅ Bus stop added successfully!");
//         closeAddBusStopPopup();  // Close the add stop popup
//         Busstops(currentBusId);  // Refresh stops list
//       } else {
//         alert(`❌ Error: ${JSON.stringify(data)}`);
//       }
//     })
//     .catch(error => {
//       console.error("Error adding bus stop:", error);
//       alert("⚠️ Failed to add bus stop.");
//     });
//   }
let stopsToAdd = []; // Array to store stops before sending

function addStopToList() {
    let selectedStop = document.getElementById("stopSelect").value;
    let stopIndex = parseInt(document.getElementById("stopIndex").value, 10);

    if (!selectedStop || isNaN(stopIndex) || stopIndex < 1) {
        alert("❗ Please select a stop and enter a valid order index.");
        return;
    }

    let stopData = JSON.parse(selectedStop);
    stopData.index = stopIndex;
    stopData.bus_id = currentBusId;

    stopsToAdd.push(stopData); // Add to list

    updateStopListUI();
}

function updateStopListUI() {
    let stopList = document.getElementById("stopList");
    stopList.innerHTML = ""; // Clear list

    stopsToAdd.forEach((stop, i) => {
        let li = document.createElement("li");
        li.textContent = `#${stop.index} - ${stop.title} (${stop.latitude}, ${stop.longitude})`;
        
        // Remove Button
        let removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.onclick = () => {
            stopsToAdd.splice(i, 1);
            updateStopListUI();
        };

        li.appendChild(removeBtn);
        stopList.appendChild(li);
    });
}

function fetchBusStopss() {
  fetch("/ceo/api/bus_stops/")
  .then(response => response.json())
  .then(data => {
      let stopSelect = document.getElementById("stopSelect");
      data.bus_stops.forEach(stop => {
          let option = document.createElement("option");
          option.value = JSON.stringify(stop);  // Store entire stop data as string
          option.textContent = stop.title;
          stopSelect.appendChild(option);
      });
  })
  .catch(error => console.error("Error fetching bus stops:", error));
}

function fillBusStopDetails() {
  let selectedStop = document.getElementById("stopSelect").value;
  if (selectedStop) {
      let stopData = JSON.parse(selectedStop);
      document.getElementById("stopTitle").value = stopData.title;
      document.getElementById("stopLat").value = stopData.latitude;
      document.getElementById("stopLng").value = stopData.longitude;
  } else {
      document.getElementById("stopTitle").value = "";
      document.getElementById("stopLat").value = "";
      document.getElementById("stopLng").value = "";
  }
}
function saveAllStops() {
  if (stopsToAdd.length === 0) {
      alert("⚠️ No stops added. Please add stops before saving.");
      return;
  }

  // Convert stop data fields to match Django expectations
  let formattedStops = stopsToAdd.map(stop => ({
      title: stop.title,
      lat: stop.latitude,  // Match what the backend expects
      lng: stop.longitude,
      index: stop.index,  // Ensure "index" is correctly named
      bus_id: currentBusId
  }));

  console.log("🚀 Sending Bulk Stops:", JSON.stringify({ stops: formattedStops }, null, 2));

  fetch(`/ceo/bus/${currentBusId}/add-stop/`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify({ stops: formattedStops })  // Ensure correct format
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("✅ All bus stops added successfully!");
          stopsToAdd = []; // Clear list
          updateStopListUI(); // Update UI
          closeAddBusStopPopup();
          Busstops(currentBusId); // Refresh stops
      } else {
          alert(`❌ Error: ${data.error || JSON.stringify(data)}`);
      }
  })
  .catch(error => {
      console.error("Error adding stops:", error);
      alert("⚠️ Failed to add stops.");
  });
}


  // 🚀 Clear Bus Stop Form Fields
  function clearBusStopForm() {
    document.getElementById("stopTitle").value = "";
    document.getElementById("stopIndex").value = "";
    document.getElementById("stopLat").value = "";
    document.getElementById("stopLng").value = "";
  }

  function showAddBusStopPopup() {
    document.getElementById("busStopModal").classList.add("show");
  }
  function closeBusStopModal() {
    document.getElementById("busStopModal").classList.remove("show");
    clearBusStopForm();
  }
  function savemainBusStop() {
    const stopData = {
        title: document.getElementById("stopTitless").value.trim(),
        type: document.getElementById("stopType").value.trim(),
        description: document.getElementById("stopDescription").value.trim(),
        latitude: parseFloat(document.getElementById("stopLat2").value),
        longitude: parseFloat(document.getElementById("stopLng2").value),
        icon_url: document.getElementById("stopIconUrl").value.trim() || null
      };
    
    console.log(JSON.stringify(stopData,null,2))
    // 🚀 Validate required inputs
    if (!stopData.title || !stopData.type || isNaN(stopData.latitude) || isNaN(stopData.longitude)) {
      alert("❗ Please fill in all required fields correctly.");
      return;
    }
  
    fetch(`/ceo/bus-stops/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify(stopData)
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to add bus stop");
      return response.json();
    })
    .then(data => {
      alert("✅ Bus stop added successfully!");
      closeBusStopModal();
      fetchBusStops();  // Refresh stops list
    })
    .catch(error => {
      console.error("Error adding bus stop:", error);
      alert("⚠️ Failed to add bus stop.");
    });
  }
  
  function clearBusStopForm() {
    document.getElementById("stopTitle").value = "";
    document.getElementById("stopType").value = "";
    document.getElementById("stopDescription").value = "";
    document.getElementById("stopLat").value = "";
    document.getElementById("stopLng").value = "";
    document.getElementById("stopIconUrl").value = "";
  }
  
  function fetchBusStops() {
    console.log("bus stop working")
    const tableBody = document.getElementById("busstopTableBody");
    tableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;
    
    fetch("/ceo/api/bus-stops/")
      .then(response => response.json())
      .then(stops => {
        tableBody.innerHTML = ""; // Clear loading message
       
        console.log(JSON.stringify(stops,null,2))
        if (stops.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="8">No bus stops available.</td></tr>`;
          return;
        }
  
        stops.forEach((stop, index) => {
          tableBody.innerHTML += `
            <tr>
              <td>${index + 1}</td>
              <td>${stop.title}</td>
              <td>${stop.type}</td>
              <td>${stop.description || "--"}</td>
              <td>${stop.latitude}</td>
              <td>${stop.longitude}</td>
              <td>
                ${stop.icon_url ? `<a href="${stop.icon_url}" target="_blank">🔗 Icon</a>` : "--"}
              </td>
              <td>
                <button class="btns edit" onclick="editBusStop(${stop.id})">✏️ Edit</button>
                <button class="btns delete" onclick="deleteBusStop(${stop.id})">🗑️ Delete</button>
              </td>
            </tr>
          `;
        });
      })
      .catch(error => {
        console.error("Error fetching bus stops:", error);
        tableBody.innerHTML = `<tr><td colspan="8">⚠️ Failed to load bus stops.</td></tr>`;
      });
  }
// 🚀 Fetch bus stops automatically when the page loads
window.onload = fetchBusStops();

  let currentEditingStopId = null;

// 🚀 Open Edit Popup & Populate Fields
function editBusStop(stopId) {
  fetch(`/ceo/api/bus-stops/${stopId}/`)
    .then(response => response.json())
    .then(stop => {
      currentEditingStopId = stop.id;

      document.getElementById("editStopTitle").value = stop.title;
      document.getElementById("editStopType").value = stop.type;
      document.getElementById("editStopDescription").value = stop.description || "";
      document.getElementById("editStopLat").value = stop.latitude;
      document.getElementById("editStopLng").value = stop.longitude;
      document.getElementById("editStopIconUrl").value = stop.icon_url || "";

      document.getElementById("editBusStopModal").classList.add("show");  // Show edit popup
    })
    .catch(error => {
      console.error("Error fetching stop details:", error);
      alert("⚠️ Failed to load stop details.");
    });
}

// 💾 Save Updated Bus Stop
function updateBusStop() {
  if (!currentEditingStopId) return;

  const updatedData = {
    title: document.getElementById("editStopTitle").value.trim(),
    type: document.getElementById("editStopType").value.trim(),
    description: document.getElementById("editStopDescription").value.trim(),
    latitude: parseFloat(document.getElementById("editStopLat").value),
    longitude: parseFloat(document.getElementById("editStopLng").value),
    icon_url: document.getElementById("editStopIconUrl").value.trim() || null
  };

  fetch(`/ceo/api/bus-stops/${currentEditingStopId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken()
    },
    body: JSON.stringify(updatedData)
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to update bus stop");
    return response.json();
  })
  .then(() => {
    alert("✅ Bus stop updated successfully!");
    closeEditBusStopModal();
    fetchBusStops();  // Refresh table
  })
  .catch(error => {
    console.error("Error updating bus stop:", error);
    alert("⚠️ Failed to update bus stop.");
  });
}

// 🛑 Close Edit Modal
function closeEditBusStopModal() {
  document.getElementById("editBusStopModal").classList.remove("show");
  currentEditingStopId = null;
}
let stopIdToDelete = null;

// 🗑️ Show Delete Confirmation Popup
function deleteBusStop(stopId) {
  stopIdToDelete = stopId;
  document.getElementById("deleteConfirmPopup").classList.add("show");
}

// ✅ Confirm Delete
function confirmDeleteBusStop() {
  if (!stopIdToDelete) return;

  fetch(`/ceo/api/bus-stops/${stopIdToDelete}/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": getCSRFToken() }
  })
  .then(response => {
    if (response.ok) {
      alert("✅ Bus stop deleted successfully!");
      fetchBusStops();  // Refresh table
    } else {
      alert("❌ Failed to delete bus stop.");
    }
    closeDeleteConfirmPopup();
  })
  .catch(error => {
    console.error("Error deleting bus stop:", error);
    alert("⚠️ Failed to delete bus stop.");
  });
}

// 🚫 Close Delete Confirmation Popup
function closeDeleteConfirmPopup() {
  document.getElementById("deleteConfirmPopup").classList.remove("show");
  stopIdToDelete = null;
}


function fetchClients() {
  const tableBody = document.getElementById("clientTableBody");
  tableBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  fetch("/ceo/adv-clients/")
    .then(response => response.json())
    .then(data => {
      const clients = data.clients;
      tableBody.innerHTML = "";

      if (clients.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No clients available.</td></tr>`;
        return;
      }

      clients.forEach((client, index) => {
        tableBody.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>
              <button class="btns view" onclick="viewClientAds(${client.id})">View Ads</button>
            </td>
            <td >
            <div style="display: flex; flex-direction: row; gap: 2px;">
              <button class="btns edit" onclick="editClient(${client.id})">Edit</button>
              <button class="btns delete" onclick="deleteClient(${client.id})">Delete</button>
              </div>
            </td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error("Error fetching clients:", error);
      tableBody.innerHTML = `<tr><td colspan="6">⚠️ Failed to load clients.</td></tr>`;
    });
}

// Fetch clients on page load
window.onload = fetchClients();
function searchClients() {
  const query = document.getElementById("clientSearchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#clientTableBody tr");

  rows.forEach(row => {
    const name = row.children[1]?.textContent.toLowerCase();
    const email = row.children[2]?.textContent.toLowerCase();
    const phone = row.children[3]?.textContent.toLowerCase();

    row.style.display = (name.includes(query) || email.includes(query) || phone.includes(query)) ? "" : "none";
  });
}

let currentClientId = null;

function showAddClientPopup() {
  document.getElementById("clientModalTitle").textContent = "Add Client";
  currentClientId = null;
  document.getElementById("clientName").value = "";
  document.getElementById("clientEmail").value = "";
  document.getElementById("clientPhone").value = "";
  document.getElementById("clientModal").classList.add("show");
}

function editClient(clientId) {
  fetch(`/ceo/adv-clients/${clientId}/`)
  .then(response => response.json())
  .then(data => {  // `data` contains `{ client: {...} }`
    if (!data.client) {
      console.error("Client not found in response:", data);
      alert("⚠️ Client not found.");
      return;
    }

    const client = data.client; // Extract the actual client object

    console.log("Client Data:", client);
    currentClientId = client.id;
    document.getElementById("clientModalTitle").textContent = "Edit Client";
    document.getElementById("clientName").value = client.name;
    document.getElementById("clientEmail").value = client.email;
    document.getElementById("clientPhone").value = client.phone;
    document.getElementById("clientModal").classList.add("show");
  })
  .catch(error => {
    console.error("Error fetching client:", error);
    alert("⚠️ Failed to fetch client data.");
  });

}

function closeClientModal() {
  document.getElementById("clientModal").classList.remove("show");
}
function saveClient() {
  console.log("currentClientId",currentClientId)
  const clientData = {
    name: document.getElementById("clientName").value.trim(),
    email: document.getElementById("clientEmail").value.trim(),
    phone: document.getElementById("clientPhone").value.trim()
  };

  const method = currentClientId ? "PUT" : "POST";
  const url = currentClientId ? `/ceo/adv-client/update/${currentClientId}/` : "/ceo/adv-clients/add/";

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken()
    },
    body: JSON.stringify(clientData)
  })
    .then(response => response.json())
    .then(() => {
      alert(`✅ Client ${currentClientId ? "updated" : "added"} successfully!`);
      closeClientModal();
      fetchClients();
    })
    .catch(error => {
      console.error("Error saving client:", error);
      alert("⚠️ Failed to save client.");
    });
}
let clientIdToDelete = null;

function deleteClient(clientId) {
  clientIdToDelete = clientId;
  document.getElementById("deleteClientPopup").classList.add("show");
}

function confirmDeleteClient() {
  if (!clientIdToDelete) return;

  fetch(`/ceo/adv-client/delete/${clientIdToDelete}/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": getCSRFToken() }
  })
    .then(response => {
      if (response.ok) {
        alert("✅ Client deleted successfully!");
        fetchClients();
      } else {
        alert("❌ Failed to delete client.");
      }
      closeDeleteClientPopup();
    })
    .catch(error => {
      console.error("Error deleting client:", error);
      alert("⚠️ Failed to delete client.");
    });
}

function closeDeleteClientPopup() {
  document.getElementById("deleteClientPopup").classList.remove("show");
  clientIdToDelete = null;
}
let cClientId = null;
let currentAdId = null;

function viewClientAds(clientId) {
  console.log("advclientid",clientId)

  cClientId = clientId;
  document.getElementById("advertisementPopup").classList.add("show");
  fetchAdvertisementsByClient(clientId);
}

function fetchAdvertisementsByClient(clientId) {
  const tableBody = document.getElementById("advertisementTableBody");
  tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  fetch(`/ceo/advertisements/client/${clientId}/`)
    .then(response => response.json())
    .then(data => {
      const ads = data.advertisements;
      tableBody.innerHTML = "";

      if (ads.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No advertisements found.</td></tr>`;
        return;
      }
      console.log("ads",JSON.stringify(ads,null,2))
      ads.forEach((ad, index) => {
        tableBody.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${ad.title}</td>
            <td>${ad.description}</td>
            <td>${ad.lat}</td>
            <td>${ad.lng}</td>
            <td>${ad.image ? `<img src="${ad.image}" width="50" height="50">` : "No Image"}</td>
            <td >
            <div style="display: flex; flex-direction: row; gap: 2px;">
              <button class="btns edit" onclick="editAdvertisement(${ad.id})">Edit</button>
              <button class="btns delete" onclick="deleteAdvertisement(${ad.id})">Delete</button>
              <div>
            </td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error("Error fetching advertisements:", error);
      tableBody.innerHTML = `<tr><td colspan="7">⚠️ Failed to load advertisements.</td></tr>`;
    });
}

function closeAdPopup() {
  document.getElementById("advertisementPopup").classList.remove("show");
  currentClientId = null;
}
function showAddAdForm() {
  currentAdId = null;
  document.getElementById("adFormTitle").textContent = "Add Advertisement";
  document.getElementById("adTitle").value = "";
  document.getElementById("adDescription").value = "";
  document.getElementById("adLat").value = "";
  document.getElementById("adLng").value = "";
  document.getElementById("adImage").value = "";
  document.getElementById("adFormPopup").classList.add("show");
}

function editAdvertisement(adId) {
  console.log("advid",adId)
  currentAdId = adId;
  document.getElementById("adFormTitle").textContent = "Edit Advertisement";

  fetch(`/ceo/advertisements/update/${adId}/`)
    .then(response => {  console.log("Fetch response:", response); // Log the raw response
      return response.json();})
    .then(ad => {
      console.log("Advertisement data received:", ad); // Log the parsed advertisement data
      document.getElementById("adTitle").value = ad.data.title;
      document.getElementById("adDescription").value = ad.data.description;
      document.getElementById("adLat").value = ad.data.lat;
      document.getElementById("adLng").value = ad.data.lng;
      console.log("Form fields updated with advertisement data."); // Log after updating form fields
      document.getElementById("adFormPopup").classList.add("show");
      console.log("Advertisement form popup displayed."); // Log when popup is shown
    })
    .catch(error => console.error("Error fetching advertisement:", error));
}

function closeAdForm() {
  document.getElementById("adFormPopup").classList.remove("show");
}
function saveAdvertisement() {
  console.log("clintid",cClientId)
  const formData = new FormData();
  formData.append("title", document.getElementById("adTitle").value.trim());
  formData.append("description", document.getElementById("adDescription").value.trim());
  formData.append("lat", parseFloat(document.getElementById("adLat").value));
  formData.append("lng", parseFloat(document.getElementById("adLng").value));
  if (document.getElementById("adImage").files[0]) {
    formData.append("image", document.getElementById("adImage").files[0]);
  }
  formData.append("client", cClientId);

  const method = currentAdId ? "PUT" : "POST";
  const url = currentAdId
    ? `/ceo/advertisements/update/${currentAdId}/`
    : "/ceo/advertisements/add/";

  fetch(url, {
    method: method,
    headers: { "X-CSRFToken": getCSRFToken() },
    body: formData
  })
    .then(response => response.json())
    .then(() => {
      alert(`✅ Advertisement ${currentAdId ? "updated" : "added"} successfully!`);
      closeAdForm();
      fetchAdvertisementsByClient(cClientId);
    })
    .catch(error => {
      console.error("Error saving advertisement:", error);
      alert("⚠️ Failed to save advertisement.");
    });
}

function deleteAdvertisement(adId) {
  if (!confirm("❗ Are you sure you want to delete this advertisement?")) return;

  fetch(`/ceo/advertisements/delete/${adId}/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": getCSRFToken() }
  })
    .then(response => {
      if (response.ok) {
        alert("✅ Advertisement deleted successfully!");
        fetchAdvertisementsByClient(cClientId);
      } else {
        alert("❌ Failed to delete advertisement.");
      }
    })
    .catch(error => console.error("Error deleting advertisement:", error));
}


document.addEventListener("DOMContentLoaded", () => {
  renderBusesPerOwnerChart();
  renderAdsPerClientChart();
  renderBusStopsPieChart();
  renderBusPositionsLineChart();
});

// 🚍 Buses per Owner - Bar Chart
function renderBusesPerOwnerChart() {
  fetch("/ceo/analysis/buses-per-owner/")
    .then(res => res.json())
    .then(data => {
      const ctx = document.getElementById("busesPerOwnerChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map(d => d.owner),
          datasets: [{
            label: "Buses per Owner",
            data: data.map(d => d.bus_count),
            backgroundColor: "rgba(75, 192, 192, 0.7)",
          }]
        },
        options: { responsive: true }
      });
    });
}

// 📢 Ads per Client - Bar Chart
function renderAdsPerClientChart() {
  fetch("/ceo/analysis/ads-per-client/")
    .then(res => res.json())
    .then(data => {
      const ctx = document.getElementById("adsPerClientChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map(d => d.client),
          datasets: [{
            label: "Ads per Client",
            data: data.map(d => d.ads_count),
            backgroundColor: "rgba(153, 102, 255, 0.7)",
          }]
        },
        options: { responsive: true }
      });
    });
}

// 🚌 Bus Stops Distribution - Pie Chart
function renderBusStopsPieChart() {
  fetch("/ceo/analysis/bus-stops-distribution/")
    .then(res => res.json())
    .then(data => {
      const ctx = document.getElementById("busStopsPieChart").getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: data.map(d => d.bus),
          datasets: [{
            data: data.map(d => d.stops),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
          }]
        },
        options: { responsive: true }
      });
    });
}

// 📈 Bus Positions Over Time - Line Chart
function renderBusPositionsLineChart() {
  fetch("/ceo/analysis/bus-positions-over-time/")
    .then(res => res.json())
    .then(data => {
      const ctx = document.getElementById("busPositionsLineChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map(d => d.day),
          datasets: [{
            label: "Bus Position Updates",
            data: data.map(d => d.count),
            borderColor: "#FF6384",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: true
          }]
        },
        options: { responsive: true }
      });
    });
}


function deleteBusStops(stopId) {
  console.log("workingdlt")
  document.getElementById("deleteStopId").value = stopId;
  document.getElementById("deleteBusStopPopup").classList.add("show");
}
function closeDeletePopup() {
  document.getElementById("deleteBusStopPopup").classList.remove("show");
}

function confirmDeleteBusStop() {
  let stopId = document.getElementById("deleteStopId").value;

  fetch(`/ceo/api/bus_stop/${stopId}/delete/`, {
      method: "DELETE",
      headers: {
          "X-CSRFToken": getCSRFToken()
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("✅ Bus stop deleted successfully!");
          closeDeletePopup();
          Busstops(currentBusId); // Refresh stops list
      } else {
          alert(`❌ Error: ${JSON.stringify(data)}`);
      }
  })
  .catch(error => {
      console.error("Error deleting bus stop:", error);
      alert("⚠️ Failed to delete bus stop.");
  });
}
