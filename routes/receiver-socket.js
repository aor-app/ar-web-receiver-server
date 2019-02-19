'use strict';
const WebSocketServer = require('ws').Server;
const spawn = require('child_process').spawn;
const authenticator = require('../lib/authenticator');
const arReceiverListener = require('../lib/ar_receiver_listener');
const MAX_USER_COUNT = 2;
let userCount = 0;
let rec = null;
let cp = null;

const receiverSocket = (server, sessionParser,arReceiver) => {
    const verifyClient = (info, done) => {
        sessionParser(info.req, {}, ()=>{
            if (info.req.session.sid){
                const result = authenticator.isAuthenticatedAPI(info.req.session.sid);
                if (result){
                    done(info.req.session.sid);
                }else{
                    done(false, 401, "please login");
                }
            }else{
                done(false, 401, "please login");
            }
        });
    };
    const dataWacher = arReceiverListener.init(arReceiver);
    let ws = new WebSocketServer({verifyClient: verifyClient, server: server});
    ws.on('connection', function (s,req) {
        const startSoundProcess = () => {
            cp = spawn("arecord", [ '-D', 'plughw:1,0', '-c', '1', '-r', '44100', '-f', 'S16_LE', '-t', 'raw' ], {} );
            rec = cp.stdout;
            return rec;
        };
        const endSoundProcess = () => {
            rec = null;
            cp.kill(9);
            authenticator.sessionWacher.removeListener('update', sessionUpdate);
            dataWacher.removeListener('dk', dk);
            dataWacher.removeListener('rx', rx);
        };
        const dk = (data) => {
            s.send(data, (error) => {});
        };
        const rx = (data) => {
            s.send(data, (error) => {});
        };
        const sessionUpdate = (sessions) => {
            let revoked = true;
            for(let saveSession of sessions){
                if (saveSession.sessionKey == session){
                    revoked = false;
                }
            }
            if (revoked){
                session = null;
                s.close();
            }
        };
        const soundSender = (sample) => {
            if (session){
                if ( s.readyState == 1 ) {
                    s.send(sample);
                }
            }
        };

        userCount++;
        if ( !rec ){
            startSoundProcess();
        }
        let session = req.session.sid;
        authenticator.sessionWacher.on('update', sessionUpdate);
        dataWacher.on('dk', dk);
        dataWacher.on('rx', rx);
        rec.on('data', soundSender);
        s.on('close', function () {
            console.log('close');
            userCount--;
            console.log(userCount);
            if (userCount == 0){
                endSoundProcess();
            }
        });
    });
};
module.exports = receiverSocket;
