define([], function() {
    'use strict';

    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var byteFormatter = function() {
        var num       = Math.max(this.value, 0),
            pow       = Math.floor((num ? Math.log(num) : 0) / Math.log(1024)),
            precision = 2;

        pow  = Math.min(pow, units.length - 1);
        num /= Math.pow(1024, pow);

        // Don't do partial bytes
        if (pow === 0) {
            return num + units[pow];
        }

        return num.toFixed(precision) + units[pow];
    };

    return byteFormatter;
});