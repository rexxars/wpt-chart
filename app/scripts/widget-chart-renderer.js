define([
    'jquery',
    'lodash',
    'highcharts',
    'api',
    'pubsub',
    'chart-options',
    'widget-settings-persister'
], function($, _, Highcharts, Api, pubsub, chartOptions, SettingsPersister) {
    'use strict';

    var crossHairId = 'crosshair-line';

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

        charts: {},

        getDomElements: function() {
            this.elements = {
                firstView:  $('.charts .first-view'),
                repeatView: $('.charts .repeat-view'),
                zoomOutButton: $('.zoom-out-button')
            };
        },

        bindEvents: function() {
            var stateChange = _.debounce(this.onStateChanged, 800);

            pubsub.subscribe(SettingsPersister.prototype.STATE_CHANGED, stateChange);
            pubsub.subscribe(SettingsPersister.prototype.STATE_READY, stateChange);

            this.elements.zoomOutButton.on('click', this.onZoomOutButtonClick);
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
            this.charts.firstView  = this.renderChart(
                this.elements.firstView.get(0),
                data.firstView
            );

            this.charts.repeatView = this.renderChart(
                this.elements.repeatView.get(0),
                data.repeatView
            );
        },

        renderChart: function(element, options) {
            options = chartOptions.merge(options);
            options.chart.renderTo = element;
            this.applyZoomSync(options);

            return new Highcharts.Chart(options, this.applyCrosshairSync);
        },

        applyZoomSync: function(options) {
            var charts        = this.charts,
                zoomOutButton = this.elements.zoomOutButton;

            options.xAxis.events = options.xAxis.events || {};
            options.xAxis.events.afterSetExtremes = function() {
                if (this.chart.options.chart.isZoomed) {
                    return;
                }

                var xMin = this.chart.xAxis[0].min,
                    xMax = this.chart.xAxis[0].max;

                for (var key in charts) {
                    if (this.chart === charts[key]) {
                        continue;
                    }

                    charts[key].options.chart.isZoomed = true;
                    charts[key].xAxis[0].setExtremes(Math.floor(xMin), Math.floor(xMax), true);
                }
            };

            options.xAxis.events.setExtremes = function(e) {
                if (e.trigger !== 'zoom') {
                    return;
                }

                var zoomIn = (e.max || e.min);
                if (zoomIn) {
                    zoomOutButton.removeClass('invisible');
                } else {
                    zoomOutButton.removeClass('invisible');
                }
            };
        },

        applyCrosshairSync: function(chart) {
            var container = $(chart.container),
                offset = container.offset(),
                x, y, axis;

            container.on('mousemove', _.bind(function(e) {
                x = e.clientX - chart.plotLeft - offset.left;
                y = e.clientY - chart.plotTop - offset.top;

                for (var chartName in this.charts) {
                    axis = this.charts[chartName].xAxis[0];

                    axis.removePlotLine(crossHairId);
                    axis.addPlotLine({
                        value: chart.xAxis[0].translate(x, true),
                        width: 1,
                        color: '#c0c0c0',
                        id: 'crosshair-line'
                    });
                }
            }, this));
        },

        onZoomOutButtonClick: function() {
            for (var key in this.charts) {
                this.charts[key].zoomOut();
            }

            this.elements.zoomOutButton.addClass('invisible');
        }
    });

    return Widget;
});