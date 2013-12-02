define(['jquery', 'chart-options'], function($, chartOptions) {
    'use strict';

    function renderChart(selector, options) {
        $(selector).highcharts(
            chartOptions.merge(options)
        );
    }

    return renderChart;
});
