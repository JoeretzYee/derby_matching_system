import React from "react";

function Match({ data }) {
  const matchResults = [];
  const matchedChickens = new Set();

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

            if (
              !matchedChickens.has(chickenKey) &&
              !matchedChickens.has(otherChickenKey)
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
        {data?.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center">
              No Cock Fight Included in the Event
            </td>
          </tr>
        ) : (
          matchResults.map((result, index) => (
            <tr key={index}>
              <td>{result.fightNumber}</td>
              <td>{result.entryName1}</td>
              <td>{result.ownerName1}</td>
              <td>{result.chickenName1}</td>
              <td>{result.weight1}</td>
              <td>{result.entryName2}</td>
              <td>{result.ownerName2}</td>
              <td>{result.chickenName2}</td>
              <td>{result.weight2}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default Match;
