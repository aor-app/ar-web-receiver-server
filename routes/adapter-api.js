const express = require('express');
const router = express.Router();
const exec = require('child_process');
const path = require('path');
const os = require('os');
const SHUTDOWN = path.resolve('./command/shutdown.sh');
const REBOOT = path.resolve('./command/reboot.sh');
const SSHD = path.resolve('./command/sshd.sh');
const authenticator = require('../lib/authenticator');
const hostapd = require('../lib/hostapd');
let arReceiver = null;
const initialize = ( receiver ) => {
    arReceiver = receiver;
};
router.post('/login', (req, res, next) => {
    const password = req.body.password;
    const result = authenticator.authorizeAPI(req.ip, password);
    if ( result.code == 0 ){
        req.session.sid = result.session;
        res.send({code: 0, session: result.session});
    }else{
        res.json({code: -1, message: result.message});
    }
});
router.get('/receiver_status', authenticator.authenticate,  (req, res, next) => {
    if ( arReceiver && arReceiver.machineStatus  != null ) {
        res.json({code: 0,  status: 'busy'});
    } else {
        res.json({code: 0,  status: 'idle'});
    }
});
router.post('/shutdown', authenticator.authenticate, (req, res, next) => {
    try {
        exec.execFile(SHUTDOWN, (error, stdout, stderror) => {
            if ( error ){
                throw error;
            }
        });
    }catch(e){
        res.json({code: -4, message: 'Error occured.'});
    }
    res.json({code: 0, message: 'received.'});
});
router.post('/reboot', authenticator.authenticate, (req, res, next) => {
    try {
        exec.execFile(REBOOT, (error, stdout, stderror) => {
            if ( error ){
                throw error;
            }
        });
    }catch(e){
        res.json({code: -4, message: 'Error occured.'});
    }
    res.json({code:0, message: 'received.'});
});
router.get('/network_interfaces',authenticator.authenticate, (req, res, next) => {
    res.json({ code: 0, value: os.networkInterfaces()});
});
router.get('/wifi', authenticator.authenticate, (req, res, next)=>{
    const wifiSettings = hostapd.getConf();
    res.json({ code: 0, value: wifiSettings});
});
router.post('/password', authenticator.authenticate, (req, res, next) => {
    const password = req.body.password;
    let result = authenticator.update(password);
    res.json(result);
});
router.post('/wifi', authenticator.authenticate, (req, res, next) => {
    try {
        hostapd.updateConf(req.body.operationMode,
                          req.body.country,
                          req.body.ssid,
                          req.body.channel,
                          req.body.passphrase
                         );
        res.json({ code: 0, message: 'Wifi update successfully.'});
    }catch(e){
        res.json({ code: -1, message: e.message });
    }
});
router.post('/ssh', authenticator.authenticate, (req, res, next) => {
    let value = null;
    if (req.body.value){
        if (req.body.value == '1'){
            value = 'start';
        }else if (req.body.value == '0'){
            value = 'stop';
        }else{
            res.json({code: -4, message: 'no value'});
        }
    }else{
        res.json({code: -4, message: 'no value'});
    }
    if (value){
        try {
            exec.execFile(SSHD,[value], (error, stdout, stderror) => {
                if ( error ){
                    throw error;
                }
            });
        }catch(e){
            res.json({code: -4, message: 'Error occured.'});
        }
        console.log('executed');
        res.json({code:0, message: 'received.'});
    }
});
module.exports.router = router;
module.exports.initialize = initialize;
