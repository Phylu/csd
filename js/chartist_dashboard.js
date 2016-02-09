var load = function(csv) {

    var data = $.csv.toObjects(csv);
    var db = TAFFY(JSON.stringify(data));
    CSD.setDatabase(db);

    CSD.setTypeColumn('CustomField.{Hulpmiddel}');

    //console.log(JSON.stringify(data));
    /*
    // Get all
    console.log(db().get());

    // Count
    console.log(db().count());

    // All pulic
    console.log(db().filter({sector: "Public"}).get())

    // Max value --> Create new column for sortable date?
    console.log(db().max("date"));

    // Sectors
    // Public: "rijksoverheid";"publiek"
    // Private: "privaat";"telecom";"secundaire";"zorg";"financieel";"water";"haven";"onbekend";"luchthaven";"energie";"spoor";"verzeker";"MSP";"multinationals"
    // International: "internationaal";"partners"

*/
};


var createDashboard = function() {


    /*
     * Create Header
     * =============
     */
    CSD.setLastUpdated("#updated");

    var db = new CSD.Query();
    console.log(db.type('phishing').after(15, 1, 2016).get());
    //console.log(db.perType("phishing"));
    //console.log(CSD.db.after(15, 1, 2016).perType('phishing'));

    /* Prepare Data */

    var csv = getData();
    var data = $.csv.toObjects(csv);

    csv = getLastYearData();
    var lastYearData = $.csv.toObjects(csv);

    csv = getSectorData();
    var sectorData = $.csv.toObjects(csv);

    csv = getSectorTypeData();
    var sectorTypeData = $.csv.toObjects(csv);

    csv = getAdvisoriesData();
    var advisoriesData = $.csv.toObjects(csv);

    // attackTypes in the data
    var attackTypesOriginal = ['Phishing', 'Information leakage', 'Injection attacks', 'Malicious code',
        'Ransomware/Cryptoware', 'Denial of service', 'Botnets', 'Cyber espionage',
        'Data breaches', 'Hacking/Cracking', 'Overige', 'Anders', 'Niet van toepassing',
        'Spam', 'Illegal content'];

    // Summing up 'others'
    var others = ['Overige', 'Anders', 'Niet van toepassing'];
    var other = 'Other';

    var attackTypes = _.without(attackTypesOriginal, others[0], others[1], others[2]);
    attackTypes.push(other);

    var monthLabels = [];
    var monthOnlyLabels = [];
    var attacksTotal = [];
    var attacksNumbers = [];

    for (var attack of attackTypes) {
        attacksNumbers[attack] = [];
    }

    for (var obj of data) {
        monthLabels.push(obj['month']);
        monthOnlyLabels.push(obj['month'].substring(0, 3));
        attacksTotal.push(obj['total']);

        for (var attackType of attackTypes) {
            // Only work on the non-others values
            if (attackType != other) {
                attacksNumbers[attackType].push(obj[attackType]);
            }
        }

        // Sum up the 'others' values
        var otherValue = parseInt(obj[others[0]]) + parseInt(obj[others[1]]) + parseInt(obj[others[2]]);
        attacksNumbers[other].push(otherValue);

    }

    var attacksTotalLastYear = [];
    for (var obj of lastYearData) {
        attacksTotalLastYear.push(obj['total']);
    }

    var sectorLabels = ['Public', 'Private', 'International'];
    var sectorNumbers = [];

    for (var sector in sectorLabels) {
        sectorNumbers[sector] = 0;
    }

    for (var obj of sectorData) {
        for (var sector in sectorLabels) {
            sectorNumbers[sector] += parseInt(obj[sectorLabels[sector]]);
        }
    }

    /* Create last updated label */





    /*
     * Reported Incidents
     * ==================
     */

    CSD.line('#incidents', 'Reported Incidents', 'Reported Incidents shows how many incidents were reported to the NCSC in total for the last months.', monthOnlyLabels, [attacksTotal, attacksTotalLastYear],
        ['2014/15', '2013/14']);


    /*
     * Incidents per Type
     * ==================
     */
    CSD.areaSeries('#incidents-type', 'Incidents per Type', 'Incidents per Type shows the number of incidents reported to the NCSC where a specific attack type was used.', monthLabels, attacksNumbers)


    /*
     * Incidents per Sector
     * ====================
     */
    CSD.bar('#sector-incidents', 'Incidents by Sector', 'Incidents by Sector shows how many attacks were reported in each sector in the last year.', sectorLabels, sectorNumbers);


    /*
     * Top 3 attacks per sector
     * ========================
     */
    var mostAttacks = [];
    mostAttacks[0] = CSD.getTopX(sectorTypeData[0], 3);
    mostAttacks[1] = CSD.getTopX(sectorTypeData[1], 3);
    mostAttacks[2] = CSD.getTopX(sectorTypeData[2], 3);

    var sectors = ['Public', 'Private', 'International'];
    CSD.table('#sector-top-3', 'Top 3 Attacks per Sector', 'Top 3 Attacks per Sector shows which attack were reported most from the sectors in the last year.', sectors, mostAttacks);


    /*
     * Advisories
     * ==========
     */
    var advisoriesLabels = [];
    var advisories = [];
    for (var obj of advisoriesData) {
        advisoriesLabels.push(obj['month']);
        advisories.push(obj['advisories']);
    }

    CSD.circles('#advisories', 'Security Advisories High/High', 'Security Advisories High/High shows how many security advisories with high impact and high likelihood were published by the NCSC in the last months', advisoriesLabels, advisories);


    /*
     * Switch On Tooltips
     * ==================
     */
    $('[data-toggle="tooltip"]').tooltip();

};

var showLoadingError = function() {
    var overlayHeading = $("<h1>").html("Sorry, we were not able to load the data...");
    var overlayContainer = $("<div>").attr('id', 'overlay-container').addClass("overlay-container").append(overlayHeading);
    var overlayDiv = $("<div>").attr('id', 'overlay').addClass("overlay");

    var overlay = overlayDiv.append(overlayContainer);
    overlay.appendTo(document.body);
};


/*
 * Main Logic
 * ==========
 */
$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: "data.csv",
        dataType: "text",
        success: function (data) {
            db = load(data);
            createDashboard(db);
        },
        error: function (data) {
            var db = TAFFY();
            CSD.setDatabase(db);
            createDashboard(db);
            //showLoadingError();
        }
    });


    /*
     * Switch On Ideas-Overlay
     * =======================
     */
    $("#ideas-icon").click(function () {

        $("#ideas").show();

    });

    $("#questions-icon").click(function () {

        $("#ideas").show();

    });

    $("#ideas-close").click(function () {
        $("#ideas").hide();
    });



});
