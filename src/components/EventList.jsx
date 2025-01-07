import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, doc, getDoc } from "../firebase";
import AddEntryModal from "./AddEntryModal";

function EventList() {
  //states
  const { eventId } = useParams();
  const [eventDetail, setEventDetail] = useState(null);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);

  //useEffect
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        console.log("Fetching event with ID:", eventId);
        const eventRef = doc(db, "events", eventId);
        console.log("event ref: ", eventRef);
        const eventDoc = await getDoc(eventRef);
        if (eventDoc.exists()) {
          console.log("Fetched event:", eventDoc.data());
          setEventDetail(eventDoc.data());
        } else {
          console.log("No such event");
        }
      } catch (error) {
        console.log("error fetching event: ", error);
      }
    };
    fetchEventDetail();
  }, [eventId]);

  //functions
  const handleShowAddEntryModal = () => {
    setShowAddEntryModal(!showAddEntryModal);
  };

  if (!eventDetail) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className=" d-flex align-items-center justify-content-between ">
        {" "}
        <Link to="/">
          <button className="btn btn-md btn-secondary">Back</button>
        </Link>
        <div className="d-flex gap-2">
          <button
            className="btn btn-md btn-primary w-auto"
            onClick={handleShowAddEntryModal}
          >
            Add Entry
          </button>
          <button className="btn btn-md btn-success  w-auto">Generate</button>
        </div>
      </div>

      {/* Add Entry Modal */}
      <AddEntryModal
        show={showAddEntryModal}
        onClose={handleShowAddEntryModal}
      />
    </div>
  );
}

export default EventList;
