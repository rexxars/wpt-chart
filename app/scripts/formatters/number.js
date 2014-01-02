define([], function() {
    'use strict';

    var units = ['', 'K', 'M'];

    var numberFormatter = function() {
        var num       = Math.max(this.value, 0),
            pow       = Math.floor((num ? Math.log(num) : 0) / Math.log(1000)),
            precision = 2;

        pow  = Math.min(pow, units.length - 1);
        num /= Math.pow(1000, pow);

        // Don't reformat number if we have the same number
        if (num === this.value) {
            return this.value;
        } else if (num % 1 === 0) {
            return num + units[pow];
        }

        return num.toFixed(precision) + units[pow];
    };

    return numberFormatter;

});