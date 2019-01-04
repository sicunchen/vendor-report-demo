import { NAICSColorLookup } from "./helpers";
import {
  select,
  extent,
  max,
  quantile,
  scaleLog,
  scaleSqrt,
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
  axisBottom,
  voronoi,
  format,
  mouse
} from "d3";

export const drawBsLegend = (
  bsLegendData,
  legendContainer,
  legendWidth,
  legendHeight
) => {
  select(legendContainer)
    .selectAll("g")
    .remove();
  //console.log(bsLegendData)
  const radiusScale = scaleSqrt()
    .domain([0, max(bsLegendData)])
    .range([0, 20]);
  const legendUpdate = select(legendContainer)
    .selectAll("g")
    .data(bsLegendData, d => d);
  const legendEnter = legendUpdate.enter().append("g");
  legendUpdate.exit().remove();
  const legendMerge = legendEnter.merge(legendUpdate);

  legendMerge
    .append("circle")
    .attr("r", d => radiusScale(d))
    .attr("cx", legendWidth / 2)
    .attr("cy", d => legendHeight - 10 - radiusScale(d))
    .style("fill", "none")
    .style("stroke", "#000");

  legendMerge
    .append("line")
    .attr("x1", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + radiusScale(d)
        : legendWidth / 2 - radiusScale(d)
    )
    .attr("x2", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + radiusScale(max(bsLegendData)) + 10
        : legendWidth / 2 - radiusScale(max(bsLegendData)) - 10
    )
    .attr("y1", d => legendHeight - 10 - radiusScale(d))
    .attr("y2", d => legendHeight - 10 - radiusScale(d))
    .style("stroke", "#000")
    .style("stroke-dasharray", "2,2");

  legendMerge
    .append("text")
    .attr("x", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + radiusScale(max(bsLegendData)) + 40
        : legendWidth / 2 - radiusScale(max(bsLegendData)) - 10
    )
    .attr("y", d => legendHeight - 10 - radiusScale(d) + 2)
    .attr("shape-rendering", "crispEdges")
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .text((d, i) =>
      i === 1 ? `${format("$.2s")(d)} (Median)` : format("$.2s")(d)
    );
};

export const drawBeeswarm = (
  props,
  bsContainer,
  xAxisContainer,
  width,
  height
) => {
  let {
    beeswarmData,
    lqType,
    handleBeeswarmMouseOver,
    handleBeeswarmMouseOut
  } = props;
  beeswarmData.forEach(obj => {
    obj[lqType] = +obj[lqType];
    obj.total_pmt_amt = +obj.total_pmt_amt;
    obj.naics = +obj.naics;
  });
  beeswarmData = beeswarmData.sort((a, b) => (a[lqType] < b[lqType] ? -1 : 1));
  const radiusScale = scaleSqrt()
    .domain([0, max(beeswarmData, d => d.total_pmt_amt)])
    .range([0, 20]);
  //console.log(beeswarmData)

  //x scale update
  let inputRange = extent(beeswarmData, d => d[lqType]);
  let tickValues;
  if (beeswarmData.length === 1) {
    tickValues = [inputRange[0]];
    inputRange = [inputRange[0] - 0.001, inputRange[0] + 0.001];
  } else if (beeswarmData.length < 4) {
    tickValues = inputRange;
  } else {
    tickValues = [0, 0.5, 1].map(i =>
      //quantile(beeswarmData.map(d => d.total_pmt_amt), i)
      quantile(beeswarmData.map(d => d[lqType]), i)
    );
  }
  //console.log(inputRange)
  const xScale = scaleLog()
    .domain(inputRange)
    .rangeRound([0, width]);

  const xAxis = axisBottom(xScale)
    .tickValues(tickValues)
    .tickFormat(format(".2f"));
  //.tickFormat(format("$.2s"));

  select(xAxisContainer)
    .transition()
    .call(xAxis);

  //process bubble data
  if (beeswarmData.length < 5) {
    beeswarmData = beeswarmData.map(d => ({
      ...d,
      x: xScale(d[lqType]),
      //x: xScale(d.total_pmt_amt),
      y: height / 2
    }));
  } else if (beeswarmData.length < 9) {
    const simulation = forceSimulation(beeswarmData)
      .force("y", forceY(height * 0.5).strength(0.1))
      .force("collide", forceCollide(20))
      .stop();

    beeswarmData.forEach(() => {
      simulation.tick();
    });
    beeswarmData = beeswarmData.map(d => ({
      ...d,
      x: xScale(d[lqType])
      //x: xScale(d.total_pmt_amt)
    }));
  } else {
    const simulation = forceSimulation(beeswarmData)
      .force("x", forceX(d => xScale(d[lqType])).strength(0.8))
      .force("y", forceY(height * 0.5).strength(0.1))
      .force("collide", forceCollide(20))
      .stop();

    beeswarmData.forEach(() => {
      simulation.tick();
    });
  }

  //console.log(beeswarmData)

  // set up voronoi overlay to improve hover experience
  // if the force layout x is bigger than svg container width will return empty data and cause error

  const beeswarmDataWithVoronoi = voronoi()
    .extent([[-50, 0], [width + 50, height]])
    .x(d => d.x)
    .y(d => d.y)
    .polygons(beeswarmData);

  //console.log(beeswarmDataWithVoronoi)

  //draw bubbles
  const cellsUpdate = select(bsContainer)
    .selectAll("g")
    .data(beeswarmDataWithVoronoi, d => d.data.naics);

  const cellsEnter = cellsUpdate.enter().append("g");

  cellsUpdate.exit().remove();

  cellsEnter
    .append("path")
    .merge(cellsUpdate.select("path"))
    .attr("d", d => "M" + d.join("L") + "Z")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseover", function(d) {
      //console.log(d.data)
      const chartParent = this.parentNode.parentNode.parentNode.parentNode
        .parentNode.parentNode;
      const bsTooltipData = {
        naics: d.data.naics,
        industry: d.data.naics_title,
        lqType,
        lqVal: d.data[lqType],
        spending: d.data.total_pmt_amt,
        mousePos: mouse(chartParent)
      };
      handleBeeswarmMouseOver(bsTooltipData);
    })
    .on("mouseout", () => {
      handleBeeswarmMouseOut();
    });
  //.style("stroke", "green");

  cellsEnter
    .append("circle")
    .attr("cx", d => d.data.x)
    .attr("cy", d => d.data.y)
    .merge(cellsUpdate.select("circle"))
    .on("mouseover", function(d) {
      //console.log(d.data)
      const chartContainer = this.parentNode.parentNode.parentNode.parentNode
        .parentNode.parentNode;
      const bsTooltipData = {
        naics: d.data.naics,
        industry: d.data.naics_title,
        lqType,
        lqVal: d.data[lqType],
        spending: d.data.total_pmt_amt,
        mousePos: mouse(chartContainer)
      };
      handleBeeswarmMouseOver(bsTooltipData);
    })
    .on("mouseout", () => {
      handleBeeswarmMouseOut();
    })
    .transition()
    .duration(1000)
    .attr("r", d => radiusScale(d.data.total_pmt_amt))
    //.attr("r", d => radiusScale(d.data[lqType]))
    .attr("fill", d => NAICSColorLookup[d.data.naics])
    .attr("cx", d => d.data.x)
    .attr("cy", d => d.data.y);

  cellsEnter
    .append("text")
    .attr("x", d => d.data.x)
    .attr("y", d => d.data.y - radiusScale(d.data.total_pmt_amt) - 2)
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .merge(cellsUpdate.select("text"))
    .transition()
    .duration(1000)
    .text(d => d.data.naics)
    .attr("x", d => d.data.x)
    .attr("y", d => d.data.y - radiusScale(d.data.total_pmt_amt) - 2)
    .style("text-anchor", "middle")
    .style("font-size", "10px");
};
