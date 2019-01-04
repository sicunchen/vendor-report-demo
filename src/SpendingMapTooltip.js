import React from "react";
import { format } from "d3";

const SpendingMapTooltip = props => {
  const { location, spending, mousePos } = props;
  return (
    <div
      style={{ top: `${mousePos[1]}px`, left: `${mousePos[0]}px` }}
      className="map-tooltip"
    >
      <strong>{`${location}:${format("$.2s")(spending)}`}</strong>
    </div>
  );
};

export default SpendingMapTooltip;
