'use strict';

var config  = require('./config'),
    express = require('express'),
    http    = require('http'),
    path    = require('path'),
    sass    = require('node-sass'),
    app     = express();

// all environments
app.set('port', config.frontendPort || 7000);
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(sass.middleware({
    src: __dirname + '/app',
    dest: __dirname + '/app',
    debug: true
}));
app.use(express.static(path.join(__dirname, 'app')));

// development only
if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});