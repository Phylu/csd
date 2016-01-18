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
        trendIndicator.addClass("fa-arrow-up");
    } else if (curr >= mean + sd) {
        trendIndicator.addClass("fa-arrow-up rotate-45-right");
    } else if (curr <= mean - (3 * sd)) {
        trendIndicator.addClass("fa-arrow-down");
    } else if (curr <= mean - sd) {
        trendIndicator.addClass("fa-arrow-down rotate-45-left");
    } else {
        trendIndicator.addClass("fa-arrow-right");
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
}

var createOverlayChart = function(chartDivId, attackName, chartType, labels, data) {
    $("#" + chartDivId).click(function() {

        var overlayDiv = $("<div>").attr('id', 'overlay');
        var overlayHeading = $("<h2>").html(attackName);
        var overlayChart = $("<div>").attr('id', 'overlay-chart').addClass("ct-chart ct-double-octave autoscaleaxis");

        var overlayContainer = $("<div>").attr('id', 'overlay-container').append(overlayHeading).append(overlayChart);

        var overlay = overlayDiv.append(overlayContainer.append(overlayChart));
        overlay.appendTo(document.body)

        console.log(chartType)

        if (chartType == 'line') {
            var chart = new Chartist.Line('#overlay-chart', {
                labels: labels,
                series: [data],
            }, configOverlay);
        } else if (chartType == 'bar') {
            var chart = new Chartist.Bar('#overlay-chart', {
                labels: labels,
                series: data,
            }, configBarOverlay);
        }

        $("#overlay").click(function() {
            $("#overlay").remove();
        })

    });
}

// Create Dummy Data if datasource is not available
if (typeof getData == "undefined") {
    getData = function() {
        return 'month,total,Phishing,Information leakage\n' +
            'Jan 2016,3,1,2\n' +
            'Feb 2016,4,1,3\n' +
            'Mar 2016,12,8,4\n'
    }
}

if (typeof getSectorData == "undefined") {
    getSectorData = function() {
        return 'month,Public,Private,International\n' +
            'Jan 2016,30,60,80\n' +
            'Feb 2016,90,60,80\n' +
            'Mar 2016,80,80,80\n';
    }
}