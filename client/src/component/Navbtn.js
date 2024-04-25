import React from 'react';

function Navbtn({ destination }) {
  return (
    <a href={`/${destination}`} className="btn btn-primary">{destination}</a>
  );
}

export default Navbtn;
