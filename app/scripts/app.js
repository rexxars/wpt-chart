define([
    'api',
    'widget-settings-toggler',
    'widget-url-selector',
    'widget-metrics-picker'
], function(Api, SettingsToggler, UrlSelector, MetricsPicker) {
    'use strict';

    var apiUrl = 'http://' + window.location.hostname + ':1337';

    var App = function() {
        App.api = new Api(apiUrl);
        App.settingsToggler = new SettingsToggler();
        App.urlSelector = new UrlSelector({ 'api': App.api });
        App.metricsPicker = new MetricsPicker({ 'api': App.api });
    };
/*
    var apiUrl = 'http://' + window.location.hostname + ':1337';

    $.getJSON(apiUrl + '/chart?type=median&url[]=http://www.vg.no&url[]=http://m.db.no&location=Akersgata_iPhone4&metric[]=bytesIn&metric[]=loadTime&callback=?', function(res) {
        console.log(res);

        $('#first-view-chart').highcharts(_.merge(
            {},
            defaultOptions,
            res.firstView
        ));

        $('#repeat-view-chart').highcharts(_.merge(
            {},
            defaultOptions,
            res.repeatView
        ));
    })
*/
    return App;
});
