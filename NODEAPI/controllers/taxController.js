const asyncHandler = require("express-async-handler");

const defineTaxRate = asyncHandler((req, res) => {
  const state = req.body.state;
  const taxRateDictionary = {
    AL: 4,
    AK: 0,
    AZ: 5.6,
    AR: 6.5,
    CA: 7.25,
    CO: 2.9,
    CT: 6.35,
    DE: 0,
    FL: 6,
    GA: 4,
    HI: 4,
    ID: 6,
    IL: 6.25,
    IN: 7,
    IA: 6,
    KS: 6.5,
    KY: 6,
    LA: 4.45,
    ME: 5.5,
    MD: 6,
    MA: 6.25,
    MI: 6,
    MN: 6.875,
    MS: 7,
    MO: 4.225,
    MT: 0,
    NE: 5.5,
    NV: 6.85,
    NH: 0,
    NJ: 6.625,
    NM: 5.125,
    NY: 4,
    NC: 4.75,
    ND: 5,
    OH: 5.75,
    OK: 4.5,
    OR: 0,
    PA: 6,
    RI: 7,
    SC: 6,
    SD: 4.5,
    TN: 7,
    TX: 6.25,
    UT: 4.85,
    VT: 6,
    VA: 5.3,
    WA: 6.5,
    WV: 6,
    WI: 5,
    WY: 4,
  };
  let taxRate;
  function correspondingTax(stateAbbrev) {
    taxRate = taxRateDictionary[stateAbbrev];
  }
  correspondingTax(state);
  //console.log([state, taxRate]);
  res.status(200).json(taxRate);
});

const calculateTax = asyncHandler((req, res) => {
  let taxRate = req.body.taxRate;
  let jobPrice = req.body.jobPrice;
  //console.log(req.body);

  if (jobPrice === "" || taxRate === "Please add tax rate manually") {
    jobPrice = 0;
    taxRate = 0;
  }

  const taxAmount = (taxRate / 100) * parseFloat(jobPrice);
  const finalPrice = parseFloat(jobPrice) + parseFloat(taxAmount.toFixed(2));
  //console.log(finalPrice, taxAmount);
  res.status(200).json(finalPrice);
});

module.exports = { defineTaxRate, calculateTax };
