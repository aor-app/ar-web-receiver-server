'use strict';
const fs = require('fs');
const path = require('path');
const HOSTAPD_CONF_DIR_PATH = path.resolve('./hostapd');
const HOSTAPD_CONF_FILE_PATH = './hostapd/hostapd.conf';
const operationModeRegexp = /\nhw_mode=[abg]/g;
const countryCodeRegexp = /\ncountry_code=[A-Z]{2}/g;
const ssidRegexp = /\nssid=[\x21-\x7e]*/g;
const channelRegexp = /\nchannel=[0-9]{1,3}/g;
const passphraseRegexp = /\nwpa_passphrase=[\x21-\x7e]*/g;
const getConf = () => {
    let file = fs.readFileSync(HOSTAPD_CONF_FILE_PATH, 'utf-8');
    let operationMode = file.match(operationModeRegexp);
    if ( operationMode ){
        operationMode = operationMode[0].substr(9);
    }
    let countryCode = file.match(countryCodeRegexp);
    if ( countryCode ){
        countryCode = countryCode[0].substr(14);
    }
    let ssid = file.match(ssidRegexp);
    if ( ssid ) {
        ssid = ssid[0].substr(6);
    }
    let channel = file.match(channelRegexp);
    if ( channel ){
        channel = channel[0].substr(9);
    }
    let passphrase = file.match(passphraseRegexp);
    if ( passphrase ){
        passphrase = passphrase[0].substr(16);
    }
    return {
        operationMode: operationMode,
        countryCode: countryCode,
        ssid: ssid,
        channel: channel,
        passphrase: passphrase
    };
};
const createConf = (sourceConfigFilePath=HOSTAPD_CONF_FILE_PATH, param) => {
    let data = fs.readFileSync(sourceConfigFilePath, 'utf-8');
    data = data.replace(operationModeRegexp, `\nhw_mode=${param.operationMode}`);
    data = data.replace(countryCodeRegexp, `\ncountry_code=${param.countryCode}`);
    data = data.replace(ssidRegexp, `\nssid=${param.ssid}`);
    data = data.replace(channelRegexp, `\nchannel=${param.channel}`);
    data = data.replace(passphraseRegexp, `\nwpa_passphrase=${param.passphrase}`);
    fs.writeFile(HOSTAPD_CONF_FILE_PATH, data , (err) => {
        if (err){
            throw err;
        }
    } );
};
const updateConf = (operationMode, countryCode, ssid, channel, passphrase) => {
    const filenames = fs.readdirSync(HOSTAPD_CONF_DIR_PATH);
    const logfileNameRegesp = /hostapd_[0-9]+\.conf\.old/;
    try {
        for (let filename of filenames) {
            if (logfileNameRegesp.test(filename) ){
                fs.unlinkSync(`./hostapd/${filename}`);
            }
        }
        const now = new Date();
        console.log(countryCode);
        const destFilename = `./hostapd/hostapd_${now.getFullYear()}${('0' + now.getMonth()+1).slice(-2)}${('0' + now.getDate()).slice(-2)}${('0' + now.getHours()).slice(-2)}${('0' + now.getMinutes()).slice(-2)}${('0' + now.getSeconds()).slice(-2)}.conf.old`;
        fs.copyFileSync(HOSTAPD_CONF_FILE_PATH, destFilename);
        let param = { operationMode: operationMode,
                      countryCode: countryCode,
                      ssid: ssid,
                      channel: channel,
                      passphrase: passphrase
                    };
        createConf(HOSTAPD_CONF_FILE_PATH, param);
        return ;
    } catch (e) {
        throw e;
    }
};
module.exports.getConf = getConf;
module.exports.updateConf = updateConf;
module.exports.createConf = createConf;
