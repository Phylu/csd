/**
 * Created by janosch on 18.01.16.
 */

var configBig = {
    lineSmooth: false,
    axisY: {
        type: Chartist.AutoScaleAxis,
        low: 0,
        onlyInteger: true
    },
    chartPadding: {
        right: 30,
    },
    plugins: [
        Chartist.plugins.legend({
            legendNames: ['2014/15', '2013/14'],
            clickable: false,
        })
    ]
};

var configBarBig = {
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
};

var configMini = {
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
    }
};

var configMiniLast = {
    lineSmooth: false,
    axisY: {
        type: Chartist.AutoScaleAxis,
        low: 0,
        high: 30,
        onlyInteger: true
    },
};

var configBigOverlay = {
    lineSmooth: false,
    axisY: {
        type: Chartist.AutoScaleAxis,
        low: 0,
        onlyInteger: true
    },
    chartPadding: {
        right: 30,
    },
    plugins: [
        Chartist.plugins.legend({
            legendNames: ['2014/15', '2013/14'],
            clickable: false,
        })
    ]
};

var configOverlay = {
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
    distributeSeries: true,
    horizontalBars: true,
};