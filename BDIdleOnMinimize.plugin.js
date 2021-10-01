/**
 * @name BDIdleOnMinimize
 * @source https://github.com/exilvm/BDIdleOnMinimize/blob/main/BDIdleOnMinimize.plugin.js
 * @updateUrl https://raw.githubusercontent.com/exilvm/BDIdleOnMinimize/main/BDIdleOnMinimize.plugin.js
 * @website https://github.com/exilvm/BDIdleOnMinimize
 * @version 1.0.0
 */

 const request = require('request');
 const fs = require('fs');
 const path = require('path');

 const config = {
   info: {
     name: 'BDIdleOnMinimize',
     authors: [
       {
           name: "exilvm",
       }
     ],
     version: '1.0.0',
     description: 'Automatically change your Discord status to Idle upon app minimization.',
     github: 'https://github.com/exilvm/BDIdleOnMinimize',
     github_raw: 'https://raw.githubusercontent.com/exilvm/BDIdleOnMinimize/main/BDIdleOnMinimize.plugin.js',
   },
   changelog: []
 };

 module.exports = !global.ZeresPluginLibrary ? class {
   constructor() {
     this._config = config;
   }
   load() {
     BdApi.showConfirmationModal('Library plugin is needed',
       `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
         confirmText: 'Download',
         cancelText: 'Cancel',
         onConfirm: () => {
           request.get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
             if (error)
               return electron.shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
             fs.writeFileSync(path.join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body);
           });
         }
       });
   }
   start() {}
   stop() {}
 } : (([Plugin, Library]) => {
   const Dispatcher = BdApi.findModuleByProps('dispatch', 'subscribe');
   class IdleOnMinimize extends Plugin {
     constructor() {
       super();
     }
     async focusChange(o) {
      const StatusStore = BdApi.findModuleByProps('getStatus');
      const currentUser = BdApi.findModuleByProps('getCurrentUser').getCurrentUser();
      const status = StatusStore.getStatus(currentUser.id);
       if (!o.isFocused) {
         if (status === 'invisible') return;
         if (status === 'idle') return;
         await BdApi.saveData('IdleOnMinimize', 'status', status)
         BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({
           status: 'idle'
         })
       } else {
        if (status === 'invisible') return;
         const savedStatus = BdApi.getData('IdleOnMinimize', 'status');
         BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({
           status: savedStatus
         })
       }
     }
     onStart() {
       const focusChange = this.focusChange;
       window.addEventListener('blur', function(){
         focusChange({isFocused: false});
       });
       window.addEventListener('focus', function(){
         focusChange({isFocused: true});
       });
     }
     onStop() {}
   }
   return IdleOnMinimize;
 })(global.ZeresPluginLibrary.buildPlugin(config));
