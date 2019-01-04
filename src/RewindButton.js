import * as React from "react";
import { ButtonGroup, Button, Glyphicon } from "react-bootstrap";

export const RewindButton = props => {
  if (/000$/.test(props.clickedFips)) {
    return (
      <div className="rewind-container">
        <ButtonGroup>
          <Button onClick={props.handleNationButtonClick}>
            <Glyphicon glyph="step-backward" />
            Back to National View
          </Button>
        </ButtonGroup>
      </div>
    );
  } else {
    return (
      <div className="rewind-container">
        <ButtonGroup>
          <Button onClick={props.handleNationButtonClick}>
            <Glyphicon glyph="fast-backward" />
            Back to National View
          </Button>
          <Button onClick={props.handleStateButtonClick(props.clickedFips)}>
            <Glyphicon glyph="step-backward" />
            Back to State View
          </Button>
        </ButtonGroup>
      </div>
    );
  }
};
