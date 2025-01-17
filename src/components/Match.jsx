import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import xlsx library
import { collection, db, onSnapshot } from "../firebase";

function Match({ data, eventId, type, eventGivenTake, date, eventName }) {
  const [excludedPairs, setExcludedPairs] = useState([]);
  const [resultsMatch, setResultsMatch] = useState(null);

  const formatDate = (date) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const parsedDate = new Date(date);
    const dayOfWeek = daysOfWeek[parsedDate.getDay()];
    const month = months[parsedDate.getMonth()];
    const day = parsedDate.getDate();
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${dayOfWeek} at ${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Fetch excluded entries from Firebase
  useEffect(() => {
    const fetchExcludedPairs = () => {
      const excludedRef = collection(db, "excludedEntries");

      const unsubscribe = onSnapshot(excludedRef, (snapshot) => {
        const fetchedExcludedPairs = [];
        snapshot.forEach((doc) => {
          const excludedData = doc.data();
          if (excludedData.eventId === eventId) {
            fetchedExcludedPairs.push(...excludedData.excluded);
          }
        });
        setExcludedPairs(fetchedExcludedPairs);
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    };

    fetchExcludedPairs();
  }, [eventId]);

  // Process matches

  if (!data || data.length === 0) return;

  const matchedChickens = new Set();
  const results = [];

  // Filter data by eventId
  // const filteredData = data.filter((entry) => entry.eventId === eventId);

  data?.forEach((entry) => {
    entry.chickenEntries?.forEach((chicken) => {
      const chickenKey = `${entry.entryName}-${chicken.chickenName}`; // Use chickenName for uniqueness
      if (matchedChickens.has(chickenKey)) return; // Skip if already matched

      let isMatched = false;

      for (const otherEntry of data) {
        if (entry.entryName === otherEntry.entryName) continue; // Skip matching with itself

        // Check if the pair is excluded
        const isExcluded = excludedPairs.some(
          (pair) =>
            (pair.entry1 === entry.entryName &&
              pair.entry2 === otherEntry.entryName) ||
            (pair.entry1 === otherEntry.entryName &&
              pair.entry2 === entry.entryName)
        );

        if (isExcluded) continue; // Skip excluded pair

        for (const otherChicken of otherEntry.chickenEntries || []) {
          const otherChickenKey = `${otherEntry.entryName}-${otherChicken.chickenName}`; // Use chickenName for uniqueness
          if (matchedChickens.has(otherChickenKey)) continue; // Skip if already matched

          const weight1 = parseFloat(chicken.weight);
          const weight2 = parseFloat(otherChicken.weight);
          const weightDifference = Math.abs(weight1 - weight2);

          if (weightDifference <= eventGivenTake) {
            // Create a match
            results.push({
              fightNumber: results.length + 1,
              entryName: entry.entryName,
              ownerName: entry.ownerName,
              chickenName: chicken.chickenName || "none",
              weight: weight1,
              matchedEntryName: otherEntry.entryName,
              matchedOwnerName: otherEntry.ownerName,
              matchedChickenName: otherChicken.chickenName || "none",
              matchedWeight: weight2,
            });

            matchedChickens.add(chickenKey);
            matchedChickens.add(otherChickenKey);
            isMatched = true;
            break; // Exit inner loop when match is found
          }
        }

        if (isMatched) break; // Exit outer loop if a match is found
      }

      // If no match was found, mark as standby
      if (!isMatched) {
        results.push({
          fightNumber: results.length + 1,
          entryName: `${entry.entryName} (standby)`,
          ownerName: entry.ownerName,
          chickenName: chicken.chickenName || "none",
          weight: parseFloat(chicken.weight),
          matchedEntryName: "",
          matchedOwnerName: "",
          matchedChickenName: "",
          matchedWeight: "",
        });
      }
    });
  });
  //export to excel
  const exportToExcel = () => {
    const formattedDate = formatDate(date);
    // Event details (without "Promoted by" for now)
    const eventDetails = [
      { label: "Event Name", value: `${eventName}` },
      { label: "Location", value: "Nabunturan Super Sports Center" },
      { label: "Date", value: formattedDate },
      { label: "Type", value: type },
      { label: `${type} Fight List`, value: "" },
    ];

    // Prepare event details as an array of arrays for Excel formatting
    const eventHeader = eventDetails.map((item) => [item.label, item.value]);

    // Define custom headers for the table format
    const headers = [
      "Fight #",
      "Entry Name",
      "Owner Name",
      "Wing/Leg #",
      "Weight",
      "Matched Entry Name",
      "Matched Owner Name",
      "Matched Wing/Leg #",
      "Matched Weight",
    ];

    // Prepare the results for export with correct field names
    const formattedResults = results.map((result) => ({
      fightNumber: result.fightNumber,
      entryName: result.entryName,
      ownerName: result.ownerName,
      chickenName: result.chickenName,
      weight: result.weight,
      matchedEntryName: result.matchedEntryName,
      matchedOwnerName: result.matchedOwnerName,
      matchedChickenName: result.matchedChickenName,
      matchedWeight: result.matchedWeight,
    }));

    // Create the Excel sheet and add event details at the top
    const ws = XLSX.utils.aoa_to_sheet(eventHeader);

    // Add a blank row after the event details for spacing
    const blankRow = new Array(headers.length).fill(""); // Empty row for spacing
    XLSX.utils.sheet_add_aoa(ws, [blankRow], { origin: -1 });

    // Add the table headers below the event details
    const headerRow = [headers];
    XLSX.utils.sheet_add_aoa(ws, headerRow, { origin: -1 });

    // Add the formatted match results below the table headers
    XLSX.utils.sheet_add_json(ws, formattedResults, {
      origin: -1,
      skipHeader: true,
    });

    // Add a blank row after the match results for spacing
    XLSX.utils.sheet_add_aoa(ws, [blankRow], { origin: -1 });

    // Add the "Promoted by" section after the table list
    const promotedBy = [["Promoted by", "Boss Jing"]];
    XLSX.utils.sheet_add_aoa(ws, promotedBy, { origin: -1 });

    // Calculate column widths based on the content (headers and data)
    const columnWidths = headers.map((header, index) => {
      // Initialize width as the length of the header text
      let maxWidth = header.length;

      // Check the corresponding column in results
      formattedResults.forEach((result) => {
        const value = String(result[Object.keys(result)[index]]);
        if (value.length > maxWidth) {
          maxWidth = value.length; // Update if a longer value is found
        }
      });

      return { wch: maxWidth + 2 }; // Adding extra space for flexibility
    });

    // Apply column widths to the sheet
    ws["!cols"] = columnWidths;

    // Create a new workbook and append the sheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Results`);

    // Write the workbook to a file
    XLSX.writeFile(wb, `${type}_match_results.xlsx`);
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-end ">
        <button className="btn btn-sm btn-success " onClick={exportToExcel}>
          Generate
        </button>
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
          {results.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No {type} Fight Included in the Event
              </td>
            </tr>
          ) : (
            results.map((result, index) => (
              <tr key={index}>
                <td>{result.fightNumber}</td>
                <td>{result.entryName}</td>
                <td>{result.ownerName}</td>
                <td>{result.chickenName}</td>
                <td>{result.weight}</td>
                <td>{result.matchedEntryName}</td>
                <td>{result.matchedOwnerName}</td>
                <td>{result.matchedChickenName}</td>
                <td>{result.matchedWeight}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

export default Match;
