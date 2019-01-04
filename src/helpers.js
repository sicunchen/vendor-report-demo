import { geoAlbersUsa, scaleSqrt, max, quantile } from "d3";

export const lqOptions = [
  { label: "Employee LQ", value: "lq_wgt_annual_avg_emplvl" },
  { label: "Establishment Count LQ", value: "lq_wgt_annual_avg_estabs_count" },
  { label: "Annual Pay LQ", value: "lq_wgt_avg_annual_pay" }
];
//get location in the heading
export const getLocation = (mapRawData, fipscode, USStateList, vizType) => {
  if (fipscode) {
    if (/000$/.test(fipscode)) {
      return USStateList.filter(
        obj => obj.statecode == fipscode.toString().replace("000", "")
      )[0].statename;
    } else {
      if (vizType === "map") {
        return USStateList.filter(
          obj => obj.statecode === +fipscode.toString().slice(0, 2)
        )[0].statename;
      } else {
        return mapRawData.filter(obj => obj.fipscode == fipscode)[0]
          .county_name;
      }
    }
  } else {
    return "National";
  }
};

export const filterSpendingData = (mapRawData, clickedFips) => {
  const filteredSpending = clickedFips
    ? //todo: ask kevin to filter all the zero payment and negative payment
      mapRawData
        .filter(
          obj =>
            obj.fipscode
              .toString()
              .startsWith(clickedFips.toString().slice(0, 2)) &&
            !/000$/.test(obj.fipscode)
        )
        .filter(obj => obj.combined_total_pmt_amt > 0)
    : mapRawData
        .filter(obj => /000$/.test(obj.fipscode))
        .filter(obj => obj.combined_total_pmt_amt > 0);
  return filteredSpending;
};

export const filterBeeswarmData = (bsRawData, clickedFips) => {
  return bsRawData.filter(obj => obj.fipscode === clickedFips);
};
export const getSpendingRadiuScale = spendingData => {
  //important: convert payment amount to type number so that the max number is correct
  spendingData.forEach(
    obj => (obj.combined_total_pmt_amt = +obj.combined_total_pmt_amt)
  );
  return scaleSqrt()
    .domain([0, max(spendingData, d => d.combined_total_pmt_amt)])
    .range([0, 50]);
  //return scaleSqrt().domain(extent(spendingData, d => d.combined_total_pmt_amt)).range([1, 50]);
};

//generate nodes for the spending "map"
export const getNodesData = (spendingData, centerCoords, config) => {
  //important: convert payment amount to type number so that the max number is correct
  spendingData.forEach(
    obj => (obj.combined_total_pmt_amt = +obj.combined_total_pmt_amt)
  );

  //console.log(spendingData)
  //console.log(extent(spendingData, d => d.combined_total_pmt_amt))
  //console.log(centerCoords)

  config = {
    svgWidth: 960,
    svgHeight: 600,
    ...config
  };
  const { sizeScale, svgWidth, svgHeight } = config;
  const projection = geoAlbersUsa()
    .scale(svgWidth * 0.7)
    .translate([svgWidth / 2, svgHeight / 2]);
  const nodesData = spendingData.map(node => {
    const label = centerCoords[node.fipscode].name;
    const location = node.county_name;
    const [cx, cy] = projection(centerCoords[node.fipscode].center);

    const r = sizeScale(node.combined_total_pmt_amt);
    return {
      cx,
      cy,
      r,
      label,
      spending: node.combined_total_pmt_amt,
      fipscode: node.fipscode,
      location
    };
  });

  //console.log(nodesData)
  return nodesData;
};

export const getSpendingLegendData = spendingData => {
  return spendingData.length !== 1
    ? [0, 0.5, 1].map(i =>
        quantile(
          spendingData.map(d => d.combined_total_pmt_amt).sort((a, b) => a - b),
          i
        )
      )
    : spendingData.map(d => d.combined_total_pmt_amt);
};

export const getBsLegendData = beeswarmData => {
  return beeswarmData.length !== 1
    ? [0, 0.5, 1].map(i =>
        quantile(
          beeswarmData.map(d => +d.total_pmt_amt).sort((a, b) => a - b),
          i
        )
      )
    : beeswarmData.map(d => d.total_pmt_amt);
};

export const getFlowerData = (flowerRawData, clickedFips, metricKey) => {
  flowerRawData.forEach(obj => (obj[metricKey] = +obj[metricKey]));
  return clickedFips
    ? flowerRawData.filter(obj => obj.fipscode == clickedFips)
    : flowerRawData.filter(obj => obj.statecode == "NULL");
};
export const getFLowerLegendData = (flowerData, metricKey) => {
  return flowerData.length !== 1
    ? [0, 0.5, 1].map(i =>
        quantile(flowerData.map(d => +d[metricKey]).sort((a, b) => a - b), i)
      )
    : flowerData.map(d => d[metricKey]);
};

export const getPetalSizeScale = (flowerData, metricKey) => {
  return scaleSqrt()
    .domain([0, max(flowerData, d => d[metricKey])])
    .range([0, 100]);
};

export const getPetalPath = (petalSize, metricKey) => {
  let petalPath;
  switch (metricKey) {
    case "lq_wgt_annual_avg_emplvl":
      petalPath = [
        "M0,0",
        `C${petalSize / 2},${petalSize / 4}, ${petalSize / 2},${petalSize *
          0.75} 0,${petalSize}`,
        `C${-petalSize / 2},${petalSize * 0.75} ${-petalSize / 2},${petalSize /
          4} 0,0`
      ];
      break;
    default:
      petalPath = [
        "M0,0",
        `C${petalSize / 2},${petalSize / 2} ${petalSize /
          2},${petalSize} 0,${petalSize}`,
        `C-${petalSize / 2},${petalSize} -${petalSize / 2},${petalSize / 2} 0,0`
      ];
      break;
  }
  return petalPath;
};

export const getTop5Locations = (spendingData, USStateList, clickedFips) => {
  const top5Locations = spendingData
    .sort((a, b) =>
      a.combined_total_pmt_amt < b.combined_total_pmt_amt ? 1 : -1
    )
    .slice(1, 6)
    .map(spendingObj =>
      clickedFips
        ? spendingObj.county_name.replace(/,\s[A-Z][A-Z]/, "")
        : USStateList.filter(obj => obj.statecode === +spendingObj.statecode)[0]
            .statename
    );

  return `${top5Locations.slice(0, 4).join(", ")} and ${top5Locations[4]}`;
};

export const getNumberOne = (spendingData, USStateList, clickedFips) => {
  const totalSpending = spendingData.reduce(
    (acc, curr) => acc + curr.combined_total_pmt_amt,
    0
  );
  const numberOne = spendingData.sort((a, b) =>
    a.combined_total_pmt_amt < b.combined_total_pmt_amt ? 1 : -1
  )[0];
  return {
    locationName: clickedFips
      ? numberOne.county_name.replace(/,\s[A-Z][A-Z]/, "")
      : USStateList.filter(obj => obj.statecode === +numberOne.statecode)[0]
          .statename,
    percentage: numberOne.combined_total_pmt_amt / totalSpending
  };
};

export const getBubbleLegendInput = (rawData, metric) => {
  // todo: ask kevin to filter all the zero payments in the data

  return [0, 0.25, 0.5, 0.75, 1].map(i =>
    quantile(
      rawData
        .filter(obj => obj.total_pmt_amt !== 0)
        .map(d => d[metric])
        .sort((a, b) => a - b),
      i
    )
  );
};

export const NAICSColorLookup = {
  11: "#a4044d",
  21: "#bb190a",
  22: "#758c45",
  23: "#048a37",
  31: "#224f3e",
  32: "#e9b4f5",
  33: "#51e258",
  42: "#eb6be6",
  44: "#6778f5",
  45: "#0b29d0",
  48: "#3588d1",
  49: "#1e438d",
  51: "#f1bb99",
  52: "#169294",
  53: "#a772a7",
  54: "#f47d0d",
  55: "#781486",
  56: "#66d9cf",
  61: "#a5cbeb",
  62: "#f3c011",
  71: "#b17659",
  72: "#683c00",
  81: "#afd35a",
  92: "#f6568b"
};
