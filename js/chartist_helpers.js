/**
 * Created by janosch on 18.01.16.
 */



// Create Dummy Data if datasource is not available

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