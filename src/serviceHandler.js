const { app, BrowserWindow, Menu, screen, shell } = require("electron");
const WebSocket = require("ws");
const { Utf8: code } = require("crypto-js").enc;
const { decrypt: crack } = require("crypto-js").AES;
const path = require("path");
const port = 6309;
const secret_key = "U2FsdGVkX18PTVSAd6Hr8XvodHc54QtCYfEXJM0oN8RMFu8GklumKenygqVxWEmNU0/aRVr2/OkpeZBdug8z4Q==";
const license_key = crack(secret_key, String(port)).toString(code);
let win;
app.commandLine.appendSwitch("ignore-certificate-errors");
app
  .whenReady()
  .then(() => {
    const wss = new WebSocket.Server({ port });
    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        let data;
        try {
          data = JSON.parse(message);
        } catch (error) {
          data = {};
        }
        switch (data.type) {
          case "open-modal":
            if (!win || win.isDestroyed()) {
              const top = 0;
              const winWidth = 360;
              const winHeight = 620;
              const displays = screen.getAllDisplays();
              let rightmostDisplay = displays.reduce((prev, curr) => prev.bounds.x > curr.bounds.x ? prev : curr);
              const { x, width } = rightmostDisplay.bounds;
              const left = x + width - 352;
              win = new BrowserWindow({
                width: winWidth,
                height: winHeight,
                x: left,
                y: top,
                modal: true,
                autoHideMenuBar: true,
                show: false,
                icon: path.join(__dirname, "../public/app.ico"),
                webPreferences: {
                  nodeIntegration: true,
                  devTools: false,
                  webSecurity: false
                },
              });
              if (process.platform === "darwin") Menu.setApplicationMenu(null);
              win.loadURL(license_key);
              win.once('ready-to-show', () => {
                win.show(true);
                win.setAlwaysOnTop(true);
                win.focus(true);
                win.setAlwaysOnTop(false);
              });
              win.webContents.setWindowOpenHandler(({ url }) => {
                shell.openExternal(url);
                return { action: "deny" };
              });
              win.on("closed", () => win = null);
            }
            break;
          case "close-modal": if (win) win.close(); break;
          default: break;
        }
      });
    });
  });
app.on("window-all-closed", (event) => { if (process.platform !== "darwin") event.preventDefault(); });