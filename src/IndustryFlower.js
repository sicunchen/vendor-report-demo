import React, { Component } from "react";
import { drawFlower, drawFlowerLegend, drawTop5 } from "./d3IndustryFlower";

class IndustryFlower extends Component {
  flowerWidth = 200;
  flowerHeight = 200;
  legendWidth = 240;
  legendHeight = 150;
  top5AreaWidth = 250;
  top5AreaHeight = 150;
  flowerAreaRef = node => (this.flowerArea = node);
  legendAreaRef = node => (this.legendArea = node);
  top5AreaRef = node => (this.top5Area = node);
  shouldComponentUpdate(np, ns) {
    if (np.clickedFips === this.props.clickedFips) {
      return false;
    }
    return true;
  }
  componentDidMount() {
    drawFlowerLegend(
      this.props,
      this.legendArea,
      this.legendWidth,
      this.legendHeight
    );
    drawFlower(
      this.props,
      this.flowerArea,
      this.flowerWidth,
      this.flowerHeight
    );
    drawTop5(
      this.props,
      this.top5Area,
      this.top5AreaWidth,
      this.top5AreaHeight
    );
  }

  componentDidUpdate(pp, ps) {
    drawFlowerLegend(
      this.props,
      this.legendArea,
      this.legendWidth,
      this.legendHeight
    );
    drawFlower(
      this.props,
      this.flowerArea,
      this.flowerWidth,
      this.flowerHeight
    );
    drawTop5(
      this.props,
      this.top5Area,
      this.top5AreaWidth,
      this.top5AreaHeight
    );
  }
  render() {
    const {
      svgWidth,
      svgHeight,
      clickedFips,
      metricKey,
      flowerData
    } = this.props;
    if (flowerData[0]) {
      return (
        <div className="chart-container">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio={"xMidYMid meet"}
          >
            <g
              ref={this.top5AreaRef}
              transform={`translate(${(svgWidth - this.top5AreaWidth) / 2},0)`}
            />
            <g
              ref={this.flowerAreaRef}
              className="flower"
              transform={`translate(${(svgWidth - this.flowerWidth) / 2},${this
                .top5AreaHeight + 10})`}
            />

            <g
              transform={`translate(${(svgWidth - this.legendWidth) / 2},350)`}
              ref={this.legendAreaRef}
            >
              <text
                x={this.legendWidth / 2}
                y={10}
                style={{ textAnchor: "middle" }}
              >
                {metricKey === "total_pmt_amt"
                  ? "Industry Spending"
                  : "Employee LQ"}
              </text>
            </g>
          </svg>
        </div>
      );
    } else {
      return <p>Data Not Avaialbe For This County</p>;
    }
  }
}
export default IndustryFlower;
