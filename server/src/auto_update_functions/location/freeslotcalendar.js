const fs = require('fs');

async function processEvents(everySlotData) {
    try {
      const initialData = everySlotData;
      const transformedData = [];
  
      initialData.forEach(building => {
        Object.entries(building).forEach(([buildingAndRoom, eventsArray]) => {
          const [buildingCode, roomName] = buildingAndRoom.split('-');
  
          // Directly ensure eventsArray is an array
          if (!Array.isArray(eventsArray)) {
            eventsArray = [eventsArray];
          }
  
          eventsArray.forEach(event => {
            let [timeSlots, timeSlots2, datax] = event;
  
            // Ensure timeSlots is an array
            if (!Array.isArray(timeSlots)) {
              timeSlots = [timeSlots];
            }
  
            const startTime = timeSlots[0].hours;
            const endTime = timeSlots2.hours;
            const date = timeSlots[0].date;
  
            transformedData.push({
              buildingCode,
              roomName,
              events: {
                startTime,
                endTime,
                date,
                data: datax
              }
            });
          });
        });
      });
  
      // Now process the transformed data
      const groupedEvents = new Map();
  
      transformedData.forEach(event => {
        const key = `${event.buildingCode}-${event.roomName}`;
        const existingEvent = groupedEvents.get(key);
  
        if (!existingEvent) {
          groupedEvents.set(key, [event]);
        } else {
          existingEvent.push(event);
          groupedEvents.set(key, existingEvent);
        }
      });
  
      // Sort and format events within each group
      groupedEvents.forEach((events, key) => {
        events.sort((a, b) => new Date(a.events.date) - new Date(b.events.date));
        events.forEach(event => {
          event.events.date = formatDate(event.events.date);
          // Format event data
          event.events = {
            startTime: event.events.startTime,
            endTime: event.events.endTime,
            date: event.events.date,
            data: event.events.data
          };
        });
      });
  
      // Convert Map to array and sort by date of the first event
      const sortedEvents = Array.from(groupedEvents, ([key, events]) => ({
        buildingName: key.split("-")[0],
        Salle: key.split("-")[1],
        events: events.map(event => ({
          startTime: event.events.startTime,
          endTime: event.events.endTime,
          date: event.events.date,
          data: event.events.data
        }))
      })).sort((a, b) => new Date(a.events[0].date) - new Date(b.events[0].date));
  
      // Write the sorted events to a new file
      fs.writeFile('./src/out/formatted_events.json', JSON.stringify(sortedEvents, null, 2), (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('Events sorted and saved to formatted_events.json');
      });
  
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  
    // Helper function to convert date format
    function formatDate(date) {
      const [month, day, year] = date.split("/");
      return `${month}/${day}/${year}`;
    }
  }
  
  module.exports = processEvents;
  