//http://stackoverflow.com/questions/6011984/basic-ajax-send-receive-with-node-js
//http://codeforgeek.com/2014/07/node-sqlite-tutorial/
//https://github.com/mapbox/node-sqlite3/wiki/API

//DISCLAIMER: this is my first node app. I would not treat this as THE WAY to write node. For that, you might try howtonode.org.
//  I threw this together in a hurry with internet searches, duck tape, and bailing wire.
//  The point of this is more to illustrate what can be done than how to do it.

var http = require('http'),
      fs = require('fs'),
     url = require('url'),
     sqlite3 = require('sqlite3').verbose()/*,
     qs = require('querystring')*/;


(function () {
    var db = new sqlite3.Database('guest.sqlite');

    db.serialize(function() {

        var error = '';

        db.run("CREATE TABLE if not exists guests (id INTEGER PRIMARY KEY, email TEXT, firstName TEXT, lastName TEXT);");
    });

    //Passing a parameter to this function assigns a close handler
    db.close();
})();


http.createServer(
/**
    @param {object} request a http.IncomingMessage 
    @param {object} response a http.ServerResponse
*/
function(request, response){
    var path = url.parse(request.url).pathname;
  
    var guestPath = /\/guest\/([a-zA-z\-0-9]*)/;

    if (request.method == 'POST' && path == '/guest') {
        console.log('receieved request to create guest');
        var body = '';
        var guest = null;
        request.on('data', function (data) {
            console.log('Buffering data');

            body += data;

            // Too much POST data, kill the connection!
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });
        request.on('end', function () {

            console.log('Parsing data');

            guest = JSON.parse(body);

            if (guest) {

                var db = new sqlite3.Database('guest.sqlite');

                db.serialize(function() {
                    var stmt = db.prepare("INSERT INTO guests (email, firstName, lastName) VALUES (?,?,?);");
                    stmt.run(guest.email, guest.firstName, guest.lastName);
                    stmt.finalize();

                    //TODO: How do we check for errors here? try/catch?
                    console.log('Inserted row');
	

                    //This is blocking. To make it non-blocking, stick it outside request.on
                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.end();
                });

                //Passing a parameter to this function assigns a close handler
                db.close();
            }
        });
    }
    else if (path == '/guests') {
        console.log('Received request for guests')
        var guests = [];

        var db = new sqlite3.Database('guest.sqlite');

        db.serialize(function() {

            var error = '';

            // Maybe should have used db.all here?
            db.each("SELECT id, firstName, lastName, email FROM guests;", 
                function (err, row) {
                    //Row callback
                    if (err) {
                        console.log(err);
                        error = "Error occurred";
                    }
                    else {
                        console.log(row.email);
                        guests.push({id: row.id, email: row.email, firstName: row.firstName, lastName: row.lastName, fullName: row.firstName + ' ' + row.lastName});
                    }
                },
                function () {
                    //Completion callback
                    if (error) {
                        response.writeHead(500, { 'Content-Type': 'text/plain' });
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(guests), 'utf-8');
                    }
                });
        });

        //Passing a parameter to this function assigns a close handler
        db.close();
    }
    else if (request.method == 'DELETE' && guestPath.test(path)) {

        var id = guestPath.exec(path)[1];

        var db = new sqlite3.Database('guest.sqlite');

        db.serialize(function() {      
            var stmt = db.prepare("DELETE FROM guests WHERE email = ?;");
            stmt.run(id);

            //TODO: How do we check for errors here? try/catch?

            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end();
        });
    }
    else {
        response.writeHead(500, { 'Content-Type': 'text/plain' });  
        response.end("Unrecognized Path", "utf-8");  
    }
}).listen(8001);


console.log("server initialized");
