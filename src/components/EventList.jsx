import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  db,
  doc,
  getDoc,
  addDoc,
  collection,
  query,
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
  const [eventDetail, setEventDetail] = useState(null);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [entries, setEntries] = useState([]); // Store all entries
  const [cock, setCock] = useState("");
  const [stag, setStag] = useState("");
  const [bullstag, setBullstag] = useState("");

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

  // Real-time listener for entries
  useEffect(() => {
    const entriesQuery = query(
      collection(db, "entries"),
      where("eventId", "==", eventId)
    );

    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      const fetchedEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(fetchedEntries);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [eventId]);

  //functions
  const handleShowAddEntryModal = () => {
    setShowAddEntryModal(!showAddEntryModal);
  };

  const addEntryModal = async (data) => {
    try {
      const dataEntryCollection = collection(db, "entries");
      await addDoc(dataEntryCollection, {
        entryName: data.entryName,
        ownerName: data.ownerName,
        address: data.address,
        chickenEntries: data.chickenEntries,
        isToprank: data.isToprankChecked,
        eventId: eventId,
      });
      // SweetAlert success message
      Swal.fire({
        icon: "success",
        title: "Data Entry successfully added",
        text: `Entry Name: ${data.entryName}`,
        timer: 1500, // Auto-close after 1.5 seconds
        showConfirmButton: false,
      });

      setShowAddEntryModal(false);
    } catch (error) {
      console.log(error);
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
            className="btn btn-md btn-primary w-auto"
            onClick={handleShowAddEntryModal}
          >
            Add Entry
          </button>
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

      <TabsList entries={entries} />
    </div>
  );
}

export default EventList;
