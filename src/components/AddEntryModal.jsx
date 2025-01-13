import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
function AddEntryModal({
  show,
  onClose,
  onSave,
  maxEntries,
  cock,
  bullstag,
  stag,
}) {
  // States
  const [chickenEntries, setChickenEntries] = useState([]); // For multiple chicken entries
  const [currentChickenName, setCurrentChickenName] = useState(""); // For the current chicken name input
  const [currentWeight, setCurrentWeight] = useState(""); // For the current weight input
  const [entryName, setEntryName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("nabunturan");

  const [isStagChecked, setIsStagChecked] = useState(false);
  const [isBullstagChecked, setIsBullstagChecked] = useState(false);
  const [isCockChecked, setIsCockChecked] = useState(false);
  const [isToprankChecked, setIsToprankChecked] = useState(false);

  // Handler to update the chicken name prefix based on selected checkboxes
  useEffect(() => {
    let prefix = "";
    if (isStagChecked) prefix = "S-";
    else if (isBullstagChecked) prefix = "B-";
    else if (isCockChecked) prefix = "C-";

    setCurrentChickenName(prefix);
  }, [isStagChecked, isBullstagChecked, isCockChecked]);

  // Handlers for input changes
  const handleChickenNameChange = (event) =>
    setCurrentChickenName(event.target.value);
  const handleWeightChange = (event) => setCurrentWeight(event.target.value);
  const handleEntryNameChange = (e) => setEntryName(e.target.value);
  const handleOwnerNameChange = (e) => setOwnerName(e.target.value);
  const handleAddressChange = (e) => setAddress(e.target.value);

  // Add chicken and weight entry
  const addChickenEntry = () => {
    // Check if any checkbox is checked
    if (!isStagChecked && !isBullstagChecked && !isCockChecked) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: "Please select a chicken type (Stag,Bullstag, or Cock)",
      });
      return;
    }
    if (chickenEntries.length >= maxEntries) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: `You can only add up to ${maxEntries} chicken entries.`,
      });
      return;
    }

    // if (!currentChickenName.trim()) {
    //   alert("Please enter a chicken name.");
    //   return;
    // }

    if (
      !currentWeight ||
      isNaN(currentWeight) ||
      parseFloat(currentWeight) <= 0
    ) {
      Swal.fire({
        icon: "error",
        title: "error",
        text: "Please enter a valid weight (positive number).",
      });

      return;
    }

    // Determine chicken type based on checked checkboxes
    let chickenType = "";
    if (isStagChecked) chickenType = "stag";
    else if (isBullstagChecked) chickenType = "bullstag";
    else if (isCockChecked) chickenType = "cock";

    // Add the chicken entry to the list
    setChickenEntries([
      ...chickenEntries,
      {
        chickenName: currentChickenName,
        weight: parseFloat(currentWeight),
        type: chickenType,
      },
    ]);

    // Clear inputs after adding
    setCurrentChickenName("");
    setCurrentWeight("");
    setIsBullstagChecked(false);
    setIsCockChecked(false);
    setIsStagChecked(false);
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
      onSave({
        entryName,
        ownerName,
        address,
        chickenEntries,
        isToprankChecked,
      });

      // Reset all fields to blank
      setEntryName("");
      setOwnerName("");
      setAddress("");
      setIsToprankChecked(false);
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
            <h5 className="modal-title">
              Add Entry({stag}
              {bullstag || ""},{cock})
            </h5>
            <button
              type="button"
              className="btn-close btn-sm btn-danger"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isToprankChecked}
                  onChange={() => setIsToprankChecked(!isToprankChecked)}
                />
                <label className="form-check-label" htmlFor="bullstagCheckbox">
                  Top Rank - {isToprankChecked ? "Yes" : "No"}
                </label>
              </div>
            </div>
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
            <div className="mb-3 d-flex align-items-center justify-content-around">
              {stag === "stag" && (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="stagCheckbox"
                    checked={isStagChecked}
                    onChange={() => setIsStagChecked(!isStagChecked)}
                  />
                  <label className="form-check-label" htmlFor="stagCheckbox">
                    Stag
                  </label>
                </div>
              )}

              {bullstag === "bullstag" && (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="bullstagCheckbox"
                    checked={isBullstagChecked}
                    onChange={() => setIsBullstagChecked(!isBullstagChecked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="bullstagCheckbox"
                  >
                    Bullstag
                  </label>
                </div>
              )}

              {cock === "cock" && (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="cockCheckbox"
                    checked={isCockChecked}
                    onChange={() => setIsCockChecked(!isCockChecked)}
                  />
                  <label className="form-check-label" htmlFor="cockCheckbox">
                    Cock
                  </label>
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Wing/Leg #</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type Here..."
                value={currentChickenName}
                onChange={handleChickenNameChange}
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
            <button className="btn btn-primary" onClick={addChickenEntry}>
              Add Chicken Entry
            </button>

            {/* Display added chicken entries */}
            <div>
              <br />
              <h5>Added Chicken Entries:</h5>
              <ol>
                {chickenEntries.map((entry, index) => (
                  <li key={index}>
                    {entry.chickenName}-{entry.weight}grams
                  </li>
                ))}
              </ol>
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
