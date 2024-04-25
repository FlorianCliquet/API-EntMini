import React, { useState, useEffect } from 'react';
import Calendar from "./pages/Calendar"; 
import Connect from "./pages/Connect";
import Salleslibres from './pages/Salleslibres';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    // State to hold flattened events data
    const [flattenedEvents, setFlattenedEvents] = useState([]);

    useEffect(() => {
        // Async function to fetch and process dataset
        async function fetchDataset() {
            try {
                // Fetch dataset from the backend
                const response = await fetch('/test2');
                const data = await response.json();

                // Initialize object to group events by building and room
                const groupedEvents = {};

                // Process each building's data
                data?.forEach(building => {
                    const buildingCode = Object.keys(building)[0];
                    // Extract building and room names
                    const { buildingCode: bCode, roomName } = extractBuildingAndRoom(buildingCode);
                    if (!bCode || !roomName) {
                        console.error("Failed to extract building and room info for", buildingCode);
                        return;
                    }
                    
                    // Initialize roomNames object
                    const roomNames = {};
                    roomNames[buildingCode] = roomName;

                    // Group events by building and room
                    building[buildingCode].forEach(event => {
                        const eventKey = `${bCode}-${roomName}`;
                        if (!groupedEvents[eventKey]) {
                            groupedEvents[eventKey] = [];
                        }
                        groupedEvents[eventKey].push({
                            startTime: event[0].hours,
                            endTime: event[1].hours,
                            date: event[0].date,
                            data: event[2]
                        });
                    });
                });

                // Sort events by date
                Object.keys(groupedEvents).forEach(key => {
                    groupedEvents[key].sort((a, b) => new Date(a.date) - new Date(b.date));
                });

                // Process and flatten events
                const processedEvents = Object.keys(groupedEvents).map(key => {
                    const { buildingCode, roomName } = extractBuildingAndRoom(key);
                    if (!buildingCode || !roomName) {
                        console.error("(2) Failed to extract building and room info for", key);
                        return null;
                    }

                    const eventsInParisTime = groupedEvents[key].map(event => ({ ...event }));
                    return {
                        buildingCode: buildingCode.replace(/_/g, ' '),
                        roomName: roomName.replace(/_/g, ' '),
                        events: eventsInParisTime
                    };
                }).filter(event => event !== null);

                // Update state with processed events
                setFlattenedEvents(processedEvents);
            } catch (error) {
                console.error("Error fetching dataset:", error);
                // Handle error appropriately
            }
        }

        // Call the fetchDataset function
        fetchDataset();
    }, []);

    // Function to extract building and room names from filename
    function extractBuildingAndRoom(filename) {
      const parts = filename.split('-');
      if (parts.length >= 3) {
          const buildingCode = parts[0];
          let roomType = parts[1];
          let roomCode = parts.slice(2).join('-');
  
          // Check if roomType appears in roomCode
          if (roomCode.toLowerCase().includes(roomType.toLowerCase())) {
              return { buildingCode, roomName: `${roomCode}` };
          }
          else{
          return { buildingCode, roomName: `${roomType}_${roomCode}` };
          }
      }
      if(parts.length === 2){
          const buildingCode = parts[0];
          const roomType = parts[1];
          return { buildingCode, roomName: roomType };
      }
      return {};
    }
  

    // Render the app with routing
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Connect />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/salleslibres" element={<Salleslibres events={flattenedEvents} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
