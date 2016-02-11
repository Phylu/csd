/**
 * Created by janosch on 26.01.16.
 */

var CSD = (function ($, Chartist, _) {
    var csd = {};
    var db, typeColumn;

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
    var configArea = {
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
        },
        showArea: true,
        plugins: [
            Chartist.plugins.tooltip()
        ],
    };

    var configAreaLast = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            high: 30,
            onlyInteger: true
        },
        showArea: true,
        plugins: [
            Chartist.plugins.tooltip()
        ],
    };

    var configAreaOverlay = {
        lineSmooth: false,
        axisY: {
            type: Chartist.AutoScaleAxis,
            low: 0,
            onlyInteger: true
        },
        chartPadding: {
            right: 30,
        },
        showArea: true,
        plugins: [
            Chartist.plugins.tooltip()
        ],
    };

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
        plugins: [
            Chartist.plugins.tooltip()
        ],
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
        plugins: [
            Chartist.plugins.tooltip()
        ],
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
     * Custom JQuery Functions
     * =======================
     */

    /**
     * Add a tooltip easily
     * @param description   Tooltip Content
     * @param position      top, bottom, left, right
     * @returns {*}
     */
    jQuery.fn.addTooltip = function(description, position) {
        return this.attr('data-toggle', 'tooltip').attr('data-placement', position).attr('title', description);
    };

    /*
     * Document Settings
     */

    /**
     * Close overlays when escape is pressed
     */
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            $("#overlay").remove();
            $(".overlay").hide();
        }
    });


    /*
     * Initialization
     * ==============
     */

    /**
     * Store the database
     * Database should be ordered by ID
     * @param database
     */
    csd.setDatabase = function (database) {
        db = database;

        // Create easily searchable date fields
        db().each(function (record) {
            var dat = record.date.split('.');
            record.day = dat[0];
            record.month = dat[1];
            record.year = dat[2];
        });

    };

    /**
     * Set the name of the type column;
     * @param name
     */
    csd.setTypeColumn = function (name) {
        typeColumn = name;
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
        var prefix = "chart-";
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
    var getStatistics = function (data) {
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
    var getTrendIndicator = function (curr, mean, sd) {
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
    var createOverlayChart = function (selector, name, chartType, labels, data, config) {
        $("#" + selector).click(function () {

            var overlayDiv = $("<div>").attr('id', 'overlay').addClass("overlay");
            var overlayClose = $("<a>").addClass('close');
            var overlayHeading = $("<h2>").html(name);
            var overlayChart = $("<div>").attr('id', 'overlay-chart').addClass("ct-chart ct-double-octave autoscaleaxis");

            var overlayContainer = $("<div>").attr('id', 'overlay-container').addClass("overlay-container").append(overlayClose).append(overlayHeading).append(overlayChart);

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

            overlayClose.click(function () {
                $("#overlay").remove();
            })

        });
    };

    /**
     * Get the maximum key in a series
     * @param series
     * @returns {*}
     */
    var getMaxKey = function (series) {
        var max = -Infinity;
        var maxKey;
        for (var key in series) {
            var value = parseInt(series[key]);
            if (value > max) {
                max = value;
                maxKey = key;
            }
        }
        if (max <= 0) {
            return undefined;
        }
        return maxKey;
    };



    /*
     * Public Helper functions
     * =======================
     */

    /**
     * Get the get the topX values of series
     * @param series
     * @param topx
     * @returns {Array}
     */
    csd.getTopX = function (series, topx) {
        var keys = [];
        var numbers = [];

        for (var i = 0; i < topx; i++) {
            keys[i] = getMaxKey(series);
            numbers[i] = series[keys[i]];
            series[keys[i]] = 0;
        }
        return [keys, numbers];
    };


    /*
     * Public Database Functions
     * =========================
     */
    /**
     * Create a Query Object
     * @constructor
     */
    csd.Query = function () {
        this.filter = [];
    };
    /**
     * Reset the Query
     */
    csd.Query.prototype.reset = function () {
        this.filter = [];
    };
    /**
     * Return the Query Results
     * @returns {V}
     */
    csd.Query.prototype.get = function () {
        if (this.filter != []) {
            return db.apply(this, this.filter).get();
        } else {
            return db.get();
        }
    };
    /**
     * Count the Query Results
     */
    csd.Query.prototype.count = function () {
        if (this.filter != []) {
            return db.apply(this, this.filter).count();
        } else {
            return db.count();
        }
    };
    /**
     * Filter by Attack Type
     * @param type
     * @returns {CSD.Query}
     */
    csd.Query.prototype.type = function (type) {
        var compObj = {};
        compObj[typeColumn] = {'==': type};

        this.filter.push(compObj);
        return this;
    };
    /**
     * Filter by Date
     * @param d
     * @param m
     * @param y
     * @returns {CSD.Query}
     */
    csd.Query.prototype.after = function (d, m, y) {
        var compObj = [
            // Later year than submited
            {year: {gt: y}},
            // Later month of same year
            {year: {'==': y}, month: {gt: m}},
            // Later day
            {year: {'==': y}, month: {'==': m}, day: {gte: d}}
        ];
        this.filter.push(compObj);
        return this;
    };
    /**
     * Filter by Date
     * @param d
     * @param m
     * @param y
     * @returns {CSD.Query}
     */
    csd.Query.prototype.before = function (d, m, y) {
        console.log(this);
        var compObj = [
            // Later year than submited
            {year: {lt: y}},
            // Later month of same year
            {year: {'==': y}, month: {lt: m}},
            // Later day
            {year: {'==': y}, month: {'==': m}, day: {lte: d}}
        ];
        this.filter.push(compObj);
        return this;
    };

    /**
     * Create a Query Object
     * @constructor
     */
    csd.DataQuery = function () {

    };

    csd.DataQuery.prototype.lastMonths = function (months) {
        var latestMonth = db().last().month;
        var latestYear = db().last().year;

        var result = [];

        for (var i = months - 1; i >= 0; i--) {
            var month = latestMonth - i;
            var year = latestYear;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            var query = new csd.Query();
            var queryResult = query.after(1, month, year).before(31, month, year).count();
            result.push(queryResult);
        }
        return result;
    };


    /*
     * Public functions to create Dashboard Elements
     * =============================================
     */

    /**
     * Set the last updated label according to the last database element
     * @param selector
     */
    csd.setLastUpdated = function (selector) {
        var lastUpdate = db().last().date;
        // TODO: Remove after screenshot
        $(selector).html("Last Update: Apr 15");// + lastUpdate);
    };

    /**
     * Create Series of area charts
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.areaSeries = function (selector, name, description, labels, series) {

        // Add Heading
        var heading = $('<h2>').html(name).addTooltip(description, 'bottom');
        $(selector).append(heading);

        // Counter to change config for last Element
        var attackCounter = 1;

        // Create an Area Graph for each of the attacks
        for (var attack in series) {

            var attackName = attack.replace(/\//g, "/ ")
            var chartSelector = createUniqueSelector();

            var chartClass, chartConfig, centerClass;
            // Last Chart should have the months depicted on the X-axis
            if (attackCounter == Object.keys(series).length) {
                chartClass = "mini-last";
                chartConfig = configAreaLast;
                centerClass = "last-center";
            } else {
                chartClass = "mini";
                chartConfig = configArea;
                centerClass = "vertical-center";
            }

            // Convert array to contain numbers
            var currAttackNumbers = series[attack].slice().map(Number);

            var stats = getStatistics(currAttackNumbers);
            var lastMonth = stats[0];
            var mean = stats[1];
            var sd = stats[2];

            var trendIndicator = getTrendIndicator(lastMonth, mean, sd);

            // Create DIVs
            var rowDiv = $("<div>").addClass("row").addClass(centerClass);
            var labelDiv = $("<div>").addClass("col-lg-2 desc").html(attackName);
            var chartDiv = $("<div>").addClass("col-lg-9 ct-chart ct-golden-section autoscaleaxis clickable")
                .addClass(chartClass).attr('id', chartSelector);
            var trendDiv = $("<div>").addClass("col-lg-1 indicator").html(trendIndicator);

            // Add the chart DIV element to the dom
            rowDiv.append(labelDiv).append(chartDiv).append(trendDiv);
            $(selector).append(rowDiv);

            // Create the new chart
            var chart = new Chartist.Line('#' + chartSelector, {
                labels: labels,
                series: [series[attack]],
            }, chartConfig);

            createOverlayChart(chartSelector, attackName, 'line', labels, [series[attack]], configAreaOverlay);

            chart.on('draw', removeGrid);

            // Increase the attack counter to make sure classes are set correctly
            attackCounter++;
        }
    };

    /**
     *
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.bar = function (selector, name, description, labels, series) {

        var chartSelector = createUniqueSelector();

        // Add Heading
        var heading = $('<h2>').html(name).addTooltip(description, 'bottom');
        $(selector).append(heading);
        $(selector).append($('<div>').attr('id', chartSelector).addClass('ct-chart autoscaleaxis clickable'));

        var chart = new Chartist.Bar('#' + chartSelector, {
            labels: labels,
            series: series,
        }, configBar);

        createOverlayChart(chartSelector, name, 'bar', labels, [series], configBarOverlay);

        chart.on('draw', removeGrid);
    };

    /**
     *
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.circles = function (selector, name, description, labels, series) {

        var heading = $('<h2>').html(name).addTooltip(description, 'bottom');
        $(selector).append(heading);

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

            // Get selector
            var svgSelector = createUniqueSelector();

            // Build up DOM with SVG element
            var rowDiv = $("<div>").addClass("row vertical-center");
            var labelDiv = $("<div>").addClass("col-lg-4 desc").html(labels[i]);
            var outerDiv = $("<div>").addClass("col-lg-8 circle-container")
                .html('<svg id="' + svgSelector + '" height="65px" width="65px" data-toggle="tooltip" data-placement="right" title="' +
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
    csd.line = function (selector, name, description, labels, series, legend) {

        var chartSelector = createUniqueSelector();

        // Add Heading
        var heading = $('<h2>').html(name).addTooltip(description, 'bottom');
        $(selector).append(heading);
        $(selector).append($('<div>').attr('id', chartSelector).addClass('ct-chart autoscaleaxis clickable big'));

        var thisConfig = configLine;
        configLine.plugins = [
            Chartist.plugins.legend({
                legendNames: legend,
                clickable: false,
            }),
            Chartist.plugins.tooltip(),
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
                /*clickable: false,*/
            }),
            Chartist.plugins.tooltip(),
        ];

        createOverlayChart(chartSelector, name, 'line', labels, series, thisConfigOverlay);

        chart.on('draw', removeGrid);
    };


    /**
     * Create Table with labels as first column and series as further columns
     * @param selector
     * @param name
     * @param labels
     * @param series
     */
    csd.table = function (selector, name, description, labels, series) {

        // Add Heading
        var heading = $('<h2>').html(name).addTooltip(description, 'bottom');
        $(selector).append(heading);

        // Create Table Element
        var tabBody = $('<tbody>');
        var tab = $('<table>').addClass('table').append(tabBody);

        // Create Rows
        for (var i = 0; i < labels.length; i++) {
            var row = $('<tr>');

            row.append($('<th>').addClass('desc').html(labels[i]));

            for (var key in series[i][0]) {
                row.append($('<td>').append($('<div>').addClass('inline').addTooltip(series[i][1][key], 'right')
                    .html(series[i][0][key])));
            }

            tabBody.append(row);
        }

        // Attach Table to $(selector)
        $(selector).append(tab);
    };


    return csd;
}(jQuery, Chartist, _));