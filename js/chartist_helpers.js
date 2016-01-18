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

// Create Dummy Data if datasource is not available
if (typeof getData == "undefined") {
    getData = function() {
        return 'month,total,Phishing,Information leakage\n' +
            'Jan 2016,3,1,2\n' +
            'Feb 2016,4,1,3\n' +
            'Mar 2016,12,8,4\n'
    }
}