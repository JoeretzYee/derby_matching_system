import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { db, doc, deleteDoc, updateDoc } from "../firebase"; // import updateDoc
import Swal from "sweetalert2";

function TabsList({ entries }) {
  const [activeTab, setActiveTab] = useState("Entries");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle delete entry
  const handleDeleteEntry = async (entryId) => {
    try {
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
        const entryRef = doc(db, "entries", entryId);
        await deleteDoc(entryRef);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The entry has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to delete the entry. Please try again.`,
      });
      console.log("Error Deleting Entry:", error);
    }
  };

  // Handle edit entry
  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setShowEditModal(true); // Show the modal when "Edit" is clicked
  };

  // Handle saving the edited entry
  const handleSaveEdit = async (updatedEntry) => {
    try {
      const entryRef = doc(db, "entries", updatedEntry.id);
      await updateDoc(entryRef, updatedEntry);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "The entry has been updated.",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowEditModal(false); // Close the modal after saving changes
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update the entry. Please try again.`,
      });
      console.log("Error Updating Entry:", error);
    }
  };

  // Render the active tab content
  const renderTabContent = () => {
    if (activeTab === "Entries") {
      // Filter entries based on search term
      const filteredEntries = entries.filter((entry) =>
        entry.entryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return (
        <div>
          {/* Search Field */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Entry Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <h3>Entries</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Entry Name</th>
                <th>Owner Name</th>
                <th>Address</th>
                <th>Chickens</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.entryName}</td>
                  <td>{entry.ownerName}</td>
                  <td>{entry.address}</td>
                  <td>
                    <ul>
                      {entry.chickenEntries.map((chicken, idx) => (
                        <li key={idx}>
                          <strong>{chicken.chickenName}</strong> -{" "}
                          {chicken.weight}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditEntry(entry)} // trigger edit
                      className="btn btn-sm btn-primary d-flex align-items-center"
                    >
                      <FaEdit />
                    </button>
                    &nbsp;
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="btn btn-sm btn-danger d-flex align-items-center"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showEditModal && (
            <EditEntryModal
              entry={currentEntry}
              onSave={handleSaveEdit}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </div>
      );
    }
    // Matching tab content
    if (activeTab === "Matching") {
      const matchResults = [];
      const matchedChickens = new Set(); // To keep track of already matched chickens by their unique identifier

      // Iterate through each entry and chicken
      entries.forEach((entry, i) => {
        entry.chickenEntries.forEach((chicken) => {
          const chickenKey = `${entry.entryName}-${chicken.chickenName}`; // Unique key for each chicken

          if (matchedChickens.has(chickenKey)) {
            return; // Skip if this chicken has already been matched
          }

          let matched = false; // Flag to check if a match is found

          // Search for a match in other entries
          entries.forEach((otherEntry, j) => {
            if (i !== j) {
              otherEntry.chickenEntries.forEach((otherChicken) => {
                const otherChickenKey = `${otherEntry.entryName}-${otherChicken.chickenName}`;

                if (!matchedChickens.has(otherChickenKey)) {
                  const weightDifference = Math.abs(
                    parseFloat(chicken.weight) - parseFloat(otherChicken.weight)
                  );

                  if (weightDifference <= 30) {
                    matchResults.push({
                      entryName1: entry.entryName,
                      chickenName1: chicken.chickenName,
                      weight1: parseFloat(chicken.weight).toFixed(2),
                      entryName2: otherEntry.entryName,
                      chickenName2: otherChicken.chickenName,
                      weight2: parseFloat(otherChicken.weight).toFixed(2),
                    });

                    matchedChickens.add(chickenKey); // Mark as matched
                    matchedChickens.add(otherChickenKey); // Mark the matching chicken as matched
                    matched = true;
                  }
                }
              });
            }
          });

          // If no match was found, add "standby"
          if (!matched) {
            matchResults.push({
              entryName1: entry.entryName,
              chickenName1: chicken.chickenName,
              weight1: parseFloat(chicken.weight).toFixed(2),
              entryName2: "standby",
              chickenName2: "",
              weight2: "",
            });
          }
        });
      });

      return (
        <div>
          <h3>Matching</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Entry Name</th>
                <th>Chicken Name</th>
                <th>Weight</th>
                <th>Matched Entry Name</th>
                <th>Matched Chicken Name</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {matchResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.entryName1}</td>
                  <td>{result.chickenName1}</td>
                  <td>{result.weight1}</td>
                  <td>{result.entryName2}</td>
                  <td>{result.chickenName2}</td>
                  <td>{result.weight2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div>
      {/* Tabs */}
      <ul className="nav nav-tabs mt-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Entries" ? "active" : ""}`}
            onClick={() => setActiveTab("Entries")}
          >
            Entries
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Matching" ? "active" : ""}`}
            onClick={() => setActiveTab("Matching")}
          >
            Matching
          </button>
        </li>
      </ul>
      {/* Tab content */}
      <div className="tab-content mt-3">{renderTabContent()}</div>
    </div>
  );
}

// Edit Modal Component
const EditEntryModal = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    entryName: entry.entryName,
    ownerName: entry.ownerName,
    address: entry.address,
    chickenEntries: entry.chickenEntries || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChickenChange = (idx, field, value) => {
    const updatedChickens = [...formData.chickenEntries];
    updatedChickens[idx][field] = value;
    setFormData({ ...formData, chickenEntries: updatedChickens });
  };

  const handleAddChicken = () => {
    setFormData({
      ...formData,
      chickenEntries: [
        ...formData.chickenEntries,
        { chickenName: "", weight: "" }, // Default values for new chicken
      ],
    });
  };
  const handleRemoveChicken = (idx) => {
    const updatedChickens = formData.chickenEntries.filter(
      (_, index) => index !== idx
    );
    setFormData({ ...formData, chickenEntries: updatedChickens });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...entry, ...formData }); // Merge original entry with form data
  };

  return (
    <div className="modal d-block" style={{ display: "block" }}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Entry</h5>
          <button className="close btn-sm btn-danger" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Entry Name</label>
              <input
                type="text"
                className="form-control"
                name="entryName"
                value={formData.entryName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                className="form-control"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Chickens</label>
              {formData.chickenEntries.map((chicken, idx) => (
                <div key={idx} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={chicken.chickenName}
                    onChange={(e) =>
                      handleChickenChange(idx, "chickenName", e.target.value)
                    }
                    placeholder="Chicken Name"
                  />
                  <input
                    type="number"
                    className="form-control ml-2"
                    value={chicken.weight}
                    onChange={(e) =>
                      handleChickenChange(idx, "weight", e.target.value)
                    }
                    placeholder="Weight"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ml-2"
                    onClick={() => handleRemoveChicken(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-success btn-sm mt-2"
                onClick={handleAddChicken}
              >
                Add Chicken
              </button>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TabsList;
