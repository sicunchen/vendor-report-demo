import React from "react";
import { format } from "d3";

const IndustryFlowerTooltip = props => {
  const { metric, mousePos, metricKey, id } = props;

  return (
    metricKey === id && (
      <div
        style={{ top: `${mousePos[1]}px`, left: `${mousePos[0]}px` }}
        className="map-tooltip"
      >
        <strong>{`${
          metricKey === "total_pmt_amt"
            ? format("$.2s")(metric)
            : format(".2f")(metric)
        }`}</strong>
      </div>
    )
  );
};

export default IndustryFlowerTooltip;
