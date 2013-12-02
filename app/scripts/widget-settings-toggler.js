define(['jquery', 'lodash'], function($, _) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options || {});
    };

    _.extend(Widget.prototype, {
        initialize: function(options) {
            _.bindAll(this);

            this.button = $(options.buttonSelector || '.settings-button');
            this.sections = $(options.sectionSelector || 'section.settings');

            this.bindEvents();
        },

        bindEvents: function() {
            this.button.on('click', this.toggleSections);
        },

        toggleSections: function() {
            this.sections.toggleClass('hidden');
        }
    });

    return Widget;
});
