import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Navbtn from '../component/Navbtn';

const Calendar = () => {
 /* Set the state of the backend data */
 const [backendData, setBackendData] = useState([]);

 /* Fetch the data from the backend API */
 useEffect(() => {
    const fetchData = async () => {
      try {
        /* Fetch the json data from the backend API by the login */
        const response = await fetch('/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({login: sessionStorage.getItem('username')}),
        });

        if (!response.ok) {
          console.log('Failed to fetch data');
          return;
        }

        const data = await response.json();
        setBackendData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    /* If the username is stored in the session storage, fetch the data */
    if (sessionStorage.getItem('username')) {
      fetchData();
    }
 }, []);

 /* Map the backend data to the event list */
 const eventList = backendData.map((event, index) => ({
    title: event.title,
    start: event.start,
    end: event.end,
    location: event.summary,
    id: index.toString(),
 }));

 return (
    <>
      <Navbtn destination="Salleslibres"/>
      <FullCalendar       /* Render the calendar with the event list */
         plugins={[dayGridPlugin]} initialView="dayGridMonth" events={eventList} />
    </>
 );
};

export default Calendar;
