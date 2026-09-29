import React, { useState } from 'react';

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header >

      <div>
        <span></span>
        <h1 >LifeLink</h1>
      </div>

      <nav >
        <a href="#" >Home</a>
        <a href="#" >Requests</a>
        <a href="#" >Donate</a>
        <a href="#" >Profile</a>
      </nav>




      {open && (
        <nav className="class-nav">
          <a href="#" >Home</a>
          <a href="#" >Requests</a>
          <a href="#" >Donate</a>
          <a href="#" >Profile</a>
        </nav>
      )}
    </header>
  );
}

export default Navbar;