import { useEffect, useState } from "react";
//firebase
import { db, collection, addDoc, onSnapshot, doc, deleteDoc } from "./firebase";
//react router
import { Route, Routes, Link } from "react-router-dom";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AddEventModal from "./components/AddEventModal";
import EventList from "./components/EventList";

function App() {
  //states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState([]);

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

  //functions
  const handleShowAddEventModal = () => {
    setShowAddEventModal(!showAddEventModal);
  };
  const handleSaveEvent = async (eventName) => {
    try {
      // Save the event name to the Firebase 'events' collection
      const eventsCollection = collection(db, "events");
      await addDoc(eventsCollection, {
        name: eventName,
        createdAt: new Date(), // Optional: Add a timestamp
      });

      alert("Event successfully added to Firebase:", eventName);
      setShowAddEventModal(false); // Close the modal
    } catch (error) {
      console.error("Error adding event to Firebase:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Reference to the event document in the Firestore database
      const eventRef = doc(db, "events", eventId);

      //delete the event document
      await deleteDoc(eventRef);
      alert("Delete Successful");
    } catch (error) {
      alert("Error Deleting Event:", error);
    }
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
                            Created At:{" "}
                            {new Date(
                              event.createdAt?.toDate()
                            ).toLocaleString()}
                          </p>
                          <div className="d-flex justify-content-center mt-auto">
                            <Link to={`/event/${event.id}`}>
                              <button className="btn btn-sm btn-primary me-2 d-flex align-items-center">
                                <FaEye className="me-2" />
                                View
                              </button>
                            </Link>

                            <button className="btn btn-sm btn-warning me-2 d-flex align-items-center">
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
      </main>
      <br />
      <Footer />
    </div>
  );
}

export default App;
