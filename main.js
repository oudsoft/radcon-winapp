/*
 * Copyright (C) 2017 Jason Henderson
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

// The big boy
const electron = require('electron');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Setup the logging for the app to write to the console (developer tools),
// as well as a file located at ~/Library/Logs/[productName]
const log = require('electron-log');

// Make sure to set the logging level to the
log.transports.console.level = 'info';
log.transports.file.level = 'info';

// Helpers
const os = require('os');
const path = require('path');
const url = require('url');

// Name of the product, used in some app labels
const productName = require('./package.json').productName;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
var webServer;
var shuttingDown;

function startExpress() {

	// Create the path of the express server to pass in with the spawn call
	var webServerDirectory = path.join(__dirname, 'http', 'bin', 'www');
	log.info('starting node script: ' + webServerDirectory);

	var nodePath = "C:/Program Files (x86)/nodejs/node.exe";
	if (process.platform === 'win32') {
		// Overwrite with the windows path...only testing on mac currently
		nodePath = "C:/Program Files (x86)/nodejs/node.exe";
	}

	// Optionally update environment variables used
	var env = JSON.parse(JSON.stringify(process.env));

	// Start the node express server
  const { spawn } = require('child_process');
	webServer = spawn(nodePath,[webServerDirectory], {
		env : env
	});

	// Were we successful?
	if (!webServer) {
		log.info("couldn't start web server");
		return;
	}

	// Handle standard out data from the child process
	webServer.stdout.on('data', function (data) {
		log.info('data: ' + data);
	});

	// Triggered when a child process uses process.send() to send messages.
	webServer.on('message', function (message) {
		log.info(message);
	});

	// Handle closing of the child process
	webServer.on('close', function (code) {
		log.info('child process exited with code ' + code);
		webServer = null;

		// Only restart if killed for a reason...
		if (!shuttingDown) {
			log.info('restarting...');
			startExpress();
		}
	});

	// Handle the stream for the child process stderr
	webServer.stderr.on('data', function (data) {
		log.info('stderr: ' + data);
	});

	// Occurs when:
	// The process could not be spawned, or
	// The process could not be killed, or
	// Sending a message to the child process failed.
	webServer.on('error', function (err) {
		log.info('web server error: ' + err);
	});
}

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: productName
	});

	log.info(mainWindow);

	// Create the URL to the locally running express server
	mainWindow.loadURL(url.format({
		pathname: 'localhost:3000/webapp',
		protocol: 'http:',
		slashes: true
	}));

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	});

	const template = require('./appmenu.js') (productName, mainWindow);
	const Menu = electron.Menu;
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
	shuttingDown = false;
	startExpress();
	createWindow();
});

// Called before quitting...gives us an opportunity to shutdown the child process
app.on('before-quit',function()
{
	log.info('gracefully shutting down...');

	// Need this to make sure we don't kick things off again in the child process
	shuttingDown = true;

	// Kill the web process
	webServer.kill();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

/*
if (process.platform === "win32") {
	var rl = require("linebyline").createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on("SIGINT", function () {
		process.emit("SIGINT");
	});
}
*/

process.on("SIGINT", function () {
	//graceful shutdown
	log.info('shutting down...');
	process.exit();
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
});
