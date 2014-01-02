define([
    'formatters/bytes',
    'formatters/number',
    'formatters/ms'
], function(bytes, number, ms) {
    'use strict';

    return {
        ms: ms,
        number: number,
        bytes: bytes
    };
});