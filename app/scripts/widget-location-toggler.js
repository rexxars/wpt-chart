define(['lodash', 'api', 'pubsub', 'widget-url-toggler'], function(_, Api, pubsub, UrlToggler) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, UrlToggler.prototype, {
        ITEM_TOGGLED: 'location-toggled',
        WIDGET_LOADED: 'location-list-loaded',

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.api = options.api || new Api(options.apiUrl);
            this.bindDomEvents();

            this.api.getLocations(
                this.onItemsRetrieved
            );
        },

        buildToggler: function(location) {
            var locationId = _.uniqueId('location-');
            var input = $('<input />', {
                'attr': {
                    'id': locationId,
                    'name': 'test-location',
                    'type': 'radio',
                    'data-id': location
                }
            });

            return $('<li />').addClass('input-group').append(
                $('<span />').addClass('input-group-addon').append(input),
                $('<label />', {
                    'attr': { 'for': locationId, },
                    'text': location,
                    'class': 'form-control'
                })
            );
        }
    });

    return Widget;
});
