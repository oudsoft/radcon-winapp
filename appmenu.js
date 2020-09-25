/* appmenu.js */
module.exports = (productName, mainWindow) => {
	const template = [
		/*
		{
			label: 'View',
			submenu: [
				{
					role: 'reload'
				},
				{
					role: 'forcereload'
				},
				{
					role: 'toggledevtools'
				},
				{
					type: 'separator'
				},
				{
					role: 'resetzoom'
				},
				{
					role: 'zoomin'
				},
				{
					role: 'zoomout'
				},
				{
					type: 'separator'
				},
				{
					role: 'togglefullscreen'
				}
			]
		},
		{
			role: 'windowmodule.exports = () => {',
			submenu: [
				{
					role: 'minimize'
				},
				{
					role: 'close'
				}
			]
		},
		*/		
		{
			role: 'help',
			submenu: [
				{
					label: 'User Manual',
					click: function() {
						//electron.shell.openItem(os.homedir() + '/Library/Logs/electron-express/log.log');
						mainWindow.loadURL('http://localhost:3000/webapp/users');
					}
				}
			]
		}
	];

	template.unshift({
		label: productName,
		submenu: [
			/*
			{
				role: 'about'
			},
			{
				type: 'separator'
			},
			{
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				role: 'hide'
			},
			{
				role: 'hideothers'
			},
			{
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			*/
			{
				label: 'Home',
				click: function() {
					//electron.shell.openItem(os.homedir() + '/Library/Logs/electron-express/log.log');
					mainWindow.loadURL('http://localhost:3000/webapp/');
				}
			},
			{
				role: 'quit'
			}
		]
	});

	return template;
}