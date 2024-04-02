"use client";

import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./page.module.css";
import SinglePrizeEntry from "./SinglePrizeEntry";

export default function AdminPage() {
  const [prizeEntryList, setPrizeEntryList] = useState([]);

  const [eventList, setEventList] = useState([{ id: "", eventName: "" }]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedEventName, setSelectedEventName] = useState("");
  const [rigNumber, setRigNumber] = useState(""); // State to hold the value of the input

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [emailList, setEmailList] = useState([]);

  const handleRigNumberChange = (event) => {
    setRigNumber(event.target.value); // Update the state with the new value when input changes
  };

  const handleActiveEventChange = async (event) => {
    const { deleteError } = await supabase
      .from("ActiveEvent")
      .delete()
      .eq("forDeletion", 0);

    const { insertError } = await supabase
      .from("ActiveEvent")
      .insert({ id: selectedEvent });
  };

  const handleCreateEvent = async (event) => {
    const defaultPrizeEntry = {
      prizeName: "",
      size: "",
      probability: "",
      isGrandPrize: false,
    };

    const { data, error } = await supabase
      .from("Wheels")
      .insert({ eventName: "New Event", data: [defaultPrizeEntry] })
      .select()
      .single();

    console.log(data);
    setSelectedEvent(data.id);
    setPrizeEntryList([defaultPrizeEntry]); // Initialize with default entry
    getEvents();
  };

  const handlePrizeEntryChange = (index, updatedPrizeEntry) => {
    // Parse size to number if it's a string and not empty
    if (
      typeof updatedPrizeEntry.size === "string" &&
      updatedPrizeEntry.size.trim() !== ""
    ) {
      updatedPrizeEntry.size = parseInt(updatedPrizeEntry.size);
    }

    // Parse probability to number if it's a string and not empty
    if (
      typeof updatedPrizeEntry.probability === "string" &&
      updatedPrizeEntry.probability.trim() !== ""
    ) {
      updatedPrizeEntry.probability = parseInt(updatedPrizeEntry.probability);
    }
    const updatedList = [...prizeEntryList];
    updatedList[index] = updatedPrizeEntry;
    setPrizeEntryList(updatedList);
  };

  const handleAddPrizeEntry = () => {
    setPrizeEntryList([
      ...prizeEntryList,
      { prizeName: "", size: "", probability: "", isGrandPrize: false },
    ]);
  };

  const handleAddGrandPrizeEntry = () => {
    setPrizeEntryList([
      ...prizeEntryList,
      { prizeName: "", size: "", probability: "", isGrandPrize: true },
    ]);
  };

  const handleRemovePrizeEntry = (indexToRemove) => {
    const updatedList = prizeEntryList.filter(
      (_, index) => index !== indexToRemove,
    );
    setPrizeEntryList(updatedList);
  };

  const handleSave = async () => {
    console.log(prizeEntryList);
    const { error } = await supabase
      .from("Wheels")
      .update({ rigNumber: rigNumber, data: prizeEntryList })
      .eq("id", selectedEvent);
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEvent(eventId);
  };

  async function getEvents() {
    const { data, error } = await supabase
      .from("Wheels")
      .select(`*`)
      .eq("isArchived", false);
    setEventList(data);
  }

  const handleDeleteEvent = async () => {
    const { error } = await supabase
      .from("Wheels")
      .update({ isArchived: true })
      .eq("id", selectedEvent);
    getEvents();
    setSelectedEvent("");
  };

  const handleSaveEditEventName = async (editedEventName) => {
    const { data, error } = await supabase
      .from("Wheels")
      .update({ eventName: editedEventName })
      .eq("id", selectedEvent)
      .select()
      .single();
    getEvents();
    setSelectedEventName(data.eventName);
    setPrizeEntryList(data.data);
    setRigNumber(data.rigNumber);
    closeEditModal(); // Close the modal after editing
  };
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const renderModal = () => {
    return (
      <EditEventModal
        eventName={selectedEventName}
        onSave={(newEventName) => {
          handleSaveEditEventName(newEventName);
          closeEditModal();
        }}
        onCancel={closeEditModal}
      />
    );
  };
  const getEmailData = async () => {
    const { data, error } = await supabase
      .from("Emails")
      .select("*")
      .eq("event", selectedEvent);
    console.log(data);
    setEmailList(data);
  };
  useEffect(() => {
    async function getEventData() {
      const { data, error } = await supabase
        .from("Wheels")
        .select(`*`)
        .eq("id", selectedEvent)
        .single();
      console.log(data);
      setSelectedEventName(data.eventName);
      setPrizeEntryList(data.data);
      setRigNumber(data.rigNumber);
    }

    if (selectedEvent) {
      getEventData();
      getEmailData();
    }
  }, [selectedEvent]);

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.sideBar}>
        <button
          className={styles.createEventButton}
          onClick={handleCreateEvent}
        >
          Create Event
        </button>
        {eventList.map((event, index) => (
          <button
            className={styles.eventButton}
            key={event.id}
            onClick={() => handleSelectEvent(event.id)}
          >
            {event.eventName}
          </button>
        ))}
      </div>

      {selectedEvent && (
        <div className={styles.dashboardContainer}>
          <h1>
            {selectedEventName}
            <button
              className={styles.editEventNameButton}
              onClick={openEditModal}
            >
              Edit
            </button>
            {isEditModalOpen && renderModal()}
          </h1>
          <button
            className={styles.makeActiveButton}
            onClick={handleActiveEventChange}
          >
            Make Active
          </button>
          <button className={styles.deleteButton} onClick={handleDeleteEvent}>
            Delete Event
          </button>
          <div className={styles.wheelConfigContainer}>
            <div className={styles.leftSide}>
              <div className={styles.wheelContainer}>
                <p>Wheel preview here</p>
              </div>

              <label>
                Rig
                <input
                  type="text"
                  value={rigNumber} // Bind input value to the state
                  onChange={handleRigNumberChange} // Update state when input changes
                />
              </label>
            </div>
            <div className={styles.rightSide}>
              <label>Prize Name</label>
              <label>Size</label>
              <label>% Chance</label>
              {prizeEntryList.map((prizeEntry, index) => (
                <SinglePrizeEntry
                  key={index}
                  index={index}
                  prizeEntry={{ ...prizeEntry }}
                  onChange={handlePrizeEntryChange}
                  onRemove={handleRemovePrizeEntry}
                />
              ))}
              <button onClick={handleAddPrizeEntry}>Add P</button>
              <button onClick={handleAddGrandPrizeEntry}>Add GP</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
          <div>
            <h1>Emails</h1>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Email</th>
                  <th>Prize</th>
                </tr>
              </thead>
              <tbody>
                {emailList.map((email) => (
                  <tr key={email.email}>
                    <td>{email.created_at}</td>
                    <td>{email.email}</td>
                    <td>{email.prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

const EditEventModal = ({ eventName, onSave, onCancel }) => {
  console.log(eventName);
  const [editedEventName, setEditedEventName] = useState(eventName);

  const handleSave = () => {
    onSave(editedEventName);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className={styles.modal}>
      <input
        type="text"
        value={editedEventName}
        onChange={(e) => setEditedEventName(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};
