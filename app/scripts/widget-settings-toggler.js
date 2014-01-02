define([
    'jquery',
    'lodash',
    'pubsub',
    'widget-settings-persister'
], function($, _, pubsub, SettingsPersister) {
    'use strict';

    var Widget = function(options) {
        this.initialize(options || {});
    };

    _.extend(Widget.prototype, {
        initialize: function(options) {
            _.bindAll(this);

            this.options = options;

            this.button = $(options.buttonSelector || '.settings-button');
            this.sections = $(options.sectionSelector || 'section.settings');

            this.bindEvents();
        },

        bindEvents: function() {
            this.button.on('click', this.toggleSections);

            pubsub.subscribe(
                SettingsPersister.prototype.STATE_READY,
                this.onStateReady
            );
        },

        toggleSections: function() {
            this.sections.toggleClass('hidden');
        },

        settingsOpen: function() {
            return this.sections.filter(
                this.options.settingsSectionSelector || '.settings'
            ).is(':visible');
        },

        onStateReady: function(msg, data) {
            if ((_.isEmpty(data.state.metrics) ||
                _.isEmpty(data.state.urls)) &&
                this.settingsOpen() === false) {
                // Show the settings if we're missing details
                this.toggleSections();
            }
        }
    });

    return Widget;
});
