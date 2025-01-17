import { useEffect, useState } from "react";
//firebase
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "./firebase";
//react router
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
//sweetalert
import { Link, Route, Routes } from "react-router-dom";
import Swal from "sweetalert2";
import AddEventModal from "./components/AddEventModal";
import EditEventModal from "./components/EditEventModal";
import EventList from "./components/EventList";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  //states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  // State for the edit modal
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // useEffects
  useEffect(() => {
    const eventsCollection = collection(db, "events");

    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });

    //cleanup listener
    return () => unsubscribe();
  }, []);

  // handle functions
  const handleShowAddEventModal = () => {
    setShowAddEventModal(!showAddEventModal);
  };
  const handleShowEditEventModal = (event) => {
    setSelectedEvent(event); // Set the event to be edited
    setShowEditEventModal(true); // Show the modal
  };
  const handleSaveEvent = async (data) => {
    try {
      // Save the event name to the Firebase 'events' collection
      const eventsCollection = collection(db, "events");
      await addDoc(eventsCollection, {
        name: data.eventName,
        when: data.when,
        givenTake: data.givenTake,
      });

      // SweetAlert success message
      Swal.fire({
        icon: "success",
        title: "Event successfully added",
        text: `Name: ${data.eventName}`,
        timer: 1500, // Auto-close after 1.5 seconds
        showConfirmButton: false,
      });
      setShowAddEventModal(false); // Close the modal
    } catch (error) {
      // SweetAlert error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add the event. Please try again.",
      });
    }
  };

  const handleEditEvent = async (updatedEvent) => {
    console.log("updatedEvent: ", updatedEvent);
    try {
      const eventRef = doc(db, "events", updatedEvent.id);
      await updateDoc(eventRef, {
        name: updatedEvent.eventName,
        when: updatedEvent.when,
        givenTake: updatedEvent.givenTake,
      });

      // Update the local state (if needed) or re-fetch the events
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id
            ? {
                ...event,
                name: updatedEvent.eventName,
                when: updatedEvent.when,
                givenTake: updatedEvent.givenTake,
              }
            : event
        )
      );

      Swal.fire({
        icon: "success",
        title: "Event Updated",
        text: `The event "${updatedEvent.eventName}" was successfully updated.`,
        timer: 1500,
        showConfirmButton: false,
      });

      setShowEditEventModal(false); // Close the modal
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update the event. Please try again.",
      });
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Show a SweetAlert confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        // 1. Query the entries collection to get all entries associated with the eventId
        const entriesRef = collection(db, "entries");
        const entriesQuery = query(entriesRef, where("eventId", "==", eventId));
        const querySnapshot = await getDocs(entriesQuery);

        // 2. Delete each entry associated with the eventId
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref); // Delete each document in the entries collection
        });
        // 3. Delete excluded entries related to the event
        const excludedRef = collection(db, "excludedEntries");
        const excludedQuery = query(
          excludedRef,
          where("eventId", "==", eventId)
        );
        const excludedSnapshot = await getDocs(excludedQuery);

        excludedSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // 4. Delete toprank entries related to the event (assuming toprank has an "eventId" field)
        const toprankRef = collection(db, "toprank");
        const toprankQuery = query(toprankRef, where("eventId", "==", eventId));
        const toprankSnapshot = await getDocs(toprankQuery);

        toprankSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Commit the batch delete
        await batch.commit();

        // 3. Delete the event document
        const eventRef = doc(db, "events", eventId);
        await deleteDoc(eventRef);

        // Show a success alert after deletion
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The event and associated entries have been deleted.",
          timer: 1500, // Auto-close after 1.5 seconds
          showConfirmButton: false,
        });
      }
    } catch (error) {
      // Show an error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to delete the event and its entries. Please try again.`,
      });
      console.error("Error Deleting Event:", error);
    }
  };

  //functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "";
    }

    // Format the date as "January 19, 2025 at 9:23 PM"
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options).replace(",", " at");
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <br />
      <main className="flex-grow-1 flex-shrink-0 flex-auto">
        <Routes>
          <Route path="/event/:eventId" element={<EventList />} />
          <Route
            path="/"
            element={
              <div className="container ">
                <div className="row d-flex align-items-center">
                  {/* Buttons aligned to the right */}
                  <div className="col d-flex justify-content-end">
                    <button
                      className="btn btn-md btn-primary me-2"
                      onClick={handleShowAddEventModal}
                    >
                      Add Event
                    </button>
                  </div>
                </div>
                <br />
                <div className="row g-4">
                  {events.map((event) => (
                    <div className="col-sm-12 col-md-4" key={event.id}>
                      <div className="card bg-dark text-light cursor-pointer d-flex h-100">
                        <div className="card-body d-flex flex-column justify-content-between text-center">
                          <div className="h1 mb-3">
                            <i className="bi bi-laptop"></i>
                          </div>
                          <h3 className="card-title mb-3">{event.name}</h3>
                          <p className="card-text text-muted">
                            When: {formatDate(event.when)}
                          </p>
                          <div className="d-flex justify-content-center mt-auto">
                            <Link to={`/event/${event.id}`}>
                              <button className="btn btn-sm btn-primary me-2 d-flex align-items-center">
                                <FaEye className="me-2" />
                                View
                              </button>
                            </Link>

                            <button
                              className="btn btn-sm btn-warning me-2 d-flex align-items-center"
                              onClick={() => handleShowEditEventModal(event)}
                            >
                              <FaEdit className="me-2" />
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger d-flex align-items-center"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <FaTrashAlt className="me-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </Routes>
        <br />

        {/* Add Event Modal */}
        <AddEventModal
          show={showAddEventModal}
          onClose={handleShowAddEventModal}
          onSave={handleSaveEvent}
        />
        {/* Edit Event Modal */}
        <EditEventModal
          show={showEditEventModal}
          onClose={() => setShowEditEventModal(false)}
          onSave={handleEditEvent}
          event={selectedEvent}
        />
      </main>
      <br />
      <Footer />
    </div>
  );
}

export default App;
