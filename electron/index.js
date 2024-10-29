const { app, BrowserWindow } = require('electron');

const PORT = 8080;
const APP_URL = 'https://zlamb1.com';
const DEV_APP_URL = `http://localhost:${PORT}`;

const createWindow = async () => {
    const win = new BrowserWindow({
        title: 'Stories',
        width: 800,
        height: 600,
        show: false,
    });

    const url = process.env.NODE_ENV === 'production' ?
        APP_URL : DEV_APP_URL;

    win.removeMenu();
    await win.loadURL(url);
    win.show();
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(async () => {
    await createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});