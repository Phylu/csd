$( document ).ready(function() {

    /* Helper Functions */

    /**
     * Remove the grid from a chart
     * @param data
     */
    var removeGrid = function(data) {
        if(data.type === 'grid' && data.index !== 0) {
            data.element.remove();
        }
    }

    /* Prepare Data */

    // Create Dummy Data if datasource is not available
    if (typeof getData == "undefined") {
        function getData() {
            return 'month,total,Phishing,Information leakage\n' +
                'Jan 2016,3,1,2\n' +
                'Feb 2016,4,1,3\n' +
                'Mar 2016,12,8,4\n'
        }
    }

    var csv = getData();
    var data = $.csv.toObjects(csv);

    console.log(data);

    attackTypes = ['Phishing', 'Information leakage', 'Injection attacks' ,'Malicious code',
        'Ransomware/Cryptoware', 'Denial of service', 'Botnets', 'Cyber espionage',
        'Data breaches', 'Hacking/Cracking', 'Overige', 'Anders', 'Niet van toepassing',
        'Spam', 'Illegal content'];

    var monthLabels = [];
    var attacksTotal = [];
    var attacksNumbers = [];

    for(attack of attackTypes) {
        attacksNumbers[attack] = [];
    }

    for (obj of data) {
        monthLabels.push(obj['month']);
        attacksTotal.push(obj['total']);

        for(attackType of attackTypes) {
            attacksNumbers[attackType].push(obj[attackType]);
        }

    }


    /* Configurations */

    var configBig = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            high: 100,
            onlyInteger: true
        }
    };

    var configMini = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            high: 30,
            onlyInteger: true,
            showGrid: false,
        },
        axisX: {
            showLabel: false,
            offset: 0,
        }
    };

    var configMiniLast = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            high: 30,
            onlyInteger: true
        },
    };


    /* Create Charts */

    var charts = [];

    var chartIncidents = new Chartist.Line('#chart-incidents', {
        labels: monthLabels,
        series: [attacksTotal],
    }, configBig);
    charts.push(chartIncidents);

    var attackCounter = 1

    for (var attack of attackTypes) {
        var chartDivId = "chart-" + attack.replace(/\s/g, "").replace(/\//g, "")

        var chartClass, chartConfig;
        // Last Chart should have the months depicted on the X-axis
        if (attackCounter == attackTypes.length) {
            chartClass = "mini-last";
            chartConfig = configMiniLast;
        } else {
            chartClass = "mini";
            chartConfig = configMini;
        }

        // Convert array to contain numbers
        var currAttackNumbers = attacksNumbers[attack].slice().map(Number);

        // Remove last month from array
        var lastMonth = currAttackNumbers.pop();

        // Calculate Mean and Standard Deviation
        var mean = jStat.mean(currAttackNumbers);
        var sd = jStat.stdev(currAttackNumbers, true);

        // Calculate correct trend inicator
        var trendIndicator = $("<i>").addClass("fa fa-lg");
        if (lastMonth >= mean + (3 * sd)) {
            trendIndicator.addClass("fa-arrow-up");
        } else if (lastMonth >= mean + sd) {
            trendIndicator.addClass("fa-arrow-up rotate-45-right");
        } else if (lastMonth <= mean - (3 * sd)) {
            trendIndicator.addClass("fa-arrow-down");
        } else if (lastMonth <= mean - sd) {
            trendIndicator.addClass("fa-arrow-down rotate-45-left");
        } else {
            trendIndicator.addClass("fa-arrow-right");
        }

        // Create DIVs
        var labelDiv = $("<div>").addClass("col-lg-2 vcenter").html(attack.replace(/\//g, "/ "));
        var chartDiv = $("<div>").addClass("col-lg-9 vcenter ct-chart ct-golden-section autoscaleaxis")
            .addClass(chartClass).attr('id', chartDivId);
        var trendDiv = $("<div>").addClass("col-lg-1 vcenter indicator").html(trendIndicator);

        // Add the chart DIV element to the dom
        $("#charts-incidents-type").append(labelDiv);
        $("#charts-incidents-type").append(chartDiv);
        $("#charts-incidents-type").append(trendDiv);

        // Create the new chart
        chart = new Chartist.Line('#' + chartDivId, {
            labels: monthLabels,
            series: [attacksNumbers[attack]],
        }, chartConfig);

        // Add it to the list of charts
        charts.push(chart);

        // Increase the attack counter to make sure classes are set correctly
        attackCounter++;
    }

    // Remove Grid from all charts
    for(chart of charts) {
        chart.on('draw', removeGrid);
    }


});