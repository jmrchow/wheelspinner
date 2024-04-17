"use client";

import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./page.module.css";
import SinglePrizeEntry from "./SinglePrizeEntry";
import {
  sortByDate,
  sortByEmail,
  sortByPrize,
  filterEmailList,
  sortByDateReversed,
  sortByPrizeReversed,
} from "./sortFunctions.tsx";
import { mkConfig, generateCsv, download } from "export-to-csv";

export default function AdminPage() {
  const [prizeEntryList, setPrizeEntryList] = useState([]);

  const [eventList, setEventList] = useState([{ id: "", eventName: "" }]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedEventName, setSelectedEventName] = useState("");
  const [rigNumber, setRigNumber] = useState(""); // State to hold the value of the input

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [emailList, setEmailList] = useState([]);
  const [filteredEmailList, setFilteredEmailList] = useState([]);
  const [sortedEmailList, setSortedEmailList] = useState([]);

  const [sortFunction, setSortFunction] = useState();
  const [searchString, setSearchString] = useState("");

  const myChart = useRef(null);
  const chartContainer = useRef(null);

  const handleRigNumberChange = (event) => {
    setRigNumber(event.target.value); // Update the state with the new value when input changes
  };

  const handleActiveEventChange = async (event) => {
    handleSave();
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
      isGrandPrize: true,
    };

    const { data, error } = await supabase
      .from("Wheels")
      .insert({ eventName: "New Event", data: [defaultPrizeEntry] })
      .select()
      .single();

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
    const sortedEmailList = data.toSorted(sortByDate);
    setEmailList(sortedEmailList);
  };

  const handleOnSortByDate = () => {
    if (sortFunction === sortByDate) {
      setSortFunction(() => sortByDateReversed);
    } else {
      setSortFunction(() => sortByDate);
    }
  };

  const handleOnSortByPrize = () => {
    if (sortFunction === sortByPrize) {
      setSortFunction(() => sortByPrizeReversed);
    } else {
      setSortFunction(() => sortByPrize);
    }
  };

  const handleExportEmails = () => {
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      filename: "emaillist",
    });
    const csvData = JSON.parse(JSON.stringify(sortedEmailList));
    for (let i = 0; i < csvData.length; i++) {
      console.log(csvData[i]);
      csvData[i].event = selectedEventName;
      csvData[i].created_at = new Date(csvData[i].created_at).toLocaleString();
      if (csvData[i].prize === null) {
        csvData[i].prize = "";
      }
    }

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

  useEffect(() => {
    async function getEventData() {
      const { data, error } = await supabase
        .from("Wheels")
        .select(`*`)
        .eq("id", selectedEvent)
        .single();
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

  useEffect(() => {
    if (selectedEvent) {
      let fetchedData = prizeEntryList;
      let colors = ["#F1AF04", "#64CBF3", "#82B11D"];
      let labels = [];
      let sizes = [];
      let segmentColors = [];
      let segmentBordersColor = [];
      let segmentBordersWidth = [];

      for (let i = 0; i < fetchedData.length; i++) {
        labels.push(fetchedData[i].prizeName);
        sizes.push(fetchedData[i].size);
        if (fetchedData[i].isGrandPrize) {
          segmentColors.push("#F14886");
          segmentBordersColor.push("gold");
          segmentBordersWidth.push(5);
        } else {
          let color = colors[i % colors.length];
          if (i === fetchedData.length - 1 && color === segmentColors[0]) {
            // Generate a random index that's not the first or last index
            let randomIndex =
              Math.floor(Math.random() * (colors.length - 2)) + 1;
            color = colors[randomIndex];
          }
          segmentColors.push(color);
          segmentBordersColor.push("rgba(0, 0, 0, 0.1)");
          segmentBordersWidth.push(1);
        }
      }

      Chart.register(ChartDataLabels);

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Weekly Sales",
            data: sizes,
            backgroundColor: segmentColors,
            borderColor: segmentBordersColor, // Border color with some transparency
            borderWidth: segmentBordersWidth, // Set the border width
            borderAlign: "inner",
            borderJoinStyle: "miter",
            rotation: 0,
          },
        ],
      };

      const config = {
        type: "pie",
        data,
        options: {
          plugins: [ChartDataLabels],
          events: [],
          plugins: {
            datalabels: {
              display: true,
              formatter: (value, context) =>
                context.chart.data.labels[context.dataIndex],
              color: "white",
            },
            legend: { display: false },
          },
        },
      };

      // Render chart
      myChart.current = new Chart(chartContainer.current, config);

      // Return cleanup function
      return () => myChart.current.destroy();
    }
  }, [prizeEntryList]);

  useEffect(() => {
    setFilteredEmailList(filterEmailList(emailList, searchString));
  }, [emailList, searchString]);
  useEffect(() => {
    if (!sortFunction) {
      setSortedEmailList(filteredEmailList);
    } else {
      setSortedEmailList(filteredEmailList.toSorted(sortFunction));
    }
    console.log(sortedEmailList);
  }, [filteredEmailList, sortFunction]);

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
          <h1 className={styles.eventName}>
            {selectedEventName}
            <button
              className={styles.editEventNameButton}
              onClick={openEditModal}
            >
              Edit event name
            </button>
            {isEditModalOpen && renderModal()}
          </h1>
          <div className={styles.activeOrDeleteButtons}>
            <button
              className={styles.makeActiveButton}
              onClick={handleActiveEventChange}
            >
              Make Active
            </button>
            <button
              className={styles.deleteEventButton}
              onClick={handleDeleteEvent}
            >
              Delete Event
            </button>
          </div>
          <div className={styles.wheelConfigContainer}>
            <div className={styles.wheelSettingsContainer}>
              <div className={styles.leftSide}>
                <h2>Wheel Preview</h2>
                <div className={styles.wheelContainer}>
                  <div className={styles.chartBox}>
                    <canvas
                      className={styles.myChart}
                      ref={chartContainer}
                      id="myChart"
                    ></canvas>
                  </div>
                </div>

                <h2 className={styles.rigSetting}>
                  Rig
                  <input
                    type="text"
                    value={rigNumber} // Bind input value to the state
                    onChange={handleRigNumberChange} // Update state when input changes
                  />
                </h2>
              </div>
              <div className={styles.rightSide}>
                <div className={styles.prizeDataLabels}>
                  <p>Prize Name</p>
                  <p>Size</p>
                  <p>% Chance</p>
                  <span></span>
                </div>
                {prizeEntryList.map((prizeEntry, index) => (
                  <SinglePrizeEntry
                    key={index}
                    index={index}
                    prizeEntry={{ ...prizeEntry }}
                    onChange={handlePrizeEntryChange}
                    onRemove={handleRemovePrizeEntry}
                  />
                ))}
                <div className={styles.rightSideButtonRow}>
                  {" "}
                  <button onClick={handleAddGrandPrizeEntry}>
                    Add Grand Prize
                  </button>
                  <button onClick={handleAddPrizeEntry}>Add Prize</button>
                </div>
              </div>
            </div>
            <button className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
          <div className={styles.emailListSection}>
            <button
              className={styles.refreshEmailsButton}
              onClick={getEmailData}
            >
              Refresh
            </button>{" "}
            <div className={styles.emailListTitle}>
              <h1>Email list</h1>{" "}
              <button
                className={styles.exportButton}
                onClick={handleExportEmails}
              >
                Export
              </button>{" "}
            </div>
            <p>{emailList.length} emails collected</p>
            <input
              className={styles.emailSearchInput}
              type="text"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="Search email"
            />
            <table className={styles.emailTable}>
              <thead>
                <tr>
                  <th>
                    Date<button onClick={handleOnSortByDate}>sort</button>
                  </th>
                  <th>Email</th>
                  <th>
                    Prize <button onClick={handleOnSortByPrize}>sort</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmailList.map((email) => (
                  <tr key={email.email}>
                    <td>{new Date(email.created_at).toLocaleString()}</td>
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
