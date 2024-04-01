"use client";

import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./page.module.css";
import SinglePrizeEntry from "./SinglePrizeEntry";

export default function AdminPage() {
  const [prizeEntryList, setPrizeEntryList] = useState([{}]);

  const [eventList, setEventList] = useState([{ id: "", eventName: "" }]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedEventName, setSelectedEventName] = useState("");
  const [rigNumber, setRigNumber] = useState(""); // State to hold the value of the input

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
    const { data, error } = await supabase
      .from("Wheels")
      .insert({ eventName: "New Event", data: [{}] })
      .select()
      .single();
    console.log(data);
    setSelectedEvent(data.id);
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
    }
    if (selectedEvent) {
      getEventData();
    }
  }, [selectedEvent]);

  useEffect(() => {
    async function getEvents() {
      const { data, error } = await supabase.from("Wheels").select(`*`);
      setEventList(data);
    }
    getEvents();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.sideBar}>
        <button onClick={handleCreateEvent}>Create Event</button>
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
          <h1>{selectedEventName}</h1>
          <button onClick={handleActiveEventChange}>Make Active</button>
          <div className={styles.wheelConfigContainer}>
            <div className={styles.leftSide}>
              <div className={styles.wheelContainer}></div>
              <p>Wheel preview here</p>
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
              {Object.keys(prizeEntryList[0]).length > 0 &&
                prizeEntryList.map((prizeEntry, index) => (
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
        </div>
      )}
    </main>
  );
}
