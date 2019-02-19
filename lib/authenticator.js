const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');
const salt = bcrypt.genSaltSync(10);
const EventEmitter = require('events').EventEmitter;
const sessionWacher = new EventEmitter();
const LOGIN_FILE_PATH = path.resolve('./config/login.json');
const API_SESSION_FILE_PATH = path.resolve('./sessions/api.json');
const _createSession = (sessionFilePath) => {
    const saveSession = _readSession();
    let newSaveSession = [];
    if (saveSession){
        if (saveSession.length == 2){
            let oldSession = null;
            for(let session of saveSession){
                if (oldSession == null || session.loginDate < oldSession.loginDate){
                    oldSession = session;
                }
            }
            for(let session of saveSession){
                if(session.sessionKey != oldSession.sessionKey){
                    newSaveSession.push(session);
                }
            }
        }else{
            newSaveSession = saveSession;
        }
    }else{
        newSaveSession = [];
    }
    const newSession = {
        sessionKey: uuidv4(),
        loginDate: new Date().getTime()
    };
    newSaveSession.push(newSession);
    fs.writeFileSync(sessionFilePath, JSON.stringify(newSaveSession), (err) => {
        if (err) {
            console.log('update session key faild');
        }else {
            console.log('update session key');
        }
    });
    sessionWacher.emit('update', newSaveSession);
    return newSession.sessionKey;
};
const _readSession = () => {
    try {
        const readFile = fs.readFileSync(API_SESSION_FILE_PATH, 'utf8');
        if ( !readFile ){ return null; }
        const sessions = JSON.parse(readFile);
        if ( !sessions ) { return null; }
        return sessions;
    }catch (e){
//        console.log(e);
        return null;
    }
};
const _authorize = (password, sessionFilePath) => {
    let loginInfo = JSON.parse(fs.readFileSync(LOGIN_FILE_PATH, 'utf8'));
    let errorMessage = new Array;
    let errorCode = 0;
    if ( !loginInfo ){
        console.log('user info not found.');
        return {code: -99, message: 'user info not found.'};
    }
    if ( !bcrypt.compareSync(password, loginInfo["password"] )){
        console.log('Invalid password.');
        return { code: -1, message: 'Invalid password.' };
    }else{
        const session = _createSession(sessionFilePath);
        return {code: 0, session: session};
    }
};
const authorizeAPI = (ip, password) => {
    if (_isLocalAccess(ip)){
        const session = _createSession(API_SESSION_FILE_PATH);
        return { code: 0, session: session};
    }else{
        return _authorize(password, API_SESSION_FILE_PATH);
    }

};
const PASSWORD_CHAR = new RegExp(/[^\x21-\x7e]/); // ASCII
const update = (password) => {
    const user = {
        password: bcrypt.hashSync(password, salt)
    };
    if ( !password ){
        return { code: -1, message: 'Please input Password.'};
    }
    if ( PASSWORD_CHAR.test(password) ){
        return { code: -1, message: 'Invalid characters are included.'};
    }
    if ( password.length < 8 ){
        return { code: -1, message: 'Password is too short.'};
    }
    fs.writeFileSync(LOGIN_FILE_PATH, JSON.stringify(user), (err) => {
        if (err) {
            console.log('update user info faild');
        }
    });
    return { code: 0, message: 'Password update successfully.' };
};
const _isAuthenticated = (sessionKey, sessionFilePath) => {
    if ( !sessionKey ) {
        return false;
    }
    const saveSessions = _readSession();
    if ( !saveSessions ){
        return false;
    }
    let exists = false;
    for(let saveSession of saveSessions){
        if (sessionKey == saveSession['sessionKey']){
            exists = true;
        }
    }
    return exists;
};
const _isLocalAccess = (ip) => {
    let ipv4 = ip;
    if ( ip.substr(0, 7) == '::ffff:') {
        ipv4 = ip.substr(7);
    }
    const wlanIp = /192\.168\.0\.[0-9]{1,2}$/;
    if ( wlanIp.test(ipv4) ) {
        return true;
    }else{
        return false;
    }
};
const isAuthenticatedAPI = (session) => {
    if ( _isAuthenticated(session, API_SESSION_FILE_PATH) ){
        return true;
    } else {
        return false;
    }
};
const authenticate = (req, res, next) => {
    if (req.session.sid){
        if ( isAuthenticatedAPI(req.session.sid) ){
            next();
        }else{
            res.json({code: -1, message: 'authenticated faild.'});
        }
    }else{
        res.json({code: -1, message: 'authenticated faild.'});
    }
};

module.exports.authorizeAPI = authorizeAPI;
module.exports.authenticate = authenticate;
module.exports.isAuthenticatedAPI = isAuthenticatedAPI;
module.exports.update = update;
module.exports.sessionWacher = sessionWacher;
module.exports.LOGIN_FILE_PATH = LOGIN_FILE_PATH;
