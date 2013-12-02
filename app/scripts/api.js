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

        getChartData: function(options, callback) {
            var query = {};
            $.getJSON(this.host + '/urls?callback=?', query, callback);
        },

        getMetrics: function(callback) {
            $.getJSON(this.host + '/metrics?callback=?', callback);
        }
    });

    return Api;
});
