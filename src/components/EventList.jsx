import React, { useEffect, useState, useReducer } from "react";
import reducer, { initialState, actionTypes } from "../reducer";
import Select from "react-select";
import { useParams, Link } from "react-router-dom";
import {
  db,
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "../firebase";
import Swal from "sweetalert2";
import AddEntryModal from "./AddEntryModal";
import TabsList from "./TabsList";
import { SlTag } from "react-icons/sl";

function EventList() {
  //states
  const { eventId } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [eventDetail, setEventDetail] = useState(null);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [selectedEntry1, setSelectedEntry1] = useState(null);
  const [selectedEntry2, setSelectedEntry2] = useState(null);
  const [excludedPairs, setExcludedPairs] = useState([]); // Store excluded pairs
  const [entries, setEntries] = useState([]); // Store all entries
  const [toprankEntries, setToprankEntries] = useState([]); // Store all toprank entries
  const [cock, setCock] = useState("");
  const [stag, setStag] = useState("");
  const [bullstag, setBullstag] = useState("");
  const [entryOptions, setEntryOptions] = useState([]);
  const combinedArray = [
    ...state.stags,
    ...state.bullstags,
    ...state.cocks,
    ...state.toprankStags,
    ...state.toprankBullstags,
    ...state.toprankCocks,
  ];

  // const entryOptions = entries.map((entry) => ({
  //   value: entry.id,
  //   label: entry.entryName,
  // }));
  const entryOptionss = async () => {
    try {
      // Fetch entries from the 'entries' collection
      const entriesRef = collection(db, "entries");
      const entriesSnapshot = await getDocs(entriesRef);
      const entriesData = entriesSnapshot.docs.map((doc) => ({
        value: doc.data().entryName,
        label: doc.data().entryName,
      }));

      // Fetch entries from the 'toprank' collection
      const toprankRef = collection(db, "toprank");
      const toprankSnapshot = await getDocs(toprankRef);
      const toprankData = toprankSnapshot.docs.map((doc) => ({
        value: doc.data().entryName,
        label: doc.data().entryName,
      }));

      // Combine both entries and toprankEntries
      const combinedEntries = [...entriesData, ...toprankData];

      setEntryOptions(combinedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
  };
  // Fetch entry options when the component mounts
  useEffect(() => {
    entryOptionss(); // Call the async function to load entries
  }, []);

  // Usage

  //useEffect
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const eventRef = doc(db, "events", eventId);

        const eventDoc = await getDoc(eventRef);
        if (eventDoc.exists()) {
          setEventDetail(eventDoc.data());
          // Check if the event name contains the target words
          if (eventDoc.data().name) {
            if (/stag/i.test(eventDoc.data().name)) setStag("stag");
            if (/bullstag/i.test(eventDoc.data().name)) setBullstag("bullstag");
            if (/cock/i.test(eventDoc.data().name)) setCock("cock");
          }
        } else {
          alert("No such event");
        }
      } catch (error) {
        console.log("error fetching event: ", error);
      }
    };
    fetchEventDetail();
  }, [eventId]);

  const useRealTimeListener = (collectionName, setterFunction, eventId) => {
    useEffect(() => {
      const entriesQuery = query(
        collection(db, collectionName),
        where("eventId", "==", eventId)
      );

      const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setterFunction(fetchedEntries);
      });

      return () => unsubscribe(); // Cleanup on unmount
    }, [collectionName, setterFunction, eventId]);
  };
  useRealTimeListener("entries", setEntries, eventId);
  useRealTimeListener("toprank", setToprankEntries, eventId);

  //functions
  const handleExcludeSubmit = async () => {
    if (!selectedEntry1 || !selectedEntry2) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Selection",
        text: "Please select both entries to exclude.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check if the same entry is selected for both
    if (selectedEntry1.value === selectedEntry2.value) {
      Swal.fire({
        icon: "error",
        title: "Invalid Selection",
        text: "You cannot exclude the same entry as both Entry 1 and Entry 2.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Reference to the 'excludedEntries' collection
      const excludedRef = collection(db, "excludedEntries");

      console.log(
        "Checking if the eventId in excludedEntries is correct: ",
        eventId
      );

      // Query to check if the selected entries are already excluded
      const q = query(excludedRef, where("eventId", "==", eventId));
      const querySnapshot = await getDocs(q);

      let isAlreadyExcluded = false;

      // Iterate through all excluded documents to check if the entries are already excluded
      querySnapshot.forEach((doc) => {
        const excludedPairs = doc.data().excluded || [];
        excludedPairs.forEach((pair) => {
          const isMatch =
            (pair.entry1 === selectedEntry1.value &&
              pair.entry2 === selectedEntry2.value) ||
            (pair.entry1 === selectedEntry2.value &&
              pair.entry2 === selectedEntry1.value); // Check both orders
          if (isMatch) {
            isAlreadyExcluded = true;
          }
        });
      });

      if (isAlreadyExcluded) {
        Swal.fire({
          icon: "info",
          title: "Already Excluded",
          text: "These entries are already excluded.",
          confirmButtonText: "OK",
        });
        return;
      }

      // Add the new exclusion to Firestore
      const excludedData = {
        eventId: eventId, // Replace with your event ID
        excluded: [
          {
            entry1: selectedEntry1.value, // Assuming Select provides an object with `value`
            entry2: selectedEntry2.value,
            timestamp: new Date().toISOString(), // Optional for logging
          },
        ],
      };

      await addDoc(excludedRef, excludedData);

      Swal.fire({
        icon: "success",
        title: "Entries Excluded",
        text: "The selected entries have been excluded successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowExcludeModal(false); // Close the modal
      setSelectedEntry1(null);
      setSelectedEntry2(null);
    } catch (error) {
      console.error("Error excluding entries:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to exclude entries. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleShowAddEntryModal = () => {
    setShowAddEntryModal(!showAddEntryModal);
  };

  const addEntryModal = async (data) => {
    try {
      const collectionName = data.isToprankChecked ? "toprank" : "entries";
      const dataEntryCollection = collection(db, collectionName);

      await addDoc(dataEntryCollection, {
        entryName: data.entryName,
        ownerName: data.ownerName,
        address: data.address,
        chickenEntries: data.chickenEntries,
        isToprank: data.isToprankChecked,
        eventId: eventId,
      });

      Swal.fire({
        icon: "success",
        title: "Data Entry successfully added",
        text: `Entry Name: ${data.entryName}${
          data.isToprankChecked ? " (Top Rank)" : ""
        }`,
        timer: 1500, // Auto-close after 1.5 seconds
        showConfirmButton: false,
      });

      setShowAddEntryModal(false);
    } catch (error) {
      console.error("Error adding entry:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add the data entries. Please try again.",
      });
    }
  };

  const getMaxEntriesFromEventName = (eventName) => {
    const match = eventName.match(/^\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  const maxEntries =
    eventDetail && eventDetail.name
      ? getMaxEntriesFromEventName(eventDetail.name)
      : 0;

  if (!eventDetail) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className=" d-flex align-items-center justify-content-between ">
        {" "}
        <Link to="/">
          <button className="btn btn-md btn-secondary">Back</button>
        </Link>
        <h1 className="text-center text-dark">{eventDetail.name || ""}</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowExcludeModal(true)}
            className="btn btn-md btn-dark"
          >
            Exclude
          </button>
          <button
            className="btn btn-md btn-primary w-auto"
            onClick={handleShowAddEntryModal}
          >
            Add Entry
          </button>
          <button className="btn btn-md btn-success">Generate</button>
        </div>
        {/* Add Entry Modal */}
        <AddEntryModal
          show={showAddEntryModal}
          onClose={handleShowAddEntryModal}
          onSave={addEntryModal}
          maxEntries={maxEntries}
          stag={stag}
          bullstag={bullstag}
          cock={cock}
        />
      </div>

      <TabsList
        eventId={eventId}
        entries={entries}
        toprankEntries={toprankEntries}
        date={eventDetail.when}
        eventName={eventDetail.name}
      />
      {/* Exclude Modal */}
      {showExcludeModal && (
        <div className="modal d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Exclude Entries</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExcludeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Select Entry 1</label>
                  <Select
                    options={entryOptions}
                    value={selectedEntry1}
                    onChange={setSelectedEntry1}
                    placeholder="Select an entry"
                  />
                </div>
                <div className="mb-3">
                  <label>Select Entry 2</label>
                  <Select
                    options={entryOptions}
                    value={selectedEntry2}
                    onChange={setSelectedEntry2}
                    placeholder="Select an entry"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowExcludeModal(false); // Close the modal
                    window.location.reload(); // Refresh the page
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExcludeSubmit}
                >
                  Exclude
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventList;
