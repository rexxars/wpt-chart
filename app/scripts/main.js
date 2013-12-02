require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        highcharts: '../bower_components/highcharts/highcharts',
        lodash: '../bower_components/lodash/dist/lodash.min',
        pubsub: '../bower_components/pubsub-js/src/pubsub'
    },
    shim: {
        highcharts: {
            exports: 'Highcharts'
        }
    }
});

require(['app'], function (app) {
    'use strict';

    app();
});
