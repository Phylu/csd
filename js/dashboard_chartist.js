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

    for (attack of attackTypes) {
        attackDescriptor = attack.replace(/\s/g, "").replace(/\//g, "");

        var chartClass, chartConfig;
        // Last Chart should have the months depicted on the X-axis
        if (attackCounter == attackTypes.length) {
            chartClass = "mini-last";
            chartConfig = configMiniLast;
        } else {
            chartClass = "mini";
            chartConfig = configMini;
        }

        // Add the chart DIV element to the dom
        $("#charts-incidents-type").append("<div class=\"col-lg-2 vcenter\">" + attack.replace(/\//g, "/ ") +
            "</div><!--\n" + "--><div class=\"col-lg-9 vcenter ct-chart ct-golden-section autoscaleaxis " +
            chartClass + "\" id=\"chart-" + attackDescriptor + "\"></div><div class=\"col-lg-1 vcenter indicator\">" +
            "<i class=\"fa fa-arrow-up fa-lg\"></i></div>");
        // Create the new chart
        chart = new Chartist.Line('#chart-' + attackDescriptor, {
            labels: monthLabels,
            series: [attacksNumbers[attack]],
        }, chartConfig);
        // Add it to the list of charts
        charts.push(chart);

        attackCounter++;
    }

    // Remove Grid from all charts
    for(chart of charts) {
        chart.on('draw', removeGrid);
    }


});