define(['lodash'], function(_) {
    'use strict';

    var chartOptions = {
        getDefaults: function() {
            return {
                chart: {
                    type: 'spline',
                    zoomType: 'xy'
                },
                title: {
                    text: ''
                },
                tooltip: {
                    shared: true,
                    crosshairs: true
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime'
                }
            };
        },

        merge: function(options) {
            return _.merge({}, this.getDefaults(), options);
        }
    };

    return chartOptions;
});
