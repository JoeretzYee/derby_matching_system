import React, { useEffect, useState } from "react";
import { collection, db, onSnapshot } from "../firebase";

function Match({ data, eventId, type, eventGivenTake }) {
  const [excludedPairs, setExcludedPairs] = useState([]);

  console.table(data);

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
  return (
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
  );
}

export default Match;
