define(['lodash', 'api', 'pubsub'], function(_, Api, pubsub) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options);
    };

    _.extend(Widget.prototype, {
        ITEM_TOGGLED: 'url-toggled',
        WIDGET_LOADED: 'url-list-loaded',

        initialize: function(options) {
            _.bindAll(this);

            this.options = options;
            this.api = options.api || new Api(options.apiUrl);
            this.bindDomEvents();

            this.api.getTestUrls(
                options.days || 10,
                this.onItemsRetrieved
            );
        },

        bindDomEvents: function() {
            this.elements = {
                list: $(this.options.listSelector || '.url-list')
            };

            this.elements.list.on('click', 'input', this.onItemToggled);
        },

        onItemToggled: function(e) {
            pubsub.publish(this.ITEM_TOGGLED, {
                enabled: e.currentTarget.checked,
                id: e.currentTarget.getAttribute('data-id')
            });
        },

        onItemsRetrieved: function(items) {
            for (var i = 0; i < items.length; i++) {
                this.elements.list.append(this.buildToggler(items[i]));
            }

            pubsub.publish(this.WIDGET_LOADED, {
                element: this.elements.list
            });
        },

        buildToggler: function(url) {
            var urlId = _.uniqueId('url-');
            var input = $('<input />', {
                'attr': {
                    'id': urlId,
                    'type': 'checkbox',
                    'data-id': url
                }
            });

            return $('<li />').addClass('input-group').append(
                $('<span />').addClass('input-group-addon').append(input),
                $('<label />', {
                    'attr': { 'for': urlId, },
                    'text': url,
                    'class': 'form-control'
                })
            );
        }
    });

    return Widget;
});
