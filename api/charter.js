'use strict';
var _             = require('lodash'),
    metricsMap    = require('./metrics-map'),
    getMetricInfo = function(metric) { return metricsMap[metric] || {}; };

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

    // Helper method for sorting by dates
    var dateSort = function(item) { return item.x || item[0]; };

    // Define yAxis titles
    for (var i = 0, axisInfo; i < metrics.length; i++) {
        axisInfo = {
            title: { text: getMetricInfo(metrics[i]).name || metrics[i] },
            formatterType: getMetricInfo(metrics[i]).formatter,
            //min: 0,
            opposite: i % 2 === 0,
            startOnTick: false
        };

        charts.firstView.yAxis.push(axisInfo);
        charts.repeatView.yAxis.push(axisInfo);
    }

    // Define series data
    var key, url, testData, view, metric, m, completed, series, seriesData;
    for (key in data) {
        url = key.replace(/^https?:\/\//, '');
        series = { firstView: {}, repeatView: {} };

        // Define empty series for all metrics
        for (m = 0; m < metrics.length; m++) {
            seriesData = {
                name: getMetricInfo(metrics[m]).name + ' (' + url + ')',
                yAxis: m,
                formatterType: getMetricInfo(metrics[m]).formatter
            };

            series.firstView[metrics[m]] = _.merge({ data: [] }, seriesData);
            series.repeatView[metrics[m]] = _.merge({ data: [] }, seriesData);
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
                    series[view][metric].data.push({
                        x: completed,
                        y: testData[view][metric],
                        t: data[key][i].testId
                    });

                    series[view][metric].data = _.sortBy(
                        series[view][metric].data,
                        dateSort
                    );
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
