import * as React from "react";
import Select from "react-select";
import { lqOptions } from "./helpers";

export const LQSelector = props => {
  return (
    <div className="lq selector-container">
      <p className="selector-label">Please select a Location Quotient:</p>
      <div className="selector">
        <Select
          defaultValue={lqOptions[0]}
          onChange={props.handleNAICSChange}
          options={lqOptions}
        />
      </div>
    </div>
  );
};
