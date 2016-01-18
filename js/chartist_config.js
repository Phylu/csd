/**
 * Created by janosch on 18.01.16.
 */

var configBig = {
    lineSmooth: false,
    axisY: {
        type: Chartist.AutoScaleAxis,
        low: 0,
        high: 100,
        onlyInteger: true
    },
    chartPadding: {
        right: 30,
    },

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