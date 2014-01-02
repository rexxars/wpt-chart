define([], function() {
    'use strict';

    return function() {
        if (this.value > 1000) {
            return (this.value / 1000) + 's';
        }

        return this.value + 'ms';
    };
});