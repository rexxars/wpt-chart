define([
    'lodash',
    'pubsub',
    'widget-metrics-picker',
    'widget-url-toggler',
    'widget-location-toggler',
    'widget-label-toggler'
], function(_, pubsub, MetricsPicker, UrlToggler, LocationToggler, LabelToggler) {
    'use strict';

    var defaultState = '{"metrics":{},"urls":{},"labels":{}}';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, {
        STATE_READY: 'settings-state-ready',
        STATE_CHANGED: 'settings-state-changed',

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.getState();
            this.bindEvents();

            pubsub.publish(this.STATE_READY, { state: this.state });
        },

        bindEvents: function() {
            // Metrics picker
            pubsub.subscribe(MetricsPicker.prototype.WIDGET_LOADED, this.onMetricsPickerReady);
            pubsub.subscribe(MetricsPicker.prototype.METRIC_TOGGLED, this.onMetricToggled);

            // URL toggler
            pubsub.subscribe(UrlToggler.prototype.WIDGET_LOADED, this.onUrlTogglerReady);
            pubsub.subscribe(UrlToggler.prototype.ITEM_TOGGLED, this.onUrlToggled);

            // Location toggler
            pubsub.subscribe(LocationToggler.prototype.WIDGET_LOADED, this.onLocationTogglerReady);
            pubsub.subscribe(LocationToggler.prototype.ITEM_TOGGLED, this.onLocationToggled);

            // Label toggler
            pubsub.subscribe(LabelToggler.prototype.WIDGET_LOADED, this.onLabelTogglerReady);
            pubsub.subscribe(LabelToggler.prototype.ITEM_TOGGLED, this.onLabelToggled);
        },

        getState: function() {
            if (!this.state) {
                this.state = JSON.parse(localStorage.metrics || defaultState);
            }

            return this.state;
        },

        saveState: function(state) {
            localStorage.metrics = JSON.stringify(state);

            pubsub.publish(this.STATE_CHANGED, { state: state });
        },

        /**
         * Metrics picker
         */
        onMetricsPickerReady: function(msg, data) {
            // Populate the metrics picker with the current state
            var state = this.state;
            data.element.find('input').each(function() {
                this.checked = !!state.metrics[this.getAttribute('data-metric')];
            });
        },

        onMetricToggled: function(msg, data) {
            if (data.enabled) {
                this.state.metrics[data.metric] = 1;
            } else {
                delete this.state.metrics[data.metric];
            }

            this.saveState(this.state);
        },

        /**
         * URL toggler
         */
        onUrlTogglerReady: function(msg, data) {
            // Populate the metrics picker with the current state
            var state = this.state.urls || {};
            data.element.find('input').each(function() {
                this.checked = !!state[this.getAttribute('data-id')];
            });
        },

        onUrlToggled: function(msg, data) {
            if (!this.state.urls) {
                this.state.urls = {};
            }

            if (data.enabled) {
                this.state.urls[data.id] = 1;
            } else {
                delete this.state.urls[data.id];
            }

            this.saveState(this.state);
        },

        /**
         * Label toggler
         */
        onLabelTogglerReady: function(msg, data) {
            // Populate the metrics picker with the current state
            var state = this.state.labels || {};
            data.element.find('input').each(function() {
                this.checked = !!state[this.getAttribute('data-id')];
            });
        },

        onLabelToggled: function(msg, data) {
            if (!this.state.labels) {
                this.state.labels = {};
            }

            if (data.enabled) {
                this.state.labels[data.id] = 1;
            } else {
                delete this.state.labels[data.id];
            }

            this.saveState(this.state);
        },

        /**
         * Location toggler
         */
        onLocationTogglerReady: function(msg, data) {
            // Populate the metrics picker with the current state
            var location = this.state.location;
            data.element.find('input').each(function() {
                this.checked = this.getAttribute('data-id') === location;
            });
        },

        onLocationToggled: function(msg, data) {
            if (data.enabled) {
                this.state.location = data.id;
            } else {
                delete this.state.location;
            }

            this.saveState(this.state);
        }
    });

    return Widget;
});
