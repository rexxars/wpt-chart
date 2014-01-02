'use strict';

var f = {
    yAxis: [{
        title: {
            text: 'Temperature'
        }
    }, {
        title: {
            text: 'Rainfall'
        }
    }],
    series: [{
        name: 'Winter 2007-2008',
        data: [
            ['millisecondtimestamp', 0   ],
            ['millisecondtimestamp', 0.6 ],
        ]
    }, {
        name: 'Winter 2008-2009',
        data: []
    }],








    /*
    tooltip: {
        formatter: function() {
            return '<b>'+ this.series.name +'</b><br/>'+ Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y;
        }
    },
    */
    chart: {
        type: 'spline',
        zoomType: 'xy'
    },
    title: {
        text: ''
    },
    credits: {
        enabled: false
    },
    xAxis: {
        type: 'datetime'
    },
};

console.log(f);