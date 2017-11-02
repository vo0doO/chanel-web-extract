
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');

var app = express();

// all environments
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "This is a secret" }));
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.directory(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

/*
 * GET
 */

app.get('/', routes.index);
app.get('/info', routes.info);
app.get('/logout', routes.logout);
//app.get('/gettvprograms', routes.gettvprograms);
app.get('/site/:id', routes.site);

//for new source, not old epg
app.get('/site2/:id', routes.site2);
app.get('/logs/in-com', routes.logs_in_com);
app.get('/logs/indiatimes-com', routes.indiatimes_com);
app.get('/logs/tv-burrp-com', routes.tv_burrp_com);
app.get('/bots', routes.bots);
app.get('/addchannel/:channel/:id', routes.addchannel);
app.get('/deletechannel/:channel/:id', routes.deletechannel)

/*
 * POST
 */
app.post('/register', routes.register);
app.post('/login', routes.login);//

app.post('/gettvprogramspost', routes.gettvprogramspost);
app.post('/getcanalprogram', routes.getcanalprogram);

//for new sources
app.post('/getcanalprogramNew', routes.getcanalprogramNew);
app.post('/botsettings', routes.botsettings);//

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
