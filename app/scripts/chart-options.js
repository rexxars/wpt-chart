define(['lodash', 'highcharts', 'formatters'], function(_, Highcharts, formatters) {
    'use strict';

    var chartOptions = {
        getDefaults: function() {
            return {
                chart: {
                    type: 'spline',
                    zoomType: 'x',
                    animation: false
                },
                title: {
                    text: ''
                },
                tooltip: {
                    shared: false,
                    crosshairs: true,
                    formatter: function() {
                        var formatterType = this.series.userOptions.formatterType,
                            formatter     = formatters[formatterType];

                        return [
                            '<strong>',
                            this.series.name,
                            '<br>',
                            Highcharts.dateFormat('%d.%m.%y %H:%M', this.x),
                            '</strong>',
                            '<br>',
                            formatter ? formatter.call({ value: this.y }) : this.y
                        ].join('');
                    }
                },
                plotOptions: {
                    spline: {
                        lineWidth: 2,
                        marker: {
                            lineWidth: 1,
                            radius: 3,
                            states: {
                                hover: {
                                    radius: 5
                                }
                            }
                        },
                        point: {
                            events: {
                                click: function() {
                                    var url = (
                                        window.location.pathname +
                                        'api/test-result/' +
                                        this.options.t
                                    );

                                    window.open(url);
                                }
                            }
                        },
                        cursor: 'pointer'
                    }
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime'
                }
            };
        },

        merge: function(options) {
            var opts = _.merge({}, this.getDefaults(), options), axis;

            for (var i = 0; i < opts.yAxis.length; i++) {
                axis = opts.yAxis[i];
                if (axis.formatterType && formatters[axis.formatterType]) {
                    opts.yAxis[i].labels = {
                        formatter: formatters[axis.formatterType]
                    };
                }
            }

            return opts;
        }
    };

    return chartOptions;
});
