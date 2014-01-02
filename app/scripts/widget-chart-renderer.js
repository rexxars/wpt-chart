define([
    'lodash',
    'highcharts',
    'api',
    'pubsub',
    'chart-options',
    'widget-settings-persister'
], function(_, highcharts, Api, pubsub, chartOptions, SettingsPersister) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, {

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.api = options.api || new Api(options.apiUrl);
            this.getDomElements();
            this.bindEvents();
        },

        getDomElements: function() {
            this.elements = {
                firstView:  $('.charts .first-view'),
                repeatView: $('.charts .repeat-view'),
            };
        },

        bindEvents: function() {
            var stateChange = _.debounce(this.onStateChanged, 800);

            pubsub.subscribe(SettingsPersister.prototype.STATE_CHANGED, stateChange);
            pubsub.subscribe(SettingsPersister.prototype.STATE_READY, stateChange);
        },

        onStateChanged: function(msg, data) {
            this.api.getChartData({
                metric: _.keys(data.state.metrics || {}),
                url: _.keys(data.state.urls || {}),
                label: _.keys(data.state.labels || {}),
                location: data.state.location
            }, this.onChartDataReceived);
        },

        onChartDataReceived: function(data) {
            this.renderChart(this.elements.firstView, data.firstView);
            this.renderChart(this.elements.repeatView, data.repeatView);
        },

        renderChart: function(element, options) {
            element.highcharts(
                chartOptions.merge(options)
            );
        }
    });

    return Widget;
});