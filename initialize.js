const authenticator = require('./lib/authenticator');
const hostapd = require('./lib/hostapd');
const fs = require('fs');
const os = require('os');
const getMac = require('getmac');
const INITIALIZE_CONFIG_FILE_PATH = './config/initialize.json';
const HOSTAPD_CONFIG_FILE_PATH = './hostapd/hostapd.conf';
const HOSTAPD_CONFIG_SOURCE_FILE_PATH = './hostapd/hostapd.conf.ini';
const initializeFile =  fs.readFileSync(INITIALIZE_CONFIG_FILE_PATH, 'utf8');
const initialize = async () => {
    if (!initializeFile) {
        console.log('initialize setting file not found.');
    }else{
        const settings = JSON.parse(initializeFile);
        let macAddress = await new Promise((resolve, reject) => {
            getMac.getMac({iface: 'wlan0'}, (error, wlanMacAddress)=> {
                if (error){
                    reject(error);
                }else{
                    resolve(wlanMacAddress);
                }
            });
        });
        let localID = '';
        if (macAddress){
            localID = macAddress.replace(/:/g,'').slice(-4);
        }
        if (!settings){
            console.log('initialize setting file not json.');
        }else{
            const loginFileExists = fs.existsSync(authenticator.LOGIN_FILE_PATH);
            if (!loginFileExists){
                let password = 'password';
                if (settings['security']){
                    if (settings['security']['password']){
                        password = settings['security']['password'] + localID;
                    }else{
                        console.log('password setting not found.');
                    }
                }else{
                    console.log('security setting not found.');
                }
                authenticator.update(password);
            }
            const fileExists = fs.existsSync(HOSTAPD_CONFIG_FILE_PATH);
            if (!fileExists){
                let param = {
                    countryCode: 'JP',
                    operationMode: 'g',
                    ssid: 'SSID',
                    passphrase: 'password'
                };
                if (settings['wifi']){
                    if (settings['wifi']['country']){
                        param.countryCode = settings['wifi']['country'];
                    }else{
                        console.log('wifi country setting not found.');
                    }
                    if (settings['wifi']['operationMode']){
                        param.operationMode = settings['wifi']['operationMode'];
                    }else{
                        console.log('wifi operation mode not found.');
                    }
                    if (settings['wifi']['channel']){
                        param.channel = settings['wifi']['channel'];
                    }else{
                        console.log('wifi channel not found.');
                    }
                    if (settings['wifi']['ssid']){
                        param.ssid = settings['wifi']['ssid'] + localID;
                    }else{
                        console.log('wifi ssid setting not found.');
                    }
                    if (settings['wifi']['passphrase']){
                        param.passphrase = settings['wifi']['passphrase'] + localID;
                    }else{
                        console.log('wifi passphrase not found.');
                    }
                }else{
                    console.log('wifi setting not found.');
                }
                hostapd.createConf(HOSTAPD_CONFIG_SOURCE_FILE_PATH, param );
            }
        }
    }
};
initialize();
