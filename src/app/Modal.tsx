'use client'

import { useState } from 'react'
import "./Modal.css"

export default function Modal() {
  const[modal, setModal] = useState(false)

  const toggleModal = () => {setModal(!modal)}

  if (modal){
    document.body.classList.add('active-modl');
  }
  else {
    document.body.classList.remove('active-modl');
  }
  return (
    <>
  <button
      onClick={toggleModal}
      className="btn-modal">
      Test Modal
  

    </button>

{modal && (
    <div className="modal">
        <div className="overlay" onClick={toggleModal}></div>
        <div className="modal-content">
          <h2>Give us your email to spin!</h2>
          <p> Something about giving the email and why we're taking the email.</p>
          <input className="emailInput" placeholder="email"></input>
          <button onClick={toggleModal}>Confirm</button>
        </div>
      </div>)}
</>
  )


}



