define(['lodash', 'api', 'pubsub', 'widget-url-toggler'], function(_, Api, pubsub, UrlToggler) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, UrlToggler.prototype, {
        ITEM_TOGGLED: 'label-toggled',
        WIDGET_LOADED: 'label-list-loaded',

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.api = options.api || new Api(options.apiUrl);
            this.bindDomEvents();

            this.api.getLabels(
                this.onItemsRetrieved
            );
        },

        buildToggler: function(label) {
            var labelId = _.uniqueId('label-');
            var input = $('<input />', {
                'attr': {
                    'id': labelId,
                    'name': 'test-label',
                    'type': 'checkbox',
                    'data-id': label
                }
            });

            return $('<li />').addClass('input-group').append(
                $('<span />').addClass('input-group-addon').append(input),
                $('<label />', {
                    'attr': { 'for': labelId, },
                    'text': label,
                    'class': 'form-control'
                })
            );
        }
    });

    return Widget;
});
