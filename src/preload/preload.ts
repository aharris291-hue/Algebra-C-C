/**
 * The only bridge between the UI and the app. Exposes the typed API plus a few desktop
 * actions (file dialogs, print). No Node access reaches the page.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { API_METHODS } from '../shared/api';

const API_METHODS_LIST = [...API_METHODS];

contextBridge.exposeInMainWorld('academyBridge', {
  methods: API_METHODS_LIST,
  call: (method: string, args: unknown[]) => ipcRenderer.invoke('academy:call', method, args),
  saveBackupFile: (pin: string) => ipcRenderer.invoke('academy:saveBackupFile', pin),
  pickBackupFile: () => ipcRenderer.invoke('academy:pickBackupFile'),
  openDataFolder: () => ipcRenderer.invoke('academy:openDataFolder'),
  print: () => ipcRenderer.invoke('academy:print'),
  platform: 'desktop',
});
