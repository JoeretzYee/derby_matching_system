import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { db, doc, deleteDoc, updateDoc } from "../firebase"; // import updateDoc
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import Select from "react-select";

function TabsList({ entries }) {
  const [activeTab, setActiveTab] = useState("Entries");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [selectedEntry1, setSelectedEntry1] = useState(null);
  const [selectedEntry2, setSelectedEntry2] = useState(null);
  const [excludedPairs, setExcludedPairs] = useState([]); // Store excluded pairs

  const entryOptions = entries.map((entry) => ({
    value: entry.id,
    label: entry.entryName,
  }));

  const handleExcludeSubmit = () => {
    if (selectedEntry1 && selectedEntry2) {
      if (selectedEntry1.value === selectedEntry2.value) {
        alert("Cannot exclude the same entry!");
        return;
      }

      // Add the excluded pair to the list
      setExcludedPairs((prev) => [
        ...prev,
        { entry1: selectedEntry1.value, entry2: selectedEntry2.value },
      ]);

      Swal.fire({
        icon: "success",
        title: "Excluded",
        text: "The selected entries have been excluded from matching.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    setShowExcludeModal(false);
  };

  console.log("excluded: ", excludedPairs);
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

  //generate excel
  const generateExcelEntries = () => {
    const headers = ["#", "Entry Name", "Owner Name", "Address", "Chickens"]; // Define headers for the Excel file

    // Prepare data rows
    const data = entries.map((entry, index) => {
      const chickenDetails = entry.chickenEntries
        .map((chicken) => `${chicken.chickenName} - ${chicken.weight}`)
        .join(", ");
      return [
        index + 1,
        entry.entryName,
        entry.ownerName,
        entry.address,
        chickenDetails,
      ];
    });

    // Combine headers and data
    const worksheetData = [headers, ...data];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Calculate column widths
    const columnWidths = worksheetData[0].map((header, colIndex) => ({
      wch: Math.max(
        header.length, // Header length
        ...data.map((row) =>
          row[colIndex] ? row[colIndex].toString().length : 0
        ) // Data length
      ),
    }));

    worksheet["!cols"] = columnWidths; // Set column widths in the worksheet

    // Create workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entries");

    // Write to Excel file and trigger download
    XLSX.writeFile(workbook, "entries.xlsx");
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
          <div className="d-flex align-items-center justify-content-between">
            <h3>Entries</h3>
            <button
              onClick={generateExcelEntries}
              className="btn btn-md btn-success"
            >
              Generate
            </button>
          </div>

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
                          <strong>{chicken.chickenName || "none"}</strong> -{" "}
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
      const matchedChickens = new Set(); // To keep track of all matched chickens by their unique identifiers

      // Iterate through each entry and chicken
      entries.forEach((entry, i) => {
        entry.chickenEntries.forEach((chicken) => {
          const chickenKey = `${entry.entryName}-${chicken.chickenName}`;

          if (matchedChickens.has(chickenKey)) {
            return; // Skip if this chicken has already been matched
          }

          let matched = false;

          // Search for a match in other entries
          entries.forEach((otherEntry, j) => {
            if (i !== j) {
              // Check if the pair of entries has been excluded
              const isExcluded = excludedPairs.some(
                (pair) =>
                  (pair.entry1 === entry.id && pair.entry2 === otherEntry.id) ||
                  (pair.entry1 === otherEntry.id && pair.entry2 === entry.id)
              );

              if (isExcluded) {
                return; // Skip matching this pair of entries as they are excluded
              }

              otherEntry.chickenEntries.forEach((otherChicken) => {
                const otherChickenKey = `${otherEntry.entryName}-${otherChicken.chickenName}`;

                // Ensure neither chicken has already been matched
                if (
                  !matchedChickens.has(chickenKey) &&
                  !matchedChickens.has(otherChickenKey)
                ) {
                  const weight1 = parseFloat(chicken.weight);
                  const weight2 = parseFloat(otherChicken.weight);
                  const weightDifference = Math.abs(weight1 - weight2);

                  // First, check for an exact weight match
                  if (weightDifference === 0) {
                    matchResults.push({
                      entryName1: entry.entryName,
                      chickenName1: chicken.chickenName,
                      weight1: weight1.toFixed(2),
                      ownerName1: entry.ownerName, // Add ownerName to the result
                      entryName2: otherEntry.entryName,
                      chickenName2: otherChicken.chickenName,
                      weight2: weight2.toFixed(2),
                      ownerName2: otherEntry.ownerName, // Add ownerName to the result
                      exactMatch: true, // Mark it as an exact match
                    });

                    matchedChickens.add(chickenKey);
                    matchedChickens.add(otherChickenKey);
                    matched = true;
                  }
                  // If it's not an exact match, check if the weight difference is within ±35
                  else if (weightDifference <= 35) {
                    matchResults.push({
                      entryName1: entry.entryName,
                      chickenName1: chicken.chickenName,
                      weight1: weight1.toFixed(2),
                      ownerName1: entry.ownerName, // Add ownerName to the result
                      entryName2: otherEntry.entryName,
                      chickenName2: otherChicken.chickenName,
                      weight2: weight2.toFixed(2),
                      ownerName2: otherEntry.ownerName, // Add ownerName to the result
                      exactMatch: false, // Mark it as a close match
                    });

                    matchedChickens.add(chickenKey);
                    matchedChickens.add(otherChickenKey);
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
              ownerName1: entry.ownerName, // Add ownerName to the result
              entryName2: "standby",
              chickenName2: "",
              weight2: "",
              ownerName2: "", // No ownerName for standby
              exactMatch: false, // Standby chickens are not exact matches
            });
          }
        });
      });

      // Sort matchResults:
      // 1. Prioritize exact matches
      // 2. If no match, fallback to closest match
      // 3. If neither, keep the standby entries at the end
      matchResults.sort((a, b) => {
        // First, prioritize exact matches
        if (a.exactMatch && !b.exactMatch) return -1;
        if (!a.exactMatch && b.exactMatch) return 1;

        // If both are exact or both are close, sort by weight difference (smaller difference comes first)
        const weightA = parseFloat(a.weight1);
        const weightB = parseFloat(b.weight1);
        return weightA - weightB;
      });

      // Generate Excel matching file
      const generateExcelMatching = () => {
        const tableData = matchResults.map((result, index) => ({
          "Fight #": index + 1,
          "Entry Name": result.entryName1,
          "Owner Name": result.ownerName1,
          "Wing/Leg #": result.chickenName1,
          Weight: result.weight1,
          "Matched Entry Name": result.entryName2,
          "Matched Owner Name": result.ownerName2,
          "Matched Chicken Name": result.chickenName2,
          "Matched Weight": result.weight2,
        }));

        const worksheet = XLSX.utils.json_to_sheet(tableData);

        // Column width calculation
        const columnWidths = Object.keys(tableData[0]).map((key) => ({
          wch: Math.max(
            key.length,
            ...tableData.map((row) =>
              row[key] ? row[key].toString().length : 0
            )
          ),
        }));

        worksheet["!cols"] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Matches");

        XLSX.writeFile(workbook, "MatchingResults.xlsx");
      };

      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Matching</h3>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setShowExcludeModal(true)}
                className="btn btn-md btn-primary"
              >
                Exclude
              </button>
              <button
                onClick={generateExcelMatching}
                className="btn btn-md btn-success "
              >
                Generate
              </button>
            </div>
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Fight #</th>
                <th>Entry Name</th>
                <th>Owner Name</th>
                <th>Wing/Leg #</th>
                <th>Weight</th>
                <th>Matched Entry Name</th>
                <th>Matched Owner Name</th>
                <th>Matched Wing/Leg #</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {matchResults.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.entryName1}</td>
                  <td>{result.ownerName1}</td>
                  <td>{result.chickenName1 || "none"}</td>
                  <td>{result.weight1}</td>
                  <td>{result.entryName2}</td>
                  <td>{result.ownerName2}</td>
                  <td>{result.chickenName2 || "none"}</td>
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
                  onClick={() => setShowExcludeModal(false)}
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
