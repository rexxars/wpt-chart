define(['jquery', 'lodash'], function($, _) {
    'use strict';

    var Api = function(host) {
        this.host = host;
    };

    _.extend(Api.prototype, {
        getTestUrls: function(minTests, callback) {
            $.getJSON(this.host + '/urls?callback=?', {
                'minTests': minTests
            }, callback);
        },

        getLocations: function(callback) {
            $.getJSON(this.host + '/locations?callback=?', callback);
        },

        getChartData: function(options, callback) {
            $.getJSON(this.host + '/chart?callback=?', options, callback);
        },

        getMetrics: function(callback) {
            $.getJSON(this.host + '/metrics?callback=?', callback);
        },

        getLabels: function(callback) {
            $.getJSON(this.host + '/labels?callback=?', callback);
        }
    });

    return Api;
});
