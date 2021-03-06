/**
 * Created by janosch on 26.01.16.
 */

var jQuery = global.$ = global.jQuery = require('jquery');
var jStat = require ('jstat').jStat;
Chartist = require('chartist');
Chartist.plugins = {};
Chartist.plugins.legend = require('chartist-plugin-legend');
Chartist.plugins.tooltips = require('chartist-plugin-tooltip');
var moment = require('moment');

var CSD = (function ($, Chartist, jStat) {
    var csd = {};
    var databases = {};
    var monthLabels = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
     * Add a new database to store data
     * @param name
     * @param database
     */
    csd.addDatabase = function (name, database) {
        databases[name] = database;

        /**
         * Run queryies on database using DataQuery Object
         * @param filterObject
         * @returns {*}
         */
        csd.DataQuery.prototype[name] = function (filterObject) {
            this.filterObject = filterObject;
            this.database = name;
            return this;
        };

        /**
         * Run Query on database internally
         * @returns {Query}
         */
        Query.prototype[name] = function () {
            this.database = databases[name];
            return this;
        };

    };

    /**
     * Add a column that can be used for filtering
     * @param column
     */
    csd.addFilterable = function (column) {

        /**
         * Filter querys by column
         * @param value
         * @returns {*}
         */
        Query.prototype[column] = function (value) {
            var compObj = {};
            compObj[column] = {'likenocase': value};

            this.filter.push(compObj);
            return this;
        };

    };

    /**
     * Add date filtering capability to the database
     * Needed to run DataQuery.monthly() / DataQuery.yearly()
     * @param database
     * @param dateColumn
     */
    csd.addDateFilterable = function (database, dateColumn, dateFormat) {
        // Create easily searchable date fields
        databases[database]().each(function (record) {

            // UTC so we don't have any timezone problems
            var dat = moment.utc(record[dateColumn], dateFormat);

            record.day = dat.date();
            // + 1 as months are zero indexed
            record.month = dat.month() + 1;
            record.year = dat.year();

        });
    };

    /**
     * Remap from one column to another
     * @param oldColumn
     * @param newColumn
     * @param map
     */
    csd.group = function (database, oldColumn, newColumn, map) {
        databases[database]().each(function (record) {
            var newValue = map[record[oldColumn].toLowerCase()];
            if (typeof newValue == "undefined") {
                newValue = record[oldColumn];
            }
            record[newColumn] = newValue;
        });
    };

    /**
     * Get the labels for the last 12 months according to last data point
     * @param years     Add years to the label if true
     * @returns {Array}
     */
    csd.getLabels = function (database, years) {
        var latestMonth = databases[database]().last().month;
        var latestYear = databases[database]().last().year;

        var result = [];

        for (var i = 11; i >= 0; i--) {
            var month = latestMonth - i;
            var year = latestYear;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            var label = monthLabels[month];
            if (typeof years != "undefined" && years == true) {
                label = label + " " + String(year).substr(2, 4);;
            }
            result.push(label);
        }

        return result;
    };

    /**
     * Get the different years for the legend
     * @param years
     */
    csd.getLegend = function (database, years) {
        var latestMonth = databases[database]().last().month;
        var latestYear = databases[database]().last().year;

        var result = [];

        for (var i = 0; i < years; i++) {
            if (latestMonth == 12) {
                result.push(latestYear - i);
            } else {
                var currYear = latestYear - i;
                var year = currYear - 1;
                year += "/" + String(currYear).substr(2, 4);
                result.push(year);
            }
        }
        return result;
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
        // Additional check because 0-0-0 matches all the cases and I am too lazy to reorder the whole statement
        if (curr != mean != sd) {
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
    Query = function () {
        this.filter = [];
        this.database;
    };

    /**
     * Reset the Query
     */
    Query.prototype.reset = function () {
        this.filter = [];
    };
    /**
     * Return the Query Results
     * @returns {V}
     */
    Query.prototype.get = function () {
        if (this.filter != []) {
            return this.database.apply(this, this.filter).get();
        } else {
            return this.database.get();
        }
    };
    /**
     * Count the Query Results
     */
    Query.prototype.count = function () {
        if (this.filter != []) {
            return this.database.apply(this, this.filter).count();
        } else {
            return this.database.count();
        }
    };
    /**
     * Filter by Date
     * @param d
     * @param m
     * @param y
     * @returns {Query}
     */
    Query.prototype.after = function (d, m, y) {
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
     * @returns {Query}
     */
    Query.prototype.before = function (d, m, y) {
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
        this.filterObject = {};
        this.database;
    };

    /**
     * Get monthly stuff
     * @param months
     * @param years
     * @returns {Array}
     */
    csd.DataQuery.prototype.monthly = function (months, years) {
        if (typeof years == 'undefined') {
            years = 1;
        }

        var dateQuery = databases[this.database]().last();
        var latestMonth = dateQuery.month;
        var latestYear = dateQuery.year;

        var result = [];

        for (var y = 0; y < years; y++) {
            result[y] = [];
            for (var i = months - 1; i >= 0; i--) {
                var month = latestMonth - i;
                var year = latestYear - y;
                if (month <= 0) {
                    month += 12;
                    year -= 1;
                }
                var query = new Query();
                for (var key in this.filterObject) {
                    query[key](this.filterObject[key]);
                }
                var queryResult = query[this.database]().after(1, month, year).before(31, month, year).count();
                result[y].push(queryResult);
            }
        }
        return result;
    };

    /**
     * Get data for the last year
     */
    csd.DataQuery.prototype.yearly = function () {

        var dateQuery = databases[this.database]().last();
        var latestMonth = dateQuery.month;
        var latestYear = dateQuery.year;

        var startMonth, startYear;
        if (latestMonth == 12) {
            startMonth = 1;
            startYear = latestYear;
        } else {
            startMonth = latestMonth + 1;
            startYear = latestYear - 1;
        }

        var query = new Query();
        for (var key in this.filterObject) {
            query[key](this.filterObject[key]);
        }

        var queryResult = query[this.database]().after(1, startMonth, startYear - 1).before(31, latestMonth, latestYear).count();
        return queryResult;
    };


    /*
     * Public functions to create Dashboard Elements
     * =============================================
     */

    /**
     * Set the last updated label according to the last database element
     * @param selector
     */
    csd.setLastUpdated = function (selector, database) {
        var lastUpdate = databases[database]().last().date;
        $(selector).html("Last Update: " + lastUpdate);
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

        // Get Maximum
        var factor = 30 / Math.max(...series);

        // Iterate over last 12 months
        for (var i = 0; i <= Math.min(series.length - 1, 11); i++) {

            var size = series[i] * factor;

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
}(jQuery, Chartist, jStat));

module.exports = CSD;