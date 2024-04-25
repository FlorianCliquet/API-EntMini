// Import React and necessary hooks from React library
import React, { useState, useEffect } from 'react';
// Import Card and Alert components from react-bootstrap for UI elements
import { Card, Alert } from 'react-bootstrap';

// Define a functional component named Salleslibres that takes an events prop
const Salleslibres = ({ events }) => {
 // Initialize state to hold the current time
 const [currentTime, setCurrentTime] = useState(new Date());

 // Use useEffect to set up an interval that updates currentTime every minute
 useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
 }, []);

 // Function to check if any event is currently happening in the given times
 const isBusy = (times) => {
    const currentTimeDate = new Date(currentTime);
    return times.some(eventTimes => {
      return eventTimes.some(time => {
        // Skip if date or startTime is undefined
        if (!time.date || !time.startTime || !time.endTime) return false;
        // Parse date and time strings into Date objects
        const [month, day, year] = time.date.split('/');
        const [startHour, startMinute] = time.startTime.split(':');
        const [endHour, endMinute] = time.endTime.split(':');
        const eventStartDate = new Date(year, month - 1, day, startHour, startMinute);
        const eventEndDate = new Date(year, month - 1, day, endHour, endMinute);
        // Check if the current time is within the event's start and end times
        return currentTimeDate >= eventStartDate && currentTimeDate <= eventEndDate;
      });
    });
 };

 // Function to find the next available time slot
 const findNextAvailableTime = (times) => {
    const currentTimeDate = new Date(currentTime);
    // Sort times by start time
    const sortedTimes = times.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });
    // Find the next event that starts after the current time
    const nextAvailableEvent = sortedTimes.find(time => {
      if (!time.date || !time.startTime) return false; // Skip if date or startTime is undefined
      const eventStart = new Date(`${time.date}T${time.startTime}`);
      return currentTimeDate < eventStart;
    });
    // Return the next available event or a message if no events are available
    if (nextAvailableEvent) {
      return { date: nextAvailableEvent.date, hours: `${nextAvailableEvent.startTime}-${nextAvailableEvent.endTime}` };
    } else {
      return { date: 'No more events', hours: '' };
    }
 };

 // Group events by building and room
 const groupedEvents = events.reduce((acc, event) => {
    const buildingName = event.buildingCode;
    const roomName = event.roomName;

    if (!acc[buildingName]) {
      acc[buildingName] = {};
    }
    if (!acc[buildingName][roomName]) {
      acc[buildingName][roomName] = [];
    }
    acc[buildingName][roomName].push(event);

    return acc;
 }, {});

 // Render the component
 return (
    <div>
      {groupedEvents &&
        Object.keys(groupedEvents).map((buildingName, index) => (
          <div key={buildingName}>
            <h2>{`Building ${buildingName}`}</h2>
            {Object.keys(groupedEvents[buildingName]).map((roomName, idx) => {
              const times = groupedEvents[buildingName][roomName].map(event => {
                return event.events.map(eventObj => {
                 return {
                    date: eventObj.date,
                    startTime: eventObj.startTime,
                    endTime: eventObj.endTime
                 };
                });
              });
              const nextAvailableTime = findNextAvailableTime(times);
              return (
                <div key={roomName}>
                 <h3>{`Room: ${roomName}`}</h3>
                 <Card style={{ width: '18rem', margin: '1rem' }}>
                    <Card.Body>
                      <Card.Title>{roomName}</Card.Title>
                      <Card.Text>
                        {isBusy(times) ? (
                          <>
                            <Alert variant="danger">Occupied</Alert>
                            <p>Occupied until: {nextAvailableTime}</p>
                          </>
                        ) : (
                          <>
                            <Alert variant="success">Free</Alert>
                            <p>Available until: {nextAvailableTime}</p>
                          </>
                        )}
                      </Card.Text>
                    </Card.Body>
                 </Card>
                </div>
              );
            })}
          </div>
        ))}
    </div>
 );
};

// Export the Salleslibres component
export default Salleslibres;
