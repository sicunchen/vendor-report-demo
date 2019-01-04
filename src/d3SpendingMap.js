import {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  select,
  voronoi,
  easeLinear,
  forceManyBody,
  max,
  format,
  mouse,
  geoPath,
  geoIdentity,
  geoMercator
} from "d3";
import * as topojson from "topojson";
import us from "./data/us-10m.json";
import states from "./data/cb_2017_us_state_20m.json";
import USStateList from "./data/stateslist.json";

const usGeojson = topojson.feature(us, us.objects.nation);
const statesGeojson = topojson.feature(
  states,
  states.objects.cb_2017_us_state_20m
);

export const drawOutline = (outlineContainer, props, mapWidth, mapHeight) => {
  const { clickedFips } = props;
  select(outlineContainer)
    .select("path")
    .remove();
  let projection;
  let geojson;
  if (clickedFips) {
    geojson = {
      type: "FeatureCollection",
      features: statesGeojson.features.filter(
        obj =>
          obj.properties.STATEFP === clickedFips.toString().replace(/000/, "")
      )
    };
    projection = geoMercator().fitSize([mapWidth, mapHeight], geojson);
  } else {
    geojson = usGeojson;
    projection = geoIdentity().fitSize([mapWidth, mapHeight], geojson);
  }
  //console.log(geojson)

  const path = geoPath().projection(projection);
  select(outlineContainer)
    .append("path")
    .attr("d", path(geojson))
    .attr("stroke", "#ccc");
};

export const drawSpendingBubbles = (
  bubbleContainer,
  voronoiContainer,
  props,
  mapWidth,
  mapHeight
) => {
  const {
    nodesData,
    handleClick,
    clickedFips: isStateView,
    handleMouseOver,
    handleMouseOut
  } = props;
  const nodesUpdate = select(bubbleContainer)
    .selectAll("g")
    .data(nodesData, d => d.fipscode);
  const nodesEnter = nodesUpdate.enter().append("g");
  nodesUpdate.exit().remove();

  const nodesMerge = nodesEnter.merge(nodesUpdate);

  nodesMerge
    .append("circle")
    .attr("id", d => `c-${d.fipscode}`)
    .attr("r", d => d.r)
    .style("fill", "#fcfcf4");
  nodesMerge
    .append("text")
    .text(d => (d.r > 5 ? d.label : ""))
    .style("font-size", d => `${d.r < 10 ? d.r : 10}px`)
    .attr("dy", 2);
  //nodesMerge.append("text").text(d => d.label).attr("dy",2)

  //set up force layout
  const simulation = forceSimulation()
    .force("center", forceCenter(mapWidth / 2, mapHeight / 2))
    .force(
      "collide",
      forceCollide()
        .strength(0.2)
        .radius(d => d.r + 8)
    )
    .force("x", forceX().x(d => d.cx))
    .force("y", forceY().y(d => d.cy));

  //set up voronoi
  const voronoiConfig = voronoi().size([mapWidth, mapHeight]);

  const tickCallback = () => {
    nodesMerge.attr("transform", d => `translate(${d.x}, ${d.y})`);
    voronoiConfig.x(d => d.x).y(d => d.y);
    const voronoiUpdate = select(voronoiContainer)
      .selectAll("path")
      .data(voronoiConfig(nodesData).polygons());
    const voronoiEnter = voronoiUpdate.enter().append("path");
    voronoiUpdate.exit().remove();
    voronoiEnter
      .merge(voronoiUpdate)
      .attr("d", d => "M" + d.join("L") + "Z")
      .on("mouseenter", function(d) {
        const chartParent = this.parentNode.parentNode.parentNode.parentNode;
        const tooltipData = {
          spending: d.data.spending,
          location: isStateView
            ? d.data.location
            : USStateList.filter(
                obj =>
                  obj.statecode == d.data.fipscode.toString().replace("000", "")
              )[0].statename,
          mousePos: mouse(chartParent)
        };
        handleMouseOver(tooltipData);
      })
      .on("mouseleave", d => {
        handleMouseOut();
      })

      .on("click", d => {
        handleClick(d.data.fipscode);
      });
  };
  simulation.nodes(nodesData).on("tick", tickCallback);
};

export const drawSpendingMapLegend = (
  legendContainer,
  props,
  legendWidth,
  legendHeight
) => {
  const { spendingLegendData, spendingRadiusScale } = props;
  //console.log(spendingLegendData)
  const legendUpdate = select(legendContainer)
    .selectAll("g")
    .data(spendingLegendData, d => d);
  const legendEnter = legendUpdate.enter().append("g");
  legendUpdate.exit().remove();
  const legendMerge = legendEnter.merge(legendUpdate);

  legendMerge
    .append("circle")
    .attr("cx", legendWidth / 2)
    .attr("cy", legendHeight - 10)
    .transition()
    .attr("r", d => spendingRadiusScale(d))
    .attr("cx", legendWidth / 2)
    .attr("cy", d => legendHeight - 10 - spendingRadiusScale(d))
    .style("fill", "none")
    .style("stroke", "#000");

  legendMerge
    .append("line")
    .attr("x1", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + spendingRadiusScale(d)
        : legendWidth / 2 - spendingRadiusScale(d)
    )
    .attr("x2", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + spendingRadiusScale(max(spendingLegendData)) + 10
        : legendWidth / 2 - spendingRadiusScale(max(spendingLegendData)) - 10
    )
    .attr("y1", d => legendHeight - 10 - spendingRadiusScale(d))
    .attr("y2", d => legendHeight - 10 - spendingRadiusScale(d))
    .style("stroke", "#000")
    .style("stroke-dasharray", "2,2");

  legendMerge
    .append("text")
    .attr("x", (d, i) =>
      i % 2 === 0
        ? legendWidth / 2 + spendingRadiusScale(max(spendingLegendData)) + 40
        : legendWidth / 2 - spendingRadiusScale(max(spendingLegendData)) - 10
    )
    .attr("y", d => legendHeight - 10 - spendingRadiusScale(d) + 2)
    .attr("shape-rendering", "crispEdges")
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .text((d, i) =>
      i === 1 ? `${format("$.2s")(d)} (Median)` : format("$.2s")(d)
    );
};
