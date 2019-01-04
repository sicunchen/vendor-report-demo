import { select, format, mouse } from "d3";
import { textwrap } from "d3-textwrap";
import { NAICSColorLookup, getPetalPath } from "./helpers";

export const drawTop5 = (props, top5Area, areaWidth, areaHeight) => {
  const { flowerData, metricKey } = props;
  const textBounds = textwrap()
    .bounds({ height: areaHeight - 20, width: areaWidth })
    .method("tspans");
  const top5 = flowerData.map(obj => ({
    title: obj.naics_title,
    naics: +obj.naics
  }));
  //console.log(top5)
  const groupsUpdate = select(top5Area)
    .selectAll("g")
    .data(top5, d => d.naics);
  const groupsEnter = groupsUpdate.enter().append("g");
  groupsEnter.merge(groupsUpdate).attr("transform", (d, i) => {
    return `translate(0,${45 + i * 25})`;
  });
  groupsUpdate.exit().remove();
  groupsEnter
    .append("text")
    .merge(groupsUpdate.select("text"))
    .text(d => d.title)
    .style("font-size", "12px")
    .call(textBounds)
    .attr("x", 20)
    .attr("y", function(d) {
      return this.childNodes.length === 1 ? -5 : -10;
    });

  groupsEnter
    .append("path")
    .merge(groupsUpdate.select("path"))
    .attr("transform", "translate(10,0)rotate(180)")
    .attr("d", getPetalPath(20, metricKey))
    .attr("fill", d => NAICSColorLookup[d.naics]);
};

export const drawFlower = (
  props,
  flowerContainer,
  flowerWidth,
  flowerHeight
) => {
  const {
    flowerData,
    metricKey,
    petalSizeScale,
    handleFlowerMouseOver,
    handleFlowerMouseOut
  } = props;
  //console.log(flowerData)
  const angleUnit = 360 / flowerData.length;
  const groupsUpdate = select(flowerContainer)
    .selectAll("g")
    .data(flowerData, d => d.naics);
  const groupsEnter = groupsUpdate.enter().append("g");
  groupsUpdate.exit().remove();

  const rectsMerge = groupsEnter
    .append("rect")
    .merge(groupsUpdate.select("rect"))
    .attr("pointer-events", "all")
    .attr("width", 80)
    .attr("height", 100)
    .attr("fill", "none")
    //.attr("stroke", "#000")
    .attr("transform", function(d, i) {
      const cx = flowerWidth / 2;
      const cy = flowerHeight / 2;
      return (
        "translate(" + [cx, cy] + ") rotate(" + [i * angleUnit - 180 + 45] + ")"
      );
    });

  rectsMerge.on("mouseover", function(d) {
    //console.log(d)
    select(this.parentNode)
      .select("path")
      .attr("stroke", "#000");
    const chartParent = this.parentNode.parentNode.parentNode.parentNode
      .parentNode;
    const flowerTooltipData = {
      metricKey,
      industry: d.naics_title,
      naics: d.naics,
      metric: d[metricKey],
      mousePos: mouse(chartParent)
    };
    handleFlowerMouseOver(flowerTooltipData);
  });

  rectsMerge.on("mouseout", function(d) {
    //select(this).attr("stroke", "none")
    select(this.parentNode)
      .select("path")
      .attr("stroke", "none");
    handleFlowerMouseOut();
  });

  const petalsMerge = groupsEnter
    .append("path")
    .merge(groupsUpdate.select("path"))
    .attr("fill", d => NAICSColorLookup[d.naics])
    .attr("pointer-events", "none")
    .attr("d", d => getPetalPath(petalSizeScale(d[metricKey]), metricKey))
    .attr("transform", function(d) {
      const cx = flowerWidth / 2;
      const cy = flowerHeight / 2;
      return "translate(" + [cx, cy] + ") rotate(180)";
    });

  petalsMerge
    .transition()
    .duration(700)
    .attr("transform", function(d, i) {
      const cx = flowerWidth / 2;
      const cy = flowerHeight / 2;
      return "translate(" + [cx, cy] + ")rotate(" + [i * angleUnit - 180] + ")";
    });
};

export const drawFlowerLegend = (
  props,
  legendContainer,
  legendWidth,
  legendHeight
) => {
  const { metricKey, flowerLegendData, petalSizeScale } = props;
  const groupsUpdate = select(legendContainer)
    .selectAll("g")
    .data(flowerLegendData);
  const groupsEnter = groupsUpdate.enter().append("g");
  groupsEnter.merge(groupsUpdate).attr("transform", (d, i) => {
    if (flowerLegendData.length === 1) {
      return "translate(80,0)";
    } else if (flowerLegendData.length === 2) {
      return "translate(40,0)";
    } else {
      return `translate(${i * 80},0)`;
    }
  });
  groupsUpdate.exit().remove();

  groupsEnter
    .append("text")
    .merge(groupsUpdate.select("text"))
    .attr("x", 40)
    .attr("y", 140)
    .text((d, i) =>
      i === 1
        ? `${
            metricKey === "total_pmt_amt" ? format("$.2s")(d) : format(".2f")(d)
          } (Median)`
        : metricKey === "total_pmt_amt"
        ? format("$.2s")(d)
        : format(".2f")(d)
    )
    .style("text-anchor", "middle")
    .style("font-size", "10px");

  groupsEnter
    .append("path")
    .attr("transform", "translate(40,120)rotate(180)")
    .merge(groupsUpdate.select("path"))
    .transition()
    .attr("d", d => getPetalPath(petalSizeScale(d), metricKey))
    .attr("transform", "translate(40,120)rotate(180)")
    .attr("fill", "none")
    .attr("stroke", "#000");
};
