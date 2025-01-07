import React, { useState } from "react";

function AddEntryModal({ show, onClose }) {
  //states
  const [weights, setWeights] = useState([]); // For multiple weights
  const [currentWeight, setCurrentWeight] = useState(""); // For the current input
  const [entryName, setEntryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("nabunturan");

  // Handle input change
  const handleWeightChange = (event) => {
    setCurrentWeight(event.target.value);
  };
  const handleEntryNameChange = (e) => {
    setEntryName(e.target.value);
  };
  const handleOwnerNameChange = (e) => {
    setOwnerName(e.target.value);
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };
  //functions
  // Handle adding weight
  const addWeight = () => {
    if (currentWeight && !isNaN(currentWeight)) {
      setWeights([...weights, parseFloat(currentWeight)]);
      setCurrentWeight(""); // Clear input after adding
    }
  };

  const handleSave = () => {
    console.log(entryName, ownerName, address, weights);
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
            <h5 className="modal-title ">Add Entry</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Entry name</label>
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
              <label className="form-label">Weight</label>
              <input
                type="number"
                className="form-control"
                placeholder="Type Here..."
                step="any"
                value={currentWeight}
                onChange={handleWeightChange}
              />
            </div>
            <button className="btn btn-primary" onClick={addWeight}>
              Add Weight
            </button>

            {/* Display added weights */}
            <div>
              <br />
              <h5>Added Weights:</h5>
              <ul>
                {weights.map((weight, index) => (
                  <li key={index}>{weight} kg</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
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
