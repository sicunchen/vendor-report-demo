import React, { Component } from "react";
import { drawBeeswarm, drawBsLegend } from "./d3Beeswarm";

class Beeswarm extends Component {
  xAxisRef = node => (this.xAxis = node);
  legendAreaRef = node => (this.legendArea = node);
  beeswarmRef = node => (this.beeswarmArea = node);
  width = 900;
  height = 200;
  legendWidth = 200;
  legendHeight = 80;
  shouldComponentUpdate(np, ns) {
    if (np.clickedFips === this.props.clickedFips) {
      if (np.lqType !== this.props.lqType) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }
  componentDidMount() {
    drawBsLegend(
      this.props.bsLegendData,
      this.legendArea,
      this.legendWidth,
      this.legendHeight
    );
    drawBeeswarm(
      this.props,
      this.beeswarmArea,
      this.xAxis,
      this.width,
      this.height
    );
  }

  componentDidUpdate(pp, ps) {
    drawBsLegend(
      this.props.bsLegendData,
      this.legendArea,
      this.legendWidth,
      this.legendHeight
    );
    drawBeeswarm(
      this.props,
      this.beeswarmArea,
      this.xAxis,
      this.width,
      this.height
    );
  }
  render() {
    if (this.props.beeswarmData[0]) {
      return (
        <div className="chart-container">
          <svg width={1000} height={320}>
            <g transform="translate(50,0)">
              <g
                className="axis axis--x"
                ref={this.xAxisRef}
                transform="translate(0,220)"
              />
              <g
                className="bubbles"
                ref={this.beeswarmRef}
                transform="translate(0,20)"
              />
            </g>
            <g transform="translate(400,240)" ref={this.legendAreaRef}>
              <text x={100} y={25} style={{ textAnchor: "middle" }}>
                Industry Spending
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

export default Beeswarm;
