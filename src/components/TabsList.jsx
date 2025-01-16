import React, { useState, useEffect, useReducer } from "react";
import reducer, { initialState, actionTypes } from "../reducer";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Select from "react-select";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  db,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
} from "../firebase"; // import updateDoc
import Match from "./Match";

function TabsList({ entries, toprankEntries, date, eventName, eventId }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState("Entries");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [stags, setStags] = useState([]);
  const [bullstag, setBullstag] = useState([]);
  const [cocks, setCocks] = useState([]);
  const [toprankStags, setToprankStags] = useState([]);
  const [toprankBullstag, setToprankBullstag] = useState([]);
  const [toprankCock, setToprankCock] = useState([]);
  const [excludedPairs, setExcludedPairs] = useState([]);

  console.log("excluded pair: ", excludedPairs.length);

  const categorizeChickens = (collection) => {
    const stags = [];
    const bullstags = [];
    const cocks = [];

    collection?.forEach((entry) => {
      entry.chickenEntries.forEach((chicken) => {
        if (chicken.type === "stag") {
          stags.push({ ...entry, chickenEntries: [chicken] });
        } else if (chicken.type === "bullstag") {
          bullstags.push({ ...entry, chickenEntries: [chicken] });
        } else if (chicken.type === "cock") {
          cocks.push({ ...entry, chickenEntries: [chicken] });
        }
      });
    });

    return { stags, bullstags, cocks };
  };

  useEffect(() => {
    const { stags, bullstags, cocks } = categorizeChickens(entries);
    const {
      stags: toprankStags,
      bullstags: toprankBullstags,
      cocks: toprankCocks,
    } = categorizeChickens(toprankEntries);

    setStags(stags);
    setBullstag(bullstags);
    setCocks(cocks);
    setToprankStags(toprankStags);
    setToprankBullstag(toprankBullstags);
    setToprankCock(toprankCocks);
  }, [entries, toprankEntries]);

  useEffect(() => {
    const fetchExcludedPairs = () => {
      const excludedRef = collection(db, "excludedEntries");

      const unsubscribe = onSnapshot(excludedRef, (snapshot) => {
        const fetchedExcludedPairs = [];
        console.log("Starting to fetch excluded pairs");

        snapshot.forEach((doc) => {
          const excludedData = doc.data();
          console.log("Doc data: ", excludedData); // Log the data from Firestore

          if (excludedData.eventId === eventId) {
            console.log("Found matching eventId:", eventId);
            // If there are excluded entries, push them into the array
            if (excludedData.excluded && excludedData.excluded.length > 0) {
              console.log("Found excluded pairs: ", excludedData.excluded);
              fetchedExcludedPairs.push(...excludedData.excluded);
            } else {
              console.log("No excluded pairs found in this document.");
            }
          }
        });

        // Only update the excludedPairs state if it's not empty
        if (fetchedExcludedPairs.length > 0) {
          console.log("Fetched Excluded Pairs: ", fetchedExcludedPairs);
          setExcludedPairs(fetchedExcludedPairs);
        } else {
          console.log("No excluded pairs found for this event.");
        }
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    };

    fetchExcludedPairs();
  }, [eventId]);
  useEffect(() => {
    const matchEntries = (data, actionType) => {
      const matchResults = [];
      const matchedChickens = new Set();

      // Matching logic
      // Iterate through entries
      data?.forEach((entry, i) => {
        const chickenEntries = entry.chickenEntries || [];
        chickenEntries.forEach((chicken) => {
          const chickenKey = `${entry.entryName}-${chicken.weight}`;

          // Skip if already matched
          if (matchedChickens.has(chickenKey)) {
            return;
          }

          let matched = false;

          // Find a match for the current chicken
          data?.forEach((otherEntry, j) => {
            if (i !== j) {
              const otherChickenEntries = otherEntry.chickenEntries || [];
              otherChickenEntries.forEach((otherChicken) => {
                const otherChickenKey = `${otherEntry.entryName}-${otherChicken.weight}`;

                console.log("Excluded before matching: ", excludedPairs.length);
                // Skip if excluded
                const isExcluded = excludedPairs.some(
                  (pair) =>
                    (pair.entry1 === entry.entryName &&
                      pair.entry2 === otherEntry.entryName) ||
                    (pair.entry1 === otherEntry.entryName &&
                      pair.entry2 === entry.entryName)
                );

                if (
                  !matchedChickens.has(chickenKey) &&
                  !matchedChickens.has(otherChickenKey) &&
                  !isExcluded
                ) {
                  const weight1 = parseFloat(chicken.weight);
                  const weight2 = parseFloat(otherChicken.weight);
                  const weightDifference = Math.abs(weight1 - weight2);

                  if (weightDifference <= 35) {
                    // Match found
                    matchResults.push({
                      fightNumber: matchResults.length + 1,
                      entryName1: entry.entryName,
                      ownerName1: entry.ownerName,
                      chickenName1: chicken.chickenName || "none",
                      weight1: weight1.toFixed(2),
                      entryName2: otherEntry.entryName,
                      ownerName2: otherEntry.ownerName,
                      chickenName2: otherChicken.chickenName || "none",
                      weight2: weight2.toFixed(2),
                    });

                    matchedChickens.add(chickenKey);
                    matchedChickens.add(otherChickenKey);
                    matched = true;
                  }
                }
              });
            }
          });

          // If no match is found, mark the entry as standby
          if (!matched) {
            matchResults.push({
              fightNumber: matchResults.length + 1,
              entryName1: `${entry.entryName} (standby)`,
              ownerName1: entry.ownerName,
              chickenName1: chicken.chickenName || "none",
              weight1: parseFloat(chicken.weight).toFixed(2),
              entryName2: "",
              ownerName2: "",
              chickenName2: "",
              weight2: "",
            });
          }
        });
      });
      // Dispatch match results to reducer

      dispatch({
        type: actionType,
        payload: matchResults,
      });
    };

    // Check if excludedPairs is populated before running match logic
    if (excludedPairs.length > 0) {
      // Call matchEntries for each data set
      matchEntries(stags, actionTypes.ADD_TO_STAGS);
      matchEntries(bullstag, actionTypes.ADD_TO_BULLSTAGS);
      matchEntries(cocks, actionTypes.ADD_TO_COCKS);
      matchEntries(toprankStags, actionTypes.ADD_TO_TOPRANKSTAGS);
      matchEntries(toprankBullstag, actionTypes.ADD_TO_TOPRANKBULLSTAGS);
      matchEntries(toprankCock, actionTypes.ADD_TO_TOPRANKCOCKS);
    } else {
      // Call matchEntries for each data set
      matchEntries(stags, actionTypes.ADD_TO_STAGS);
      matchEntries(bullstag, actionTypes.ADD_TO_BULLSTAGS);
      matchEntries(cocks, actionTypes.ADD_TO_COCKS);
      matchEntries(toprankStags, actionTypes.ADD_TO_TOPRANKSTAGS);
      matchEntries(toprankBullstag, actionTypes.ADD_TO_TOPRANKBULLSTAGS);
      matchEntries(toprankCock, actionTypes.ADD_TO_TOPRANKCOCKS);
    }
  }, [
    stags,
    bullstag,
    cocks,
    toprankStags,
    toprankBullstag,
    toprankCock,
    excludedPairs,
  ]);

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
  // Handle delete entry for toprank
  const handleDeleteEntryToprank = async (entryId) => {
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
        const entryRef = doc(db, "toprank", entryId);
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
  // Handle edit entry
  const handleEditEntryToprank = (entry) => {
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
  // Handle saving the edited entry for toprank
  const handleSaveEditToprank = async (updatedEntry) => {
    try {
      const entryRef = doc(db, "toprank", updatedEntry.id);
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
                          {chicken.weight} grams
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {" "}
                      {/* Flex container for buttons */}
                      <button
                        onClick={() => handleEditEntry(entry)} // Trigger edit
                        className="btn btn-sm btn-primary d-flex align-items-center"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="btn btn-sm btn-danger d-flex align-items-center"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
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

    if (activeTab === "Stag") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Stag Matching</h3>
          </div>
          <Match data={stags} eventId={eventId} type="Stag" />
        </div>
      );
    }
    if (activeTab === "Bullstag") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Bullstag Matching</h3>
          </div>
          <Match data={bullstag} eventId={eventId} type="Bullstag" />
        </div>
      );
    }
    if (activeTab === "Cock") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Cock Matching</h3>
          </div>
          <Match data={cocks} eventId={eventId} type="Cock" />
        </div>
      );
    }
    if (activeTab === "ToprankEntries") {
      // Filter entries based on search term
      const filteredEntries = toprankEntries?.filter((entry) =>
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
            <h3>Toprank Entries</h3>

            <button className="btn btn-md btn-success">Generate</button>
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
                          {chicken.weight} grams
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {" "}
                      {/* Flex container for buttons */}
                      <button
                        onClick={() => handleEditEntryToprank(entry)} // Trigger edit
                        className="btn btn-sm btn-primary d-flex align-items-center"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEntryToprank(entry.id)}
                        className="btn btn-sm btn-danger d-flex align-items-center"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showEditModal && (
            <EditEntryModal
              entry={currentEntry}
              onSave={handleSaveEditToprank}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </div>
      );
    }
    if (activeTab === "ToprankStag") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Toprank Stag Matching</h3>
          </div>
          <Match data={toprankStags} eventId={eventId} type="Toprank Stag" />
        </div>
      );
    }
    if (activeTab === "ToprankBullstag") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Toprank Bullstag Matching</h3>
          </div>
          <Match
            data={toprankBullstag}
            eventId={eventId}
            type="Toprank Bullstag"
          />
        </div>
      );
    }
    if (activeTab === "ToprankCock") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Toprank Cock Matching</h3>
          </div>
          <Match data={toprankCock} eventId={eventId} type="Toprank Cock" />
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
            className={`nav-link ${activeTab === "Stag" ? "active" : ""}`}
            onClick={() => setActiveTab("Stag")}
          >
            Stag Matching
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Bullstag" ? "active" : ""}`}
            onClick={() => setActiveTab("Bullstag")}
          >
            Bullstag Matching
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Cock" ? "active" : ""}`}
            onClick={() => setActiveTab("Cock")}
          >
            Cock Matching
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "ToprankEntries" ? "active" : ""
            }`}
            onClick={() => setActiveTab("ToprankEntries")}
          >
            Toprank Entries
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "ToprankStag" ? "active" : ""
            }`}
            onClick={() => setActiveTab("ToprankStag")}
          >
            Toprank Stag Matching
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "ToprankBullstag" ? "active" : ""
            }`}
            onClick={() => setActiveTab("ToprankBullstag")}
          >
            Toprank Bullstag Matching
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "ToprankCock" ? "active" : ""
            }`}
            onClick={() => setActiveTab("ToprankCock")}
          >
            Toprank Cock Matching
          </button>
        </li>
      </ul>
      {/* Tab content */}
      <div className="tab-content mt-3">{renderTabContent()}</div>
      <div>
        <h2>Stags Matches</h2>
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
            {state.stags.length === 0 ||
            !state.stags.some((item) => item.length > 0) ? (
              <tr>
                <td colSpan="9" className="text-center">
                  No Stags Matches Available
                </td>
              </tr>
            ) : (
              // Filtering and mapping over only valid match objects
              state.stags
                .filter((match) => match.length > 0) // Remove empty arrays
                .flat() // Flatten any nested arrays
                .map((match, index) => (
                  <tr key={index}>
                    <td>{match.fightNumber}</td>
                    <td>{match.entryName1}</td>
                    <td>{match.ownerName1}</td>
                    <td>{match.chickenName1}</td>
                    <td>{match.weight1}</td>
                    <td>{match.entryName2}</td>
                    <td>{match.ownerName2}</td>
                    <td>{match.chickenName2}</td>
                    <td>{match.weight2}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
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
