var $ = jQuery = global.jQuery = require('jquery');
$.csv = require('jquery-csv');
var TAFFY = require('taffydb').taffy;
console.log(TAFFY);
var CSD = require('./csd.js');
var bootstrap = require('bootstrap');

var loadIncidents = function(csv) {

    // Create Database
    var data = $.csv.toObjects(csv);
    var db = TAFFY(JSON.stringify(data));

    // Give Database to CSD
    CSD.setIncidentsDatabase(db);

    // Data cleaning for attack type
    var typeMap = {
        overige: 'Other',
        anders: 'Other',
        'niet van toepassing': 'Other',
        'malicious code: worms/trojans': 'malicious code',
    };
    CSD.group('CustomField.{Hulpmiddel}', 'type', typeMap);
    CSD.setTypeColumn('type');

    // Data cleaning for sectors
    var sectorMap = {
        publiek: 'Public',
        rijksoverheid: 'Public',
        privaat: 'Private',
        telecom: 'Private',
        secundaire: 'Private',
        'secundaire doelgroep': 'Private',
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

};

var loadAdvisories = function(csv) {

    // Create Database
    var data = $.csv.toObjects(csv, {separator: ';'});
    var db = TAFFY(JSON.stringify(data));

    // Give Database to CSD
    CSD.setAdvisoriesDatabase(db);

    CSD.setImpactColumn('impact');
    CSD.setLikelihoodColumn('likelihood');

};


var createDashboard = function() {
    /*
     * Create Header
     * =============
     */
    CSD.setLastUpdated("#updated");


    /*
     * Labels for Attack Types & Sectors
     * =================================
     */
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
        new CSD.DataQuery().incidents().monthly(12, 2),
        CSD.getLegend(2));


    /*
     * Incidents per Type
     * ==================
     */
    var attackNumbers = {};
    for (var type of types) {
        attackNumbers[type] = new CSD.DataQuery().incidents({type: type}).monthly(12)[0];
    }
    CSD.areaSeries('#incidents-type', 'Incidents per Type', 'Incidents per Type shows the number of incidents reported to the NCSC where a specific attack type was used.',
        CSD.getLabels(true),
        attackNumbers);

    /*
     * Incidents per Sector
     * ====================
     */
    var attackNumbersSector = [];
    for (var sector of sectors) {
        attackNumbersSector.push(new CSD.DataQuery().incidents({sector: sector}).yearly());
    }
    CSD.bar('#sector-incidents', 'Incidents by Sector', 'Incidents by Sector shows how many attacks were reported in each sector in the last year.',
        sectors,
        attackNumbersSector);

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
            attackNumbersThisSector[type] = new CSD.DataQuery().incidents({type: type, sector: sector}).yearly();
        }
        // Store the top 3 for this sector
        attackNumbersSectorType.push(CSD.getTopX(attackNumbersThisSector, 3));
    }

    CSD.table('#sector-top-3', 'Top 3 Attacks per Sector', 'Top 3 Attacks per Sector shows which attack were reported most from the sectors in the last year.',
        sectors,
        attackNumbersSectorType);

    /*
     * Advisories
     * ==========
     */
    CSD.circles('#advisories', 'Critical Security Advisories', 'Critical Security Advisories shows how many security advisories with high impact and high likelihood were published by the NCSC in the last months',
        CSD.getLabels(true),
        new CSD.DataQuery().advisories({impact: 'H', likelihood: 'H'}).monthly(12)[0]);

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

    $.when(
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:8080/incidents.csv",
            dataType: "text",
            success: function (data) {
                loadIncidents(data);
            },
            error: function (data) {
                showLoadingError();
            }
        }),
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:8080/advisories.csv",
            dataType: "text",
            success: function (data) {
                loadAdvisories(data);
            },
            error: function (data) {
                showLoadingError();
            }
        })
    ).then(function() {
        createDashboard();
        $("#spinner").remove();
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
