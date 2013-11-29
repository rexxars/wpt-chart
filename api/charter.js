'use strict';
var metricsMap = require('./metrics-map');

module.exports = function(data, type, metrics) {
    var charts = {
        firstView: {
            series: [],
            yAxis: []
        },
        repeatView: {
            series: [],
            yAxis: []
        }
    };

    // Define yAxis titles
    for (var i = 0; i < metrics.length; i++) {
        charts.firstView.yAxis.push({ title: { text: metricsMap[metrics[i]] || metrics[i] } });
        charts.repeatView.yAxis.push({ title: { text: metricsMap[metrics[i]] || metrics[i] } });
    }

    // Define series data
    var key, url, testData, view, metric, m, completed, series;
    for (key in data) {
        url = key.replace(/^https?:\/\//, '');
        series = { firstView: {}, repeatView: {} };

        // Define empty series for all metrics
        for (m = 0; m < metrics.length; m++) {
            series.firstView[metrics[m]] = { name: url, data: [] };
            series.repeatView[metrics[m]] = { name: url, data: [] };
        }

        // Loop over tests with this URL
        for (i = 0; i < data[key].length; i++) {
            // median, average...
            testData  = data[key][i][type];
            completed = Date.parse(data[key][i].completed);

            // firstView, repeatView...
            for (view in testData) {
                // loadTime, bytesOut...
                for (metric in testData[view]) {
                    series[view][metric].data.push([
                        completed,
                        testData[view][metric]
                    ]);
                }
            }
        }

        // Assign series to chart data
        for (metric in series.firstView) {
            charts.firstView.series.push(series.firstView[metric]);
        }

        for (metric in series.repeatView) {
            charts.repeatView.series.push(series.repeatView[metric]);
        }
    }

    return charts;
};