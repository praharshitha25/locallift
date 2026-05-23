import React from "react";

function SettlementCard({ settlement }) {
  return (
    <div>
      <h2>{settlement.title}</h2>
      <p>{settlement.description}</p>
    </div>
  );
}

export default SettlementCard;
