import React, { Component } from "react";
import { RewindButton } from "./RewindButton";
import { LQSelector } from "./LQSelector";
import { Row, Col, OverlayTrigger, Glyphicon, Tooltip } from "react-bootstrap";
import { format } from "d3";
import {
  filterSpendingData,
  filterBeeswarmData,
  getNodesData,
  getLocation,
  getFlowerData,
  getBsLegendData,
  getNumberOne,
  getSpendingRadiuScale,
  getSpendingLegendData,
  getFLowerLegendData,
  getPetalSizeScale
} from "./helpers";
import "./App.css";
import SpendingMap from "./SpendingMap";
import IndustryFlower from "./IndustryFlower";
import Beeswarm from "./Beeswarm";
import IndustryFlowerTooltip from "./IndustryFlowerTooltip";
import SpendingMapTooltip from "./SpendingMapTooltip";
import BeeswarmTooltip from "./BeeswarmTooltip";
import StateCenters from "./data/StateCenters.json";
import CountyCenters from "./data/CountyCenters.json";
import USStateList from "./data/stateslist.json";
import beeswarmRawData from "./data/beeswarm.json";
import mapRawData from "./data/map.json";
import spendingflowerRawData from "./data/spending_flower.json";
import lqflowerRawData from "./data/lq_flower.json";

class App extends Component {
  state = {
    clickedFips: null,
    nodeHovered: false,
    petalHovered: false,
    bsHovered: false,
    mapTooltipData: null,
    flowerTooltipData: null,
    bsTooltipData: null,
    lqType: "lq_wgt_annual_avg_emplvl"
  };

  spendingTextRef = node => (this.spendingTextArea = node);
  spendingFlowerTextRef = node => (this.spendingFlowerTextArea = node);
  lqFlowerRef = node => (this.lqFlowerArea = node);
  beeswarmRef = node => (this.beeswarmArea = node);

  handleLQChange = option => {
    this.setState({ lqType: option.value });
  };

  handleNationButtonClick = () => {
    this.setState({ clickedFips: null });
  };

  handleStateButtonClick = clickedFips => () => {
    this.setState({ clickedFips: `${clickedFips.toString().slice(0, 2)}000` });
  };

  handleClick = clickedFips => {
    this.setState({
      clickedFips,
      nodeHovered: false,
      mapTooltipData: null
    });
  };

  handleMouseOver = mapTooltipData => {
    this.setState({ mapTooltipData, nodeHovered: true });
  };

  handleMouseOut = () => {
    this.setState({ mapTooltipData: null, nodeHovered: false });
  };

  handleFlowerMouseOver = flowerTooltipData => {
    this.setState({ flowerTooltipData, petalHovered: true });
  };

  handleFlowerMouseOut = () => {
    this.setState({ flowerTooltipData: null, petalHovered: false });
  };

  handleBSMouseOver = bsTooltipData => {
    this.setState({ bsTooltipData, bsHovered: true });
  };

  handleBSMouseOut = () => {
    this.setState({ bsTooltipData: null, bsHovered: false });
  };

  renderBeeswarm = (beeswarmRawData, clickedFips, lqType) => {
    if (beeswarmRawData) {
      const beeswarmData = filterBeeswarmData(beeswarmRawData, clickedFips);
      const bsLegendData = getBsLegendData(beeswarmData);
      const props = {
        lqType,
        beeswarmData,
        clickedFips,
        bsLegendData,
        handleBeeswarmMouseOver: this.handleBSMouseOver,
        handleBeeswarmMouseOut: this.handleBSMouseOut
      };
      return <Beeswarm {...props} />;
    } else {
      return <div>Loading...</div>;
    }
  };

  renderSpendingText = (mapRawData, USStateList, clickedFips) => {
    if (mapRawData) {
      let fipscode;
      if (clickedFips && !/000$/.test(clickedFips)) {
        fipscode = `${clickedFips.toString().slice(0, 2)}000`;
      } else {
        fipscode = clickedFips;
      }

      const spendingData = filterSpendingData(mapRawData, fipscode);
      const numberOne = getNumberOne(spendingData, USStateList, fipscode);
      return (
        <div className="text-content">
          This spending map below is based on{" "}
          <span className="dynamic-text">2017</span> total direct research
          expenditures across{" "}
          <span>
            {clickedFips
              ? getLocation(mapRawData, clickedFips, USStateList, "map")
              : "the U.S."}
          </span>
          , with the size of the <span>{clickedFips ? "county" : "state"}</span>{" "}
          bubble proportional to the amount of spending in that{" "}
          <span>{clickedFips ? "county" : "state"}</span>.{" "}
          <span className="dynamic-text">The University of Michigan</span> spent
          the most in{" "}
          <span className="dynamic-text">{numberOne.locationName}</span>,
          accounting for{" "}
          <span className="dynamic-text">
            {numberOne.percentage ? (
              format(".1%")(numberOne.percentage)
            ) : (
              <i className="fa fa-spinner" />
            )}
          </span>{" "}
          of all its research expenditures. Hover over each bubble to to see the
          amount of spending in that{" "}
          <span>{clickedFips ? "county" : "state"}</span>. Click on the bubbles
          to drill down into state and county spending.
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  };

  renderSpendingMap = (mapRawData, clickedFips) => {
    if (mapRawData) {
      let fipscode;
      if (clickedFips && !/000$/.test(clickedFips)) {
        fipscode = `${clickedFips.toString().slice(0, 2)}000`;
      } else {
        fipscode = clickedFips;
      }
      const centerCoords = fipscode ? CountyCenters[fipscode] : StateCenters;
      const svgWidth = 550;
      const svgHeight = 500;
      const spendingData = filterSpendingData(mapRawData, fipscode);
      const spendingRadiusScale = getSpendingRadiuScale(spendingData);
      const spendingLegendData = getSpendingLegendData(spendingData);
      const nodesData = getNodesData(spendingData, centerCoords, {
        width: svgWidth,
        height: svgHeight,
        sizeScale: spendingRadiusScale
      });
      const props = {
        spendingRadiusScale,
        fipscode,
        clickedFips,
        svgWidth,
        svgHeight,
        nodesData,
        spendingData,
        spendingLegendData,
        handleClick: this.handleClick,
        USStateList: this.props.USStateList,
        handleMouseOver: this.handleMouseOver,
        handleMouseOut: this.handleMouseOut
      };
      return <SpendingMap {...props} />;
    } else {
      return <div>Loading...</div>;
    }
  };

  renderIndustryFlower = (flowerRawData, clickedFips, metricKey) => {
    if (flowerRawData) {
      const svgWidth = clickedFips ? 250 : 500;
      const svgHeight = 500;
      const flowerData = getFlowerData(flowerRawData, clickedFips, metricKey);
      const flowerLegendData = getFLowerLegendData(flowerData, metricKey);
      const petalSizeScale = getPetalSizeScale(flowerData, metricKey);

      const props = {
        flowerData,
        svgWidth,
        svgHeight,
        clickedFips,
        metricKey,
        flowerLegendData,
        petalSizeScale,
        handleFlowerMouseOver: this.handleFlowerMouseOver,
        handleFlowerMouseOut: this.handleFlowerMouseOut
      };
      return <IndustryFlower {...props} />;
    } else {
      return <div>Loading...</div>;
    }
  };
  render() {
    const {
      clickedFips,
      nodeHovered,
      petalHovered,
      bsHovered,
      flowerTooltipData,
      mapTooltipData,
      bsTooltipData,
      lqType
    } = this.state;
    const textContainerHeight = clickedFips ? 250 : 150;
    return (
      <div className="App">
        <Row>
          <Col xs={clickedFips ? 6 : 6} className="spending-map">
            <div
              className="text-container"
              style={{ height: `${textContainerHeight}px` }}
              ref={this.spendingTextRef}
            >
              <h4>
                {getLocation(mapRawData, clickedFips, USStateList, "map")}{" "}
                Vendor Spending Distribution
              </h4>

              {this.renderSpendingText(mapRawData, USStateList, clickedFips)}
              {clickedFips && (
                <RewindButton
                  clickedFips={clickedFips}
                  handleNationButtonClick={this.handleNationButtonClick}
                  handleStateButtonClick={this.handleStateButtonClick}
                />
              )}
            </div>
            {this.renderSpendingMap(mapRawData, clickedFips)}
            {nodeHovered && <SpendingMapTooltip {...mapTooltipData} />}
          </Col>

          <Col xs={clickedFips ? 3 : 6} className="industry-flower">
            <div
              className="text-container"
              style={{ height: `${textContainerHeight}px` }}
              ref={this.spendingFlowerTextRef}
            >
              {clickedFips ? (
                <div>
                  <h4>{getLocation(mapRawData, clickedFips, USStateList)}</h4>
                  <h4>Top 5 Industries</h4>
                  <p>ranked by Industry Spending</p>
                </div>
              ) : (
                <h4>Top 5 Industries - National Spending</h4>
              )}
              <div className="text-content">
                <span className="dynamic-text">The University of Michigan</span>{" "}
                expended the greatest amount of research funds in the five
                industries represented by the petals of a flower, displayed
                below. The petal color corresponds to the industry, while the
                petal size represents the amount of spending. Hover over each
                petal to view more information about the industry and spending.
              </div>
            </div>
            {this.renderIndustryFlower(
              spendingflowerRawData,
              clickedFips,
              "total_pmt_amt"
            )}
            {petalHovered && (
              <IndustryFlowerTooltip
                {...flowerTooltipData}
                id="total_pmt_amt"
              />
            )}
          </Col>
          {clickedFips && (
            <Col xs={3} className="industry-flower">
              <div
                className="text-container"
                style={{ height: `${textContainerHeight}px` }}
                ref={this.lqFlowerRef}
              >
                {
                  <div>
                    <h4>{getLocation(mapRawData, clickedFips, USStateList)}</h4>
                    <h4>Top 5 Industries</h4>
                    <p>ranked by Employee Location Quotient</p>
                  </div>
                }
                <div className="text-content">
                  The top 5 Industries ranked by Employee Location Quotient
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip">
                        Local Quotients are calculated by first, dividing local
                        industry employment by the all-industry, all-ownerships
                        total of local employment. Second, national industry
                        employment is divided by the all industry, all
                        ownerships total for the nation. Finally, the local
                        ratio is divided by the national ratio.
                      </Tooltip>
                    }
                  >
                    <Glyphicon glyph="question-sign" />
                  </OverlayTrigger>
                  &nbsp;are listed below. Location Quotient is a measure of
                  industry's importance to local regions. The higher the
                  Location Quotient the more important an industry is to the
                  economic well-being of a given state or county.
                </div>
              </div>

              {this.renderIndustryFlower(
                lqflowerRawData,
                clickedFips,
                "lq_wgt_annual_avg_emplvl"
              )}
              {petalHovered && (
                <IndustryFlowerTooltip
                  {...flowerTooltipData}
                  id="lq_wgt_annual_avg_emplvl"
                />
              )}
            </Col>
          )}
        </Row>
        {clickedFips && (
          <Col xs={12} className="beeswarm">
            <div className="text-container" ref={this.beeswarmRef}>
              {
                <div>
                  <h4>
                    {getLocation(
                      spendingflowerRawData,
                      clickedFips,
                      USStateList
                    )}
                  </h4>
                  <h4>Industry Spending vs. Location Quotient</h4>
                </div>
              }
              <div className="text-content">
                This chart arranges industries in a given region by their
                importance to that region with more important industries on the
                right side of the chart. The size and proportion of each
                industry bubble represents the total research spending dollars
                that can be matched from vendors to sub-contractees to specific
                industries.
              </div>

              <LQSelector handleNAICSChange={this.handleLQChange} />
            </div>
            {this.renderBeeswarm(beeswarmRawData, clickedFips, lqType)}
            {bsHovered && <BeeswarmTooltip {...bsTooltipData} />}
          </Col>
        )}
      </div>
    );
  }
}

export default App;
