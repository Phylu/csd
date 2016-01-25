/**
 * Created by janosch on 18.01.16.
 */

/**
 * Remove the grid from a chart
 * @param data
 */
var removeGrid = function(data) {
    if(data.type === 'grid' && data.index !== 0) {
        data.element.remove();
    }
};


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

var getStatistics = function(data) {
    // Remove last month from array
    var curr = data.pop();

    // Calculate Mean and Standard Deviation
    var mean = jStat.mean(data);
    var sd = jStat.stdev(data, true);

    return [curr, mean, sd];
};

var createOverlayChart = function(chartDivId, attackName, chartType, labels, data, config) {
    $("#" + chartDivId).click(function() {

        var overlayDiv = $("<div>").attr('id', 'overlay').addClass("overlay");
        var overlayHeading = $("<h2>").html(attackName);
        var overlayChart = $("<div>").attr('id', 'overlay-chart').addClass("ct-chart ct-double-octave autoscaleaxis");

        var overlayContainer = $("<div>").attr('id', 'overlay-container').addClass("overlay-container").
        append(overlayHeading).append(overlayChart);

        var overlay = overlayDiv.append(overlayContainer.append(overlayChart));
        overlay.appendTo(document.body)

        console.log(chartType)

        if (chartType == 'line') {
            var chart = new Chartist.Line('#overlay-chart', {
                labels: labels,
                series: data,
            }, config);
        } else if (chartType == 'bar') {
            var chart = new Chartist.Bar('#overlay-chart', {
                labels: labels,
                series: data[0],
            }, config);
        }

        $("#overlay").click(function() {
            $("#overlay").remove();
        })

    });
};

var getBiggestValue = function(input) {
    var max = -Infinity;
    var maxKey;
    for (var key in input) {
        var value = parseInt(input[key]);
        if (value > max) {
            max = value;
            maxKey = key;
        }
    }
    return maxKey;
};

var getMostAttacks = function(input) {
    var mostAttacks = [];

    for (var i = 0; i < 3; i++) {
        mostAttacks[i] = getBiggestValue(input);
        input[mostAttacks[i]] = 0;
    }
    return mostAttacks;
};

// Create Dummy Data if datasource is not available
if (typeof getData == "undefined") {
    getData = function() {
        return 'month,total,Phishing,Information leakage\n' +
            'Jan 2016,3,1,2\n' +
            'Feb 2016,4,1,3\n' +
            'Mar 2016,12,8,4\n';
    };
}

if (typeof getSectorData == "undefined") {
    getSectorData = function() {
        return 'month,Public,Private,International\n' +
            'Jan 2016,30,60,80\n' +
            'Feb 2016,90,60,80\n' +
            'Mar 2016,80,80,80\n';
    };
}

if (typeof getSectorTypeData == "undefined") {
    getSectorTypeData = function() {
        return 'sector,Phishing,Information leakage\n' +
            'Public,3,2\n' +
            'Private,1,7\n' +
            'International,12,4\n';
    };
}

if (typeof getLastYearData == "undefined") {
    getLastYearData = function() {
        return 'month,total\n' +
            'Jan 2016,7\n' +
            'Feb 2016,50\n' +
            'Mar 2016,13\n';

    };
}

if (typeof getAdvisoriesData == "undefined") {
    var getAdvisoriesData = function () {
        return 'month,advisories\n' +
            'Jan 2016,10\n' +
            'Feb 2016,10\n' +
            'Mar 2016,10\n' +
            'Apr 2016,10\n' +
            'May 2016,6\n' +
            'Jun 2016,5';
    };
}