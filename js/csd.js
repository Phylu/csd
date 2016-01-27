/**
 * Created by janosch on 26.01.16.
 */

var CSD = (function ($, Chartist, _) {
    var csd = {};

    // TODO: Implement http://www.taffydb.com/

    // Example Code
    /*
     privateVariable = 1;

     function privateMethod() {
     // ...
     }

     csd.moduleProperty = 1;
     csd.moduleMethod = function () {
     // ...
     };
     */


    /*
     * Chartist Configurations
     * =======================
     */
    var configBar = {
        axisY: {
            offset: 100,
        },
        chartPadding: {
            right: 30,
        },
        onlyInteger: true,
        distributeSeries: true,
        horizontalBars: true,
        reverseData: true,
    };

    var configBarOverlay = {
        axisY: {
            offset: 100,
        },
        axisX: {
            onlyInteger: true,
        },
        chartPadding: {
            right: 30,
        },
        onlyInteger: true,
        distributeSeries: true,
        horizontalBars: true,
    };

    var configLine = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            onlyInteger: true
        },
        chartPadding: {
            right: 30,
        },
    };

    var configLineOverlay = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            onlyInteger: true
        },
        chartPadding: {
            right: 30,
        },
    };

    /*
     * Helper functions
     * ================
     */

    /**
     * Remove the grid from a chart
     * @param data
     */
    var removeGrid = function (data) {
        if (data.type === 'grid' && data.index !== 0) {
            data.element.remove();
        }
    };

    /**
     * Create a unique chart selector
     */
    var createUniqueSelector = (function () {
        var id = 0;
        var prefix = "chart-"
        return function () {
            if (arguments[0] === 0) {
                id = 0;
            }
            return prefix + id++;
        }
    })();

    /**
     * Create Statistics of array element
     * @param data
     * @returns [curr, mean, sd]
     */
    var getStatistics = function(data) {
        // Remove last month from array
        var curr = data.pop();

        // Calculate Mean and Standard Deviation
        var mean = jStat.mean(data);
        var sd = jStat.stdev(data, true);

        return [curr, mean, sd];
    };

    /**
     * Create a trend indicator based on the current value, the mean and the sd
     * @param curr
     * @param mean
     * @param sd
     * @returns <i>-Element
     */
    var getTrendIndicator = function(curr, mean, sd) {
        var trendIndicator = $("<i>").addClass("fa");
        if (curr >= mean + (3 * sd)) {
            trendIndicator.addClass("fa-arrow-up high");
        } else if (curr >= mean + sd) {
            trendIndicator.addClass("fa-arrow-up rotate-45-right raising");
        } else if (curr <= mean - (3 * sd)) {
            trendIndicator.addClass("fa-arrow-down low");
        } else if (curr <= mean - sd) {
            trendIndicator.addClass("fa-arrow-down rotate-45-left falling");
        } else {
            trendIndicator.addClass("fa-arrow-right stable");
        }
        return trendIndicator;
    };

    /**
     * Create an overlay chart when clicked on the real chart
     * @param selector
     * @param name
     * @param chartType
     * @param labels
     * @param data
     * @param config
     */
    var createOverlayChart = function(selector, name, chartType, labels, data, config) {
        $("#" + selector).click(function() {

            var overlayDiv = $("<div>").attr('id', 'overlay').addClass("overlay");
            var overlayHeading = $("<h2>").html(name);
            var overlayChart = $("<div>").attr('id', 'overlay-chart').addClass("ct-chart ct-double-octave autoscaleaxis");

            var overlayContainer = $("<div>").attr('id', 'overlay-container').addClass("overlay-container").
            append(overlayHeading).append(overlayChart);

            var overlay = overlayDiv.append(overlayContainer.append(overlayChart));
            overlay.appendTo(document.body);

            var chart;
            if (chartType == 'line') {
                chart = new Chartist.Line('#overlay-chart', {
                    labels: labels,
                    series: data,
                }, config);
            } else if (chartType == 'bar') {
                chart = new Chartist.Bar('#overlay-chart', {
                    labels: labels,
                    series: data[0],
                }, config);
            }

            $("#overlay").click(function() {
                $("#overlay").remove();
            })

        });
    };


    /*
     * Public functions to create Dashboard Elements
     * =============================================
     */

    /**
     *
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.bar = function (selector, name, labels, series) {

        var chartSelector = createUniqueSelector();

        // Add Heading
        $(selector).append($('<h2>').html(name));
        $(selector).append($('<div>').attr('id', chartSelector).addClass('ct-chart autoscaleaxis clickable'));

            var chart = new Chartist.Bar('#' + chartSelector, {
                labels: labels,
                series: series,
            }, configBar);

            chart.on('draw', removeGrid);

        createOverlayChart(chartSelector, name, 'bar', labels, [series], configBarOverlay);
    };

    /**
     *
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.circles = function (selector, name, labels, series) {

        $(selector).append($('<h2>').html(name));

        // Get Total Value for last 12 month
        var total = 0;
        for (var i = Math.min(series.length - 1, 11); i >= 0; i--) {
            total += parseInt(series[i]);
        }

        // Iterate over last 12 months
        for (var i = Math.min(series.length - 1, 11); i >= 0; i--) {

            // Get current percentage of this month
            var percentage = parseInt(series[i]) / total;

            // Scaling so that the biggest ones still fit the div
            var size = percentage * 150;

            // Build up DOM with SVG element
            var rowDiv = $("<div>").addClass("row vertical-center");
            var labelDiv = $("<div>").addClass("col-lg-6 desc").html(labels[i]);
            var outerDiv = $("<div>").addClass("circle-container")
                .html('<svg height="65px" width="65px" data-toggle="tooltip" data-placement="right" title="' +
                    series[i] + '"><circle cx="30" cy="30" r="' + size + '" fill="#d70206"/></svg>');

            rowDiv.append(labelDiv).append(outerDiv);
            $(selector).append(rowDiv);

        }

    };

    /**
     *
     * @param selector
     * @param name
     * @param labels
     * @param series
     * @param names
     */
    csd.line = function (selector, name, labels, series, legend) {

        var chartSelector = createUniqueSelector();

        // Add Heading
        var heading = $('<h2>').html(name);
        $(selector).append(heading);
        $(selector).append($('<div>').attr('id', chartSelector).addClass('ct-chart autoscaleaxis clickable big'));

       var thisConfig = configLine;
        configLine.plugins =  [
            Chartist.plugins.legend({
                legendNames: legend,
                clickable: false,
            })
        ];

        var chart = new Chartist.Line('#' + chartSelector, {
            labels: labels,
            series: series,
        }, thisConfig);


        var stats = getStatistics(series[0].slice().map(Number));
        var lastMonth = stats[0];
        var mean = stats[1];
        var sd = stats[2];
        var trendIndicator = getTrendIndicator(lastMonth, mean, sd);

        heading.append(' (');
        heading.append(trendIndicator);
        heading.append(')');

        var thisConfigOverlay = configLineOverlay;
        thisConfigOverlay.plugins = [
            Chartist.plugins.legend({
                legendNames: legend,
                clickable: false,
            })
        ];
        createOverlayChart(chartSelector, name, 'line', labels, series, thisConfigOverlay);

        chart.on('draw', removeGrid);
    };

    csd.lineSeries = function (selector, name, labels, series) {

        //chart.on('draw', removeGrid);
    };


    /**
     * Create Table with labels as first column and series as further columns
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.table = function (selector, name, labels, series) {

        // Add Heading
        $(selector).append($('<h2>').html(name));

        // Create Table Element
        var tabBody = $('<tbody>');
        var tab = $('<table>').addClass('table').append(tabBody);

        // Create Rows
        for (var i = 0; i < labels.length; i++) {
            var row = $('<tr>');

            row.append($('<th>').addClass('desc').html(labels[i]));

            for (dataPoint of series[i]) {
                row.append($('<td>').html(dataPoint));
            }

            tabBody.append(row);
        }

        // Attach Table to $(selector)
        $(selector).append(tab);
    };

    return csd;
}(jQuery, Chartist, _));