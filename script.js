document.getElementById("calculatorForm").addEventListener("submit", function(e) { 
    e.preventDefault();

    // Fetching input values
    let ppmCl = parseFloat(document.getElementById("chloride").value);
    let ppmSO4 = parseFloat(document.getElementById("sulphate").value);
    let ppmCO3 = parseFloat(document.getElementById("carbonate").value);
    let ppmHCO3 = parseFloat(document.getElementById("bicarbonate").value);
    let ppmCa = parseFloat(document.getElementById("calcium").value);
    let ppmMg = parseFloat(document.getElementById("magnesium").value);
    let ppmSr = parseFloat(document.getElementById("strontium").value);
    let ppmK = parseFloat(document.getElementById("potassium").value);  // Corrected potassium field

    // Check if values are valid numbers
    if (isNaN(ppmCl) || isNaN(ppmSO4) || isNaN(ppmCO3) || isNaN(ppmHCO3) || 
        isNaN(ppmCa) || isNaN(ppmMg) || isNaN(ppmSr) || isNaN(ppmK)) {
        alert("Please enter valid numbers for all fields.");
        return;
    }

    // Call the function to calculate salinity and alkalinity
    let result = calculateSalinityAndAlkalinity(ppmCl, ppmSO4, ppmCO3, ppmHCO3, ppmCa, ppmMg, ppmSr, ppmK);

    // Displaying the results in the HTML
    document.getElementById("sodium").innerHTML = "<strong>" + Math.round(result.SodiumCalculated) + " ppm" + "</strong>";
    document.getElementById("tds").innerHTML = "<strong>" + Math.round(result.TDS) + " ppm" + "</strong>";
    document.getElementById("salinityAsNaCl").innerHTML = "<strong>" + Math.round(result.SalinityAsNaCl) + " ppm" + "</strong>";
    document.getElementById("ps").innerHTML = "<strong>" + result.PS.toFixed(2) + " %" + "</strong>";
    document.getElementById("ss").innerHTML = "<strong>" + result.SS.toFixed(2) + " %" + "</strong>";
    document.getElementById("pa").innerHTML = "<strong>" + result.PA.toFixed(2) + " %" + "</strong>";
    document.getElementById("sa").innerHTML = "<strong>" + result.SA.toFixed(2) + " %" + "</strong>";
    document.getElementById("gentype").innerHTML = "<strong>"+ result.gentype +"</strong>";
    document.getElementById("resultString").innerHTML = "<strong>"+result.resultString+"</strong>";

    // Show the results section
    document.getElementById("result").style.display = "block";
});

// The calculation function
function calculateSalinityAndAlkalinity(ppmCl, ppmSO4, ppmCO3, ppmHCO3, ppmCa, ppmMg, ppmSr, ppmK) {
    let epmCl = ppmCl / 35.5;
    let epmSO4 = ppmSO4 * 2 / 96;
    let epmCO3 = ppmCO3 * 2 / 60;
    let epmHCO3 = ppmHCO3 / 61;
    let epmCa = ppmCa * 2 / 40;
    let epmMg = ppmMg * 2 / 24.3;
    let epmSr = ppmSr * 2 / 87.6;
    let epmK = ppmK / 39.1;

    let totalAnions = epmCl + epmSO4 + epmCO3 + epmHCO3;
    let totalCations = epmCa + epmMg + epmSr + epmK;

    let epmNa = totalAnions - totalCations;
    let ppmNa = epmNa * 23;

    let TDS = ppmCl + ppmSO4 + ppmCO3 + ppmHCO3 + ppmCa + ppmMg + ppmSr + ppmK + ppmNa;
    let SalNaCl= ppmCl * 58.5/35.5;

    let A = epmNa + epmK;
    let B = epmCl + epmSO4;
    let C = epmCa + epmMg + epmSr;
    let D = epmCO3 + epmHCO3;

    let PS = 0, SS = 0, PA = 0, SA = 0;

    if (A > B) {
        PS = B;
        let remainingA = A - B;
        if (remainingA <= D) {
            PA = remainingA;
            SA = (D - remainingA);
        }
    } else if (A < B) {
        PS = A;
        let remainingB = B - A;
        if (remainingB <= C) {
            SS = remainingB;
            SA = (C - remainingB);
        }
    }

    let total = PS + SS + PA + SA;
    PS = PS * 100 / total;
    SS = SS * 100 / total;
    PA = PA * 100 / total;
    SA = SA * 100 / total;

    // Genetic type logic
    let gentype = "";
    let j = epmNa / epmCl;
    let x = (epmNa - epmCl) / epmSO4;
    let y = (epmCl - epmNa) / epmMg;

    if (j < 1 && x < 0 && y > 1) {
        gentype = "Chloride-Calcium";
    } else if (j < 1 && x < 0 && y < 1) {
        gentype = "Chloride-Magnesium";
    } else if (j > 1 && x > 1 && y < 0) {
        gentype = "Bicarbonate-Sodium";
    } else if (j > 1 && x < 1 && y < 0) {
        gentype = "Sulphate-Sodium";
    }

    // Create an array of objects containing the values and corresponding strings
    const strings = {
        PS: "S1",
        SS: "S2",
        PA: "A1",
        SA: "A2"
    };

    const values = [
        { variable: 'PS', value: PS, string: strings.PS },
        { variable: 'SS', value: SS, string: strings.SS },
        { variable: 'PA', value: PA, string: strings.PA },
        { variable: 'SA', value: SA, string: strings.SA }
    ];

    // Filter out objects with zero value and sort by value in decreasing order
    const sortedValues = values
        .filter(item => item.value > 0) // Remove zero values
        .sort((a, b) => b.value - a.value); // Sort in decreasing order based on 'value'

    // Build the resulting string
    let resultString = sortedValues.map(item => item.string).join("");

    return { SodiumCalculated: ppmNa, TDS, SalinityAsNaCl: SalNaCl, PS, SS, PA, SA, gentype, resultString };
}
