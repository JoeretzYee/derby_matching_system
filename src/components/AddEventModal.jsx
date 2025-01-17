import React, { useState } from "react";

const AddEventModal = ({ show, onClose, onSave }) => {
  const [eventName, setEventName] = useState("");
  const [when, setWhen] = useState("");
  const [givenTake, setGivenTake] = useState(35);

  //functions
  const handleSave = () => {
    if (eventName.trim() && when.trim()) {
      onSave({ eventName, when, givenTake });
      setEventName("");
      setWhen(null);
    } else {
      alert("Enter a valid name");
    }
  };

  const handleCancel = () => {
    onClose();
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Event</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Given Take:</label>
              <input
                type="number"
                className="form-control"
                value={givenTake}
                onChange={(e) => setGivenTake(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Event Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type Here"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">When:</label>
              <input
                type="datetime-local"
                className="form-control"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
