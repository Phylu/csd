$( document ).ready(function() {

    /* Prepare Data */

    var csv = getData();
    var data = $.csv.toObjects(csv);

    csv = getLastYearData();
    var lastYearData = $.csv.toObjects(csv);

    csv = getSectorData();
    var sectorData = $.csv.toObjects(csv);

    csv = getSectorTypeData();
    var sectorTypeData = $.csv.toObjects(csv);

    console.log(sectorTypeData);

    // attackTypes in the data
    var attackTypesOriginal = ['Phishing', 'Information leakage', 'Injection attacks' ,'Malicious code',
        'Ransomware/Cryptoware', 'Denial of service', 'Botnets', 'Cyber espionage',
        'Data breaches', 'Hacking/Cracking', 'Overige', 'Anders', 'Niet van toepassing',
        'Spam', 'Illegal content'];

    // Summing up 'others'
    var others = ['Overige', 'Anders', 'Niet van toepassing'];
    var other = 'Other';

    var attackTypes = _.without(attackTypesOriginal, others[0], others[1], others[2]);
    attackTypes.push(other);

    var monthLabels = [];
    var monthOnlyLabels = [];
    var attacksTotal = [];
    var attacksNumbers = [];

    for(var attack of attackTypes) {
        attacksNumbers[attack] = [];
    }

    for (var obj of data) {
        monthLabels.push(obj['month']);
        monthOnlyLabels.push(obj['month'].substring(0,3));
        attacksTotal.push(obj['total']);

        for(var attackType of attackTypes) {
            // Only work on the non-others values
            if (attackType != other) {
                attacksNumbers[attackType].push(obj[attackType]);
            }
        }

        // Sum up the 'others' values
        var otherValue = parseInt(obj[others[0]]) + parseInt(obj[others[1]]) + parseInt(obj[others[2]]);
        attacksNumbers[other].push(otherValue);

    }

    var attacksTotalLastYear = [];
    for (var obj of lastYearData) {
        attacksTotalLastYear.push(obj['total']);
    }

    var sectorLabels = ['Public', 'Private', 'International'];
    var sectorNumbers = [];

    for (var sector in sectorLabels) {
        sectorNumbers[sector] = 0;
    }

    for (var obj of sectorData) {
        for (var sector in sectorLabels) {
            sectorNumbers[sector] += parseInt(obj[sectorLabels[sector]]);
        }
    }

    /* Create last updated label */

    $("#updated").html("Last Update: " + monthLabels.slice(-1)[0] + ".");

    $("#ideas-icon").click(function() {

        $("#ideas").show();

        $("#ideas").click(function() {
            $("#ideas").hide();
        });

    });

    $("#questions-icon").click(function() {

        $("#ideas").show();

        $("#ideas").click(function() {
            $("#ideas").hide();
        })

    });

    /* Create Charts */

    var charts = [];

    $('#chart-incidents').addClass('big');

    var chartIncidents = new Chartist.Line('#chart-incidents', {
        labels: monthOnlyLabels,
        series: [attacksTotal, attacksTotalLastYear],
    }, configBig);

    charts.push(chartIncidents);

    var stats = getStatistics(attacksTotal.slice().map(Number));
    var lastMonth = stats[0];
    var mean = stats[1];
    var sd = stats[2];
    var trendIndicator = getTrendIndicator(lastMonth, mean, sd);

    $("#trend-indicator-incidents").html(trendIndicator);

    createOverlayChart('chart-incidents', 'Reported Incidents', 'line', monthOnlyLabels, [attacksTotal, attacksTotalLastYear], configBigOverlay);

    var attackCounter = 1

    for (var attack of attackTypes) {
        var attackName = attack.replace(/\//g, "/ ")
        var chartDivId = "chart-" + attack.replace(/\s/g, "").replace(/\//g, "")

        var chartClass, chartConfig, centerClass;
        // Last Chart should have the months depicted on the X-axis
        if (attackCounter == attackTypes.length) {
            chartClass = "mini-last";
            chartConfig = configMiniLast;
            centerClass = "last-center";
        } else {
            chartClass = "mini";
            chartConfig = configMini;
            centerClass = "vertical-center";
        }

        // Convert array to contain numbers
        var currAttackNumbers = attacksNumbers[attack].slice().map(Number);

        var stats = getStatistics(currAttackNumbers);
        var lastMonth = stats[0];
        var mean = stats[1];
        var sd = stats[2];

        var trendIndicator = getTrendIndicator(lastMonth, mean, sd);

        // Create DIVs
        var rowDiv = $("<div>").addClass("row").addClass(centerClass);
        var labelDiv = $("<div>").addClass("col-lg-2 desc").html(attackName);
        var chartDiv = $("<div>").addClass("col-lg-9 ct-chart ct-golden-section autoscaleaxis clickable")
            .addClass(chartClass).attr('id', chartDivId);
        var trendDiv = $("<div>").addClass("col-lg-1 indicator").html(trendIndicator);

        // Add the chart DIV element to the dom
        rowDiv.append(labelDiv).append(chartDiv).append(trendDiv);
        $("#charts-incidents-type").append(rowDiv);

        // Create the new chart
        var chart = new Chartist.Line('#' + chartDivId, {
            labels: monthLabels,
            series: [attacksNumbers[attack]],
        }, chartConfig);

        // Add it to the list of charts
        charts.push(chart);

        createOverlayChart(chartDivId, attackName, 'line', monthLabels, [attacksNumbers[attack]], configOverlay);

        // Increase the attack counter to make sure classes are set correctly
        attackCounter++;
    }

    var chartSectors = new Chartist.Bar('#chart-sector-incidents', {
        labels: sectorLabels,
        series: sectorNumbers
    }, configBarBig);

    charts.push(chartSectors);

    createOverlayChart('chart-sector-incidents', "Incidents by Sector", 'bar', sectorLabels, [sectorNumbers], configBarOverlay);

    // Remove Grid from all charts
    for(chart of charts) {
        chart.on('draw', removeGrid);
    }




    var mostAttacks= [];
    mostAttacks['public'] = getMostAttacks(sectorTypeData[0])
    mostAttacks['private'] = getMostAttacks(sectorTypeData[1])
    mostAttacks['international'] = getMostAttacks(sectorTypeData[2])

    $('#public-top-3').html(mostAttacks.public[0] + ", " + mostAttacks.public[1] + ", " + mostAttacks.public[2]);
    $('#private-top-3').html(mostAttacks.private[0] + ", " + mostAttacks.private[1] + ", " + mostAttacks.private[2]);
    $('#international-top-3').html(mostAttacks.international[0] + ", " + mostAttacks.international[1] + ", " + mostAttacks.international[2]);


});