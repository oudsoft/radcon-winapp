/* websocket.js */

function RadconWebSocketServer (arg, log) {
	const $this = this;
	this.httpsServer = arg;
	const WebSocketServer = require('ws').Server;
	const wss = new WebSocketServer({server: this.httpsServer/*, path: '/' + roomname */});
	this.socket = wss;

	wss.on('connection', async function (ws, req) {
		log.info(ws._socket.remoteAddress);
		log.info(ws._socket._peername);
		log.info(req.connection.remoteAddress);
		log.info(`WS Conn Url : ${req.url} Connected.`);
		let fullReqPaths = req.url.split('?');
		let wssPath = fullReqPaths[0];
		log.info(wssPath);
		//wssPath = wssPath.substring(1);
		wssPath = wssPath.split('/');
		log.info(wssPath);
		ws.id = wssPath[2];
		ws.send(JSON.stringify({type: 'test', message: ws.id + ', You have Connected local websocket success.'}));

		ws.on('message', function (message) {
			var data;

			//accepting only JSON messages
			try {
				data = JSON.parse(message);
			} catch (e) {
				log.info("Invalid JSON");
				data = {};
			}

			log.info(data);

			if (data.type) {
				switch (data.type) { 
					case "trigger": 
						let command = 'curl -X POST --user demo:demo http://localhost:8042/tools/execute-script -d "doLocalStore(\'' + data.dcmname + '\')"';
						$this.runCommand(command).then((result) => {
							ws.send(JSON.stringify({type: 'result', message: result}));
						});
          break;
				}
			} else {
				ws.send(JSON.stringify({type: 'error', message: 'You command invalid type.'}));
			}
		});

		ws.isAlive = true;

		ws.on('pong', () => {
			log.info('On Pong');
			ws.isAlive = true;
		});

		ws.on('close', function(ws, req) {
			log.info(`WS Conn Url : ${req.url} Close.`);
		});

	});

	setInterval(() => {
		wss.clients.forEach((ws) => {
			if (!ws.isAlive) return ws.terminate();
			ws.isAlive = false;
			log.info('Start Ping');
			ws.ping(null, false, true);
		});
	}, 85000);

	this.runCommand = function (command) {
		return new Promise(function(resolve, reject) {
			const exec = require('child_process').exec;
			exec(command, (error, stdout, stderr) => {
				if(error === null) {
					resolve(`${stdout}`);
				} else {
					reject(`${stderr}`);
				}
	    });
		});
	}

}

module.exports = ( arg, monitor ) => {
	const webSocketServer = new RadconWebSocketServer(arg, monitor);
	return webSocketServer;
}
