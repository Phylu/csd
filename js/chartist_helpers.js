/**
 * Created by janosch on 18.01.16.
 */



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