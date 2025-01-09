import React, { useState } from "react";

function AddEntryModal({ show, onClose, onSave, maxEntries }) {
  // States
  const [chickenEntries, setChickenEntries] = useState([]); // For multiple chicken entries
  const [currentChickenName, setCurrentChickenName] = useState(""); // For the current chicken name input
  const [currentWeight, setCurrentWeight] = useState(""); // For the current weight input
  const [entryName, setEntryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("nabunturan");

  // Handlers for input changes
  const handleChickenNameChange = (event) =>
    setCurrentChickenName(event.target.value);
  const handleWeightChange = (event) => setCurrentWeight(event.target.value);
  const handleEntryNameChange = (e) => setEntryName(e.target.value);
  const handleOwnerNameChange = (e) => setOwnerName(e.target.value);
  const handleAddressChange = (e) => setAddress(e.target.value);

  // Add chicken and weight entry
  const addChickenEntry = () => {
    if (chickenEntries.length >= maxEntries) {
      alert(`You can only add up to ${maxEntries} chicken entries.`);
      return;
    }

    if (!currentChickenName.trim()) {
      alert("Please enter a chicken name.");
      return;
    }

    if (
      !currentWeight ||
      isNaN(currentWeight) ||
      parseFloat(currentWeight) <= 0
    ) {
      alert("Please enter a valid weight (positive number).");
      return;
    }

    // Add the chicken entry to the list
    setChickenEntries([
      ...chickenEntries,
      { chickenName: currentChickenName, weight: parseFloat(currentWeight) },
    ]);

    // Clear inputs after adding
    setCurrentChickenName("");
    setCurrentWeight("");
  };

  // Reset function to clear all fields
  const resetFields = () => {
    setEntryName("");
    setOwnerName("");
    setAddress("");
    setChickenEntries([]);
    setCurrentChickenName("");
    setCurrentWeight("");
  };

  const handleSave = () => {
    if (!entryName.trim() || !ownerName.trim() || !address.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    if (chickenEntries.length === 0) {
      alert("Please add at least one chicken entry.");
      return;
    }

    // Call the onSave callback
    if (onSave) {
      onSave({ entryName, ownerName, address, chickenEntries });

      // Reset all fields to blank
      setEntryName("");
      setOwnerName("");
      setAddress("");
      setChickenEntries([]);
    } else {
      alert("onSave is not defined.");
    }
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
            <h5 className="modal-title">Add Entry</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Entry Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type Here..."
                value={entryName}
                onChange={handleEntryNameChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Owner Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type Here..."
                value={ownerName}
                onChange={handleOwnerNameChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Address"
                value={address}
                onChange={handleAddressChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Wing/Leg #</label>
              <input
                type="number"
                className="form-control"
                placeholder="Type Here..."
                value={currentChickenName}
                onChange={handleChickenNameChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Weight (grams)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Type Here..."
                step="any"
                value={currentWeight}
                onChange={handleWeightChange}
              />
            </div>
            <button className="btn btn-primary" onClick={addChickenEntry}>
              Add Chicken Entry
            </button>

            {/* Display added chicken entries */}
            <div>
              <br />
              <h5>Added Chicken Entries:</h5>
              <ul>
                {chickenEntries.map((entry, index) => (
                  <li key={index}>
                    {entry.chickenName} - {entry.weight} grams
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
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
}

export default AddEntryModal;
