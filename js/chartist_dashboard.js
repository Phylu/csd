$( document ).ready(function() {

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
    var attackTypesOriginal = ['Phishing', 'Information leakage', 'Injection attacks' ,'Malicious code',
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

    for(var attack of attackTypes) {
        attacksNumbers[attack] = [];
    }

    for (var obj of data) {
        monthLabels.push(obj['month']);
        monthOnlyLabels.push(obj['month'].substring(0,3));
        attacksTotal.push(obj['total']);

        for(var attackType of attackTypes) {
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

    $("#updated").html("Last Update: " + monthLabels.slice(-1)[0] + ".");

    $("#ideas-icon").click(function() {

        $("#ideas").show();

        $("#ideas").click(function() {
            $("#ideas").hide();
        });

    });

    $("#questions-icon").click(function() {

        $("#ideas").show();

        $("#ideas").click(function() {
            $("#ideas").hide();
        })

    });


    /*
     * Reported Incidents
     * ==================
     */

    CSD.line('#incidents', 'Reported Incidents', monthOnlyLabels, [attacksTotal, attacksTotalLastYear],
        ['2014/15', '2013/14']);



    /*
     * Incidents per Type
     * ==================
     */
    CSD.areaSeries('#incidents-type', 'Incidents per Type', monthLabels, attacksNumbers)



    /*
     * Incidents per Sector
     * ====================
     */
    CSD.bar('#sector-incidents', "Incidents by Sector", sectorLabels, sectorNumbers);



    /*
     * Top 3 attacks per sector
     * ========================
     */
    var mostAttacks= [];
    mostAttacks[0] = CSD.getTopX(sectorTypeData[0], 3);
    mostAttacks[1] = CSD.getTopX(sectorTypeData[1], 3);
    mostAttacks[2] = CSD.getTopX(sectorTypeData[2], 3);

    var sectors = ['Public', 'Private', 'International'];
    CSD.table('#sector-top-3', 'Top 3 Attacks per Sector', sectors, mostAttacks);



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

    CSD.circles('#advisories', 'Security Advisories High/High', advisoriesLabels, advisories);


    /*
     * Switch On Tooltips
     * ==================
     */
    $('[data-toggle="tooltip"]').tooltip()

});
