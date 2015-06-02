//Server js
//forever start -a --spinSleepTime=60000 --minUptime=1000 -l forever.log -o out.log -e err.log index.js
//forever start -a -e err.log index.js
var express = require('express'),
	app = express(),
	server = require('http').Server(app), 
	io = require('socket.io')(server),
	fs = require('fs'), 
	mysql = require('mysql'),
	path = require('path'),
	os = require('os'),
	moment = require('moment'),
	cluster = require('cluster'),
	events = require('events'),
	https = require('https'),
	util = require('util');
	server.listen(3000);

"use strict";    

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
server.on('error', function (e) {
	if (e.code === 'EADDRINUSE') {
		console.log('Failed to bind to port - address already in use ');
		process.exit(1);
	}  
});

app.use(express.static(__dirname+'/public'));
app.set('title', 'Eztidy');
var eventEmitter = new events.EventEmitter();

var appD = require('./public/appDB.js');
	appDB = appD(mysql),
	POOL = appDB.init(),
	Main = require('./public/MAIN.js'),
	MainJs = Main(POOL,moment),
	SOCKETS_ID = MainJs.localVar.SOCKETS_ID, //online user object
	SOCKETS_ID_ONLINE = MainJs.localVar.SOCKETS_ID_ONLINE, //online user object

app.get('/', function(req, res) {
	//res.sendFile(__dirname + '/index.html');
	res.send("<html><body><h1 id='me' style=' text-align: center;color: mediumvioletred;'>Welcome to Eztidy  chat.</h1>" +
			"<script>(function() {"+
						    "var s = document.getElementById('me').style,"+
						      "  f = false,"+
						     "   c1 = 'mediumvioletred',"+
						     "   c2 = 'green';"+
						    "setInterval(function() {"+
						       " s.color = f ? c2 : c1;"+
						       " f = !f;"+
						   " }, 800);"+
						"})();"+
	"</script>"+
			"</body></html>");
});

/*eventEmitter.on('someOccurence', function(message){
	console.log(" >> "+ message);
});

server.once('connection', function (stream) {
	console.log('Ah, we have our first user!');
	eventEmitter.emit('someOccurence', 'Something happened!');  
});
*/
/*********************************************************************************************

 																socket api

 ************************************************************************************************/
 
io.on('connection', function(socket) {
	socket.on("error", function(err) {
		console.log("Caught flash policy server socket error: ")
		console.log(err.stack)
	});
	socket.on('test', function(jauthData, callBack) {
		console.log("test----------------------------------");
		callBack({"success": 0,"msg": "Login Error"});
	});
	socket.on('loginUser', function(jauthData, callBack) {
		var authData = JSON.parse(jauthData);
		var this_id = authData.userId;

		if (SOCKETS_ID.hasOwnProperty(this_id) === false) {
			MainJs.login(authData, socket,moment, function(rows, status) {
				if (status === true) {
					var row = rows[0],
					this_id = row['UserId'],
					firstName = row['UserName'];
					new MainJs.sendPandingMessages(io, socket, this_id, fs);
					SOCKETS_ID[this_id] = {'socket_ids': socket.id,'user_id': this_id,'name': firstName};
					SOCKETS_ID_ONLINE[socket.id] = {'socket_ids': socket.id,'user_id': this_id,'name': firstName};
					console.log(JSON.stringify(SOCKETS_ID) + '\n\n <==SOCKETS_ID Length:====== ' + Object.keys(SOCKETS_ID).length + "\n\n");
					callBack({"success": 1,"msg": "Login Successfully","UserId": row['UserId'],"UserName": firstName,});
				} else {
					console.log("Invalid user");
					callBack({"success": 0,"msg": "Login Error"});
				}
			});
		}else{
			var firstName = SOCKETS_ID_ONLINE[SOCKETS_ID[this_id].name]
			delete SOCKETS_ID_ONLINE[SOCKETS_ID[this_id].socket_ids];
			SOCKETS_ID_ONLINE[socket.id] = {'socket_ids': socket.id,'user_id': this_id,'name': firstName,};
			SOCKETS_ID[this_id].socket_ids = socket.id;
			console.log(JSON.stringify(SOCKETS_ID) + '\n\n <==SOCKETS_ID Length:====== ' + Object.keys(SOCKETS_ID).length + "\n\n");
			callBack({"success": 1,"msg": "Login Successfully","UserId": authData.userId,"UserName": firstName});
		}
	}); //loginUser
	
	socket.on('privateMessage', function(data, callBack) {
		//chatJobId
		var jdata = JSON.parse(data);
		MainJs.onPrivateMessages(io, socket, fs, jdata, function(cb) {
			callBack({'success': cb}); //0 for error , 1 for send and received, 2 for pending 
		});
	}); //privateMessage


	socket.on('disconnect', function() {
		MainJs.disconnectUser(io, socket,moment);
	}); //disconnect

	socket.on('chatHistory', function(jdata,callback) {
		var data = JSON.parse(jdata);
		console.log(data);
		MainJs.chatHistory(data,function(cHisrty){
			callback(cHisrty);
		});

	}); //disconnect

	socket.on('writingStatus', function(Jdata) { // msg writing status
		var data = JSON.parse(Jdata);
		console.log("writingStatus ==> " + data.userId); 
		if (SOCKETS_ID.hasOwnProperty(data.userId) === true) 
			io.to(SOCKETS_ID[data.userId].socket_ids).emit('typingStatus', data);
	}); //writingOn

	socket.on('myChatUserInfo', function(Jdata,callBack) { // myChatUserInfo 
		var data = JSON.parse(Jdata);
		console.log("writingStatus ==> " + data.userId); 
		MainJs.myChatUserInfo(data.userId,moment,function(d){
			callBack(d);
		});
	}); //writingOn
	return socket;
});
	
var getCurrentTime = function(format){
	var a = moment();
	var b = moment.utc();
	a.format();  // 2013-02-04T10:35:24-08:00
	b.format();  // 2013-02-04T18:35:24+00:00
	console.log(a.format());
	if(format === 12) return a.format();//TIMEFORMATE_YMD+' '+MYTIME;
}
