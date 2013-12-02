define(['lodash', 'api', 'pubsub'], function(_, Api, pubsub) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, {
        initialize: function(options) {
            this.options = options;
            this.api = options.api || new Api(options.apiUrl);

            this.api.getMetrics(
                this.onMetricsRetrieved
            );
        },

        onMetricsRetrieved: function(res) {
            console.log(res);
        }
    });

    return Widget;
});
