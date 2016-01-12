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
        'Spam', 'Illegal content']

    var monthLabels = [];
    var attacksTotal = [];
    var attacksNumbers = [];

    for(attack of attackTypes) {
        attacksNumbers[attack] = [];
    }

    var attacksPhishing = [];
    var attacksInformationLeakage = [];
    var attacksInjectionAttacks = [];

    //console.log(attacksNumbers);

    for (obj of data) {
        monthLabels.push(obj['month']);
        attacksTotal.push(obj['total']);
        attacksPhishing.push(obj['Phishing']);
        attacksInformationLeakage.push(obj['Information leakage']);

        attacksInjectionAttacks.push(obj['Injection attacks']);

        for(attackType of attackTypes) {
            attacksNumbers[attackType].push(obj[attackType]);
        }

    }

    console.log(monthLabels);


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
        if (attackCounter == attackTypes.length) {
            chartClass = "mini-last";
            chartConfig = configMiniLast;
        } else {
            chartClass = "mini";
            chartConfig = configMini;
        }

        $("#charts-incidents-type").append("<div class=\"col-lg-2 vcenter\">" + attack.replace(/\//g, "/ ") + "</div><!--\n" +
            "--><div class=\"col-lg-10 vcenter ct-chart ct-golden-section autoscaleaxis " + chartClass + "\" id=\"chart-" +
            attackDescriptor + "\"></div>");
        chart = new Chartist.Line('#chart-' + attackDescriptor, {
            labels: monthLabels,
            series: [attacksNumbers[attack]],
        }, chartConfig);
        charts.push(chart);

        attackCounter++;
    }

    /*
    var chartPhishing = new Chartist.Line('#chart-phishing', {
        labels: monthLabels,
        series: [attacksNumbers['Phishing']],
    }, configMini);
    charts.push(chartPhishing);

    var chartInformationLeakage = new Chartist.Line('#chart-information-leakage', {
        labels: monthLabels,
        series: [attacksNumbers['Information leakage']],
    }, configMini);
    charts.push(chartInformationLeakage);

    var chartInjectionAttacks = new Chartist.Line('#chart-injection-attacks', {
        labels: monthLabels,
        series: [attacksNumbers['Injection attacks']],
    }, configMini);
    charts.push(chartInjectionAttacks)

    var chartMaliciousCode = new Chartist.Line('#chart-malicious-code', {
        labels: monthLabels,
        series: [attacksNumbers['Malicious code']],
    }, configMini);
    charts.push(chartMaliciousCode);
    */

    // Remove Grid from all charts
    for(chart of charts) {
        chart.on('draw', removeGrid);
    }


});