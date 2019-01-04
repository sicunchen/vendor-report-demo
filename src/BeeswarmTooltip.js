import React from "react";
import { format } from "d3";
import { lqOptions } from "./helpers";

const BeeswarmTooltip = props => {
  const { industry, naics, lqType, lqVal, spending, mousePos } = props;
  const lqLabel = lqOptions.filter(opt => opt.value === lqType)[0].label;
  return (
    <div
      style={{ top: `${mousePos[1]}px`, left: `${mousePos[0]}px` }}
      className="map-tooltip"
    >
      <strong>{`${industry}`}</strong>
      <p>
        {`NAICS ${naics}`}
        <br />
        {`${lqLabel}: ${format(".2f")(lqVal)}`}
        <br />
        {`Industry Spending: ${format("$.2s")(spending)}`}
      </p>
    </div>
  );
};

export default BeeswarmTooltip;
