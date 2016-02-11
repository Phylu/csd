var load = function(csv) {

    var data = $.csv.toObjects(csv);
    var db = TAFFY(JSON.stringify(data));
    CSD.setDatabase(db);

    var typeMap = {
        Overige: 'Other',
        Anders: 'Other',
        'Niet van toepassing': 'Other'
    };
    CSD.group('CustomField.{Hulpmiddel}', 'type', typeMap);
    CSD.setTypeColumn('type');

    var sectorMap = {
        publiek: 'Public',
        rijksoverheid: 'Public',
        privaat: 'Private',
        telecom: 'Private',
        secundaire: 'Private',
        zorg: 'Private',
        financieel: 'Private',
        water: 'Private',
        haven: 'Private',
        onbekend: 'Private',
        luchthaven: 'Private',
        energie: 'Private',
        spoor: 'Private',
        verzeker: 'Private',
        msp: 'Private',
        multinationals: 'Private',
        internationaal: 'International',
        partners: 'International',
    };
    CSD.group('CustomField.{Sector}', 'sector', sectorMap);
    CSD.setSectorColumn('sector');

    //console.log(db().get());

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

    //var db = new CSD.Query();
    //console.log(db.sector('Private').after(15, 1, 2016).count());
    //var query = new CSD.DataQuery();
    //console.log(query.attacks({sector: 'Public'}).monthly(12, 2));
    //console.log(db.perType("phishing"));
    //console.log(CSD.db.after(15, 1, 2016).perType('phishing'));

    /* Prepare Data */

    var csv = getAdvisoriesData();
    var advisoriesData = $.csv.toObjects(csv);


    var types = ['Phishing', 'Information leakage', 'Injection attacks', 'Malicious code',
        'Ransomware/Cryptoware', 'Denial of service', 'Botnets', 'Cyber espionage',
        'Data breaches', 'Hacking/Cracking', 'Spam', 'Illegal content', 'Other'];

    var sectors = ['Public', 'Private', 'International'];


    /*
     * Reported Incidents
     * ==================
     */
    CSD.line('#incidents', 'Reported Incidents', 'Reported Incidents shows how many incidents were reported to the NCSC in total for the last months.',
        CSD.getLabels(),
        new CSD.DataQuery().monthly(12, 2),
        CSD.getLegend(2));
    //CSD.line('#incidents', 'Reported Incidents', 'Reported Incidents shows how many incidents were reported to the NCSC in total for the last months.', monthOnlyLabels, [attacksTotal, attacksTotalLastYear],
    //    ['2014/15', '2013/14']);


    /*
     * Incidents per Type
     * ==================
     */
    var attackNumbers = {};
    for (var type of types) {
        attackNumbers[type] = new CSD.DataQuery().attacks({type: type}).monthly(12)[0];
    }
    CSD.areaSeries('#incidents-type', 'Incidents per Type', 'Incidents per Type shows the number of incidents reported to the NCSC where a specific attack type was used.',
        CSD.getLabels(true),
        attackNumbers);
    //CSD.areaSeries('#incidents-type', 'Incidents per Type', 'Incidents per Type shows the number of incidents reported to the NCSC where a specific attack type was used.', monthLabels, attacksNumbers)


    /*
     * Incidents per Sector
     * ====================
     */
    var attackNumbersSector = [];
    for (var sector of sectors) {
        attackNumbersSector.push(new CSD.DataQuery().attacks({sector: sector}).yearly());
    }
    CSD.bar('#sector-incidents', 'Incidents by Sector', 'Incidents by Sector shows how many attacks were reported in each sector in the last year.',
        sectors,
        attackNumbersSector);
    //CSD.bar('#sector-incidents', 'Incidents by Sector', 'Incidents by Sector shows how many attacks were reported in each sector in the last year.', sectorLabels, sectorNumbers);


    /*
     * Top 3 attacks per sector
     * ========================
     */
    var attackNumbersSectorType = [];

    // Iterate over Sectors
    for (sector of sectors) {
        var attackNumbersThisSector = {};
        // Get attack type + number of attacks in this sector
        for (var type of types) {
            attackNumbersThisSector[type] = new CSD.DataQuery().attacks({type: type, sector: sector}).yearly();
        }
        // Store the top 3 for this sector
        attackNumbersSectorType.push(CSD.getTopX(attackNumbersThisSector, 3));
    }

    CSD.table('#sector-top-3', 'Top 3 Attacks per Sector', 'Top 3 Attacks per Sector shows which attack were reported most from the sectors in the last year.',
        sectors,
        attackNumbersSectorType);
    //CSD.table('#sector-top-3', 'Top 3 Attacks per Sector', 'Top 3 Attacks per Sector shows which attack were reported most from the sectors in the last year.',sectors, mostAttacks);


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

    CSD.circles('#advisories', 'Critical Security Advisories', 'Critical Security Advisories shows how many security advisories with high impact and high likelihood were published by the NCSC in the last months', advisoriesLabels, advisories);


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
