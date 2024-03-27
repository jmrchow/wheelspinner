'use client'

import { useState, useEffect } from 'react'
import "./Modal.css";

export default function Modal() {
  const[showModal, setShowModal] = useState(true)



  const openModal = (event) => {
  document.body.classList.add('active-modal');
  setShowModal(true); 
}
 const hideModal = (event) => {
  document.body.classList.remove('active-modal');
  setShowModal(false)  }
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
    setIsValid(validateEmail(inputValue));
  };

  const validateEmail = (email) => {
    // Regular expression for basic email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  //   const onConfirmHandle = () => {
  //   const { error } = await supabase
  // .from('emails')
  // .insert({ email })
  // }

  useEffect( () => {openModal()}, [])

  return (
    <>
  <button
      onClick={openModal}
      className="btn-modal">
      Test Modal
  

    </button>

{showModal && (
    <div className="modal">
        <div className="overlay" onClick={hideModal}></div>
        <div className="modal-content">
          <button className="close-button" onClick={hideModal}>X</button>
          <h2>Give us your email to spin!</h2>
          <p> Something about giving the email and why we're taking the email.</p>
              <div>
      <input className="email-input"
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={handleInputChange}
        placeholder="email"
        required
      />
    </div>          <button className="confirm-button" onClick={hideModal} disabled={!isValid}>Confirm</button>
        </div>
      </div>)}
</>
  )


}



