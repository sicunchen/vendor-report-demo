import React, { Component } from "react";
import {
  drawSpendingBubbles,
  drawSpendingMapLegend,
  drawOutline
} from "./d3SpendingMap";

class SpendingMap extends Component {
  mapWidth = 500;
  mapHeight = 380;
  legendWidth = 200;
  legendHeight = 150;
  mapAreaRef = node => (this.mapArea = node);
  voronoiRef = node => (this.voronoiArea = node);
  legendRef = node => (this.legendArea = node);
  outlineRef = node => (this.outline = node);

  shouldComponentUpdate(np, ns) {
    if (np.fipscode === this.props.fipscode) {
      return false;
    }
    return true;
  }
  componentDidMount() {
    drawOutline(this.outline, this.props, this.mapWidth, this.mapHeight);
    drawSpendingBubbles(
      this.mapArea,
      this.voronoiArea,
      this.props,
      this.mapWidth,
      this.mapHeight
    );
    drawSpendingMapLegend(
      this.legendArea,
      this.props,
      this.legendWidth,
      this.legendHeight
    );
  }

  componentDidUpdate(pp, ps) {
    drawOutline(this.outline, this.props, this.mapWidth, this.mapHeight);
    drawSpendingBubbles(
      this.mapArea,
      this.voronoiArea,
      this.props,
      this.mapWidth,
      this.mapHeight
    );
    drawSpendingMapLegend(
      this.legendArea,
      this.props,
      this.legendWidth,
      this.legendHeight
    );
  }

  render() {
    const { svgWidth, svgHeight } = this.props;
    return (
      <div className="chart-container">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio={"xMidYMid meet"}
        >
          <g ref={this.outlineRef} />
          <g ref={this.mapAreaRef} transform="translate(25,0)" />
          <g ref={this.voronoiRef} transform="translate(25,0)" />
          <g
            transform={`translate(${(svgWidth - this.legendWidth) /
              2},${svgHeight - this.legendHeight})`}
            ref={this.legendRef}
          >
            <rect
              width={this.legendWidth}
              height={this.legendHeight}
              fill="none"
            />
            <text x={this.legendWidth / 2} y={25}>
              Regional Spending
            </text>
          </g>
        </svg>
      </div>
    );
  }
}
export default SpendingMap;
