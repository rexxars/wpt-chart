define(['lodash', 'api', 'pubsub'], function(_, Api, pubsub) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, {
        METRIC_TOGGLED: 'metric-toggled',
        WIDGET_LOADED: 'metrics-picker-loaded',

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.api = options.api || new Api(options.apiUrl);
            this.bindDomEvents();

            this.api.getMetrics(
                this.onMetricsRetrieved
            );
        },

        bindDomEvents: function() {
            this.elements = {
                togglers: $(this.options.togglersSelector || '.togglers')
            };

            this.elements.togglers.on('click', 'input', this.onMetricToggle);
        },

        onMetricToggle: function(e) {
            pubsub.publish(this.METRIC_TOGGLED, {
                enabled: e.currentTarget.checked,
                metric: e.currentTarget.getAttribute('data-metric')
            });
        },

        onMetricsRetrieved: function(metrics) {
            var key, row, i = 0;
            for (key in metrics) {
                if (i++ % 2 === 0) {
                    row = $('<tr />').appendTo(this.elements.togglers);
                }

                row.append(this.buildToggler(key, metrics[key]));
            }

            pubsub.publish(this.WIDGET_LOADED, {
                element: this.elements.togglers
            });
        },

        buildToggler: function(metric, info) {
            var input = $('<input />', {
                'attr': {
                    'id': 'metric-' + metric,
                    'type': 'checkbox',
                    'data-metric': metric
                }
            });

            return $('<td />').addClass('input-group').append(
                $('<span />').addClass('input-group-addon').append(input),
                $('<label />', {
                    'attr': { 'for': 'metric-' + metric, },
                    'text': info.name,
                    'class': 'form-control'
                })
            );
        }
    });

    return Widget;
});
