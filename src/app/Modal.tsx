"use client";

import { useState, useEffect } from "react";
import "./Modal.css";

import { supabase } from "./supabaseClient";

export default function Modal({ onEmailSubmit, eventId }) {
  const [showModal, setShowModal] = useState(true);

  const openModal = (event) => {
    document.body.classList.add("active-modal");
    setShowModal(true);
  };
  const hideModal = (event) => {
    document.body.classList.remove("active-modal");
    setShowModal(false);
  };
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    openModal();
  }, []);

  const onConfirmHandle = async () => {
    const { data, error } = await supabase
      .from("Emails")
      .insert([{ email: email, event: eventId }])
      .select();
    onEmailSubmit(email);
    if (error) {
      setErrorMessage("Invalid Email");
    } else {
      hideModal();
    }
  };

  return (
    <>
      {showModal && (
        <div className="modal">
          <div className="overlay"></div>
          <div className="modal-content">
            <button className="close-button" onClick={hideModal}>
              X
            </button>
            <h2>Give us your email to spin!</h2>
            <p>
              Something about giving the email and why we're taking the email.
            </p>
            <div>
              <input
                className="email-input"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="email"
                required
              />
              <span>{errorMessage}</span>
            </div>{" "}
            <button
              className="confirm-button"
              onClick={onConfirmHandle}
              disabled={!isValid}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}
