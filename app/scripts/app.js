define([
    'api',
    'widget-settings-toggler',
    'widget-url-toggler',
    'widget-location-toggler',
    'widget-label-toggler',
    'widget-settings-persister',
    'widget-metrics-picker',
    'widget-chart-renderer',
], function(Api, SettingsToggler, UrlToggler, LocationToggler, LabelToggler, SettingsPersister, MetricsPicker, ChartRenderer) {
    'use strict';

    var apiUrl = 'http://' + window.location.hostname + ':1337';

    var App = function() {
        App.api = new Api(apiUrl);

        App.chartRenderer = new ChartRenderer({ 'api': App.api });
        App.settingsToggler = new SettingsToggler();
        App.settingsPersister = new SettingsPersister();
        App.urlToggler = new UrlToggler({ 'api': App.api });
        App.locationToggler = new LocationToggler({ 'api': App.api, 'listSelector': '.location-list' });
        App.labelToggler = new LabelToggler({ 'api': App.api, 'listSelector': '.label-list' });
        App.metricsPicker = new MetricsPicker({ 'api': App.api });
    };

    return App;
});
