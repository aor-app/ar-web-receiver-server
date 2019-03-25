'use strict';
const SerialPort = require('serialport');
const iconv = require('iconv-lite');
const constLib = require('./const');
const portList = ['/dev/receiver','/dev/ttyACM0'];
let debugOn = false;
const debug = (msg) => {
    if (debugOn){
        console.log(msg);
    }
};
class CommandError extends Error {
    constructor(code, message){
        super(message);
        this.code = code;
    }
}
class ARReceiverCore {
    constructor(port){
        if (typeof port === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        this.port = port;
    }
    static openPort (portName) {
        let port =  new SerialPort(portName, {
            baudRate: 115200,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false,
            autoOpen: false
        });

        return new Promise((resolve, reject) => {
            port.open((error) => {
                if (error) {
                    reject(error);
                }else{
                    resolve(port);
                }
            });
        });
    };

    static async build(){
        for(let i = 0; i < portList.length; i++){
            try {
                let port = await ARReceiverCore.openPort(portList[i]);
                return new ARReceiverCore(port);
            } catch ( error ) {
                console.log(error.message);
                if (i < portList.length - 1){
                    continue;
                }else{
                    throw new Error('serial port open error.');
                }
            }
        }
    }

    static async createPort() {
        for(let i = 0; i < portList.length; i++){
            try {
                let port = await ARReceiverCore.openPort(portList[i]);
                return port;
            } catch ( error ) {
                console.log(error.message);
                if (i < portList.length - 1){
                    continue;
                }else{
                    throw new Error('serial port open error.');
                }
            }
        }
    }
    _writeCommand (data, waitTime, receiveResultCount, timeout=500)  {
        if (!receiveResultCount) {
            receiveResultCount = 1;
        }
        const current = this;
        return new Promise((resolve, reject) => {
            try{
                debug(`execute: ${data}`);
                setTimeout(() => {
                    let commandSJIS = iconv.encode(data + '\r\n', 'Shift_JIS');
                    this.port.write(commandSJIS, (err) => {
                        let receiveCount = 0;
                        let retArray = new Array;
                        const receiveBuf = (input) => {
                            let buffer = Buffer.from(input, 'binary');
                            let retStr = iconv.decode(buffer, 'Shift_JIS');
                            try {
                                debug(`${data}: ${retStr}`);
                                let commandResults = retStr.split('\r\n');
                                for(let i = 0; i < commandResults.length; i++){
                                    if (commandResults[i] === ''){
                                        break;
                                    }else{
                                        const [resultCode, resultBuf] = current._parseBuf(commandResults[i]);
                                        if (resultCode == 10){
                                            break;
                                        }
                                    }
                                    receiveCount += 1;
                                    retArray.push(commandResults[i]);
                                }

                                if (receiveCount === receiveResultCount) {
                                    if (retArray.length === 1){
                                        resolve(retArray[0]);
                                    }else{
                                        resolve(retArray);
                                    }
                                }
                            } catch(e) {
                                debug(e);
                                return;
                            } finally {
                                if (receiveCount === receiveResultCount) {
                                    cleanUp();
                                }
                            }
                        };
                        const receiveError = (err) => {
                            reject(err);
                            cleanUp();
                        };
                        const cleanUp = () => {
                            this.port.removeListener('data', receiveBuf);
                            this.port.removeListener('error', receiveError);
                            debug('cleanUp');
                        };
                        if (err) {
                            debug('Err: ' + err);
                            reject(err);
                        }
                        this.port.on('data', receiveBuf);
                        this.port.on('error', receiveError);

                        setTimeout(() => {
                            if (receiveCount !== receiveResultCount ){
                                console.log('time out .');
                                reject({
                                    code: -3,
                                    message: 'timeout(15s).',
                                    result: retArray});
                                cleanUp();
                            }
                        }, timeout); //15000
                    });
                }, waitTime);
            }catch(e){
                reject({code: -3, message: e});
                debug(e);
                return;
            }
        });
    }
    _parseBuf(result) {
        let resultBuf = result.split('\r\n')[0];
        if (!resultBuf) {
            return null, null;
        }
        let resultCode = resultBuf.substr(0, 2);
        return [resultCode, resultBuf];
    }
    _getValue (buf, prefix, valueLength=null) {
        let index = buf.indexOf(prefix);
        if (index == -1 ) {
            return null;
        }
        if (valueLength === null) {
            return buf.substr(index + prefix.length);
        }else{
            return buf.substr(index + prefix.length, valueLength);
        }
    }
    async _executeWrite (str) {
        let result = await this._writeCommand(str, 0);
        let [resultCode, resultBuf] = this._parseBuf(result);
        let ret = null;
        switch(resultCode) {
        case '20':
        case '10':
            ret = {resultCode: resultCode, resultBuf: resultBuf };
            break;
        case '30':
            ret = {resultCode: resultCode, resultBuf: resultBuf, message: 'Unconfigurable state.'};
            break;
        case '40':
            ret = {resultCode: resultCode, resultBuf: resultBuf, message: 'Format error.'};
            break;
        case '50':
            ret = {resultCode: resultCode, resultBuf: resultBuf, message: 'Argument is out of range.'};
            break;
        }
        return ret;
    }
    async selectVFO (mode) {
        return await this._executeWrite(`VF${mode}`);
    }
    async setTime(value) {
        return await this._executeWrite(`DT${value}`);
    }
    async selectChannel (bankNo, channelNo) {
        return await this._executeWrite(`MR${bankNo}${channelNo}`);
    }
    async setFrequencyStep (step) {
        return await this._executeWrite(`ST${step}`);
    }
    async setFrequencyStepAdjust ( stepAdjust ){
        return await this._executeWrite(`SH${stepAdjust}`);
    }
    async setFrequency (value) {
        return await this._executeWrite(`RF${value}`);
    }
    async setDCREnqryptionCode (dCREncryptionCode) {
        return await this._executeWrite(`DC${dCREncryptionCode}`);
    }
    async setLevelSquelch (level) {
        return await this._executeWrite(`LQ${level}`);
    }
    async setVolume (vol) {
        return await this._executeWrite(`AG${vol}`);
    }
    async setDigitalDataOutput (digitalDataOutput) {
        return await this._executeWrite(`DJ${digitalDataOutput}`);
    }
    async setIFBandwidth (iFBandwidth) {
        return await this._executeWrite(`IF${iFBandwidth}`);
    }
    async getDCREncryptionCode () {
        let result = await this._executeWrite('DC');
        return  this._getValue(result.resultBuf, 'DC', 5);
    }
    async getLevelSquelch () {
        let result = await this._executeWrite('LQ');
        return this._getValue(result.resultBuf, 'LQ', 2);
    }
    async getSmeter () {
        let result = await this._executeWrite('LM');
        return this._getValue(result.resultBuf, 'LM', 3);
    }
    async getDigitalDataOutput () {
        let result = await this._executeWrite('DJ');
        return this._getValue(result.resultBuf, 'DJ', 1);
    }
    async getFrequencyStepAdjust () {
        let result = await this._executeWrite('SH');
        return this._getValue(result.resultBuf, 'SH', 6);
    }
    async getIFBandwidth () {
        let result = await this._executeWrite('IF');
        return this._getValue(result.resultBuf, 'IF', 1);
    }
    async getDigitalAdditionalInfo () {
        let result = null;
        result = await this._executeWrite('DK');
        result = this._getValue(result.resultBuf, 'DK', null);
        return result;
    }
    async getVolume () {
        let result = await this._executeWrite('AG');
        return this._getValue(result.resultBuf, 'AG', 2);
    }
    async getVFOInfo () {
        let results = await this._writeCommand('VI', 0, 3).catch(
            error =>{
                if ( error.code === -2 ){
                    console.log('recever ');
                } else {
                    console.log('writecommand');
//                    reject('error');
                }
            });
        let vfoInfo = new Array;
        for(let result of results){
            let resultarray = result.trim().split(' ');
            let vfo = {};
            for(let i = 1; i< resultarray.length; i++){
                let key = resultarray[i].slice(0, 2);
                let value = resultarray[i].slice(2);
                switch(key) {
                case 'VF':
                    vfo['vfo'] = value;
                    break;
                case 'RF':
                    vfo['frequency'] = parseFloat(value);
                    break;
                case 'ST':
                    vfo['stepFrequency'] = parseFloat(value);
                    break;
                case 'MD':
                    vfo['mode'] = value;
                    break;
                case 'SH':
                    vfo['stepAdjustFrequency'] = parseFloat(value);
                    break;
                default:
                    break;
                }
                //            vfo[key] = value;
            }
            vfoInfo.push(vfo);
        }
        return vfoInfo;
    }
    async setDemodulateMode (mode) {
        return await this._executeWrite(`MD${mode}`);
    }
    async setReceiverStateChangedNotification (value) {
        return await this._executeWrite(`LC${value}`);
    }
    async setSmeterNotification (value) {
        return await this._executeWrite(`LT${value}`);
    }
    async setCodeToCommandResult (value) {
        return await this._executeWrite(`RE${value}`);
    }
    async setEX () {
        return await this._executeWrite(`EX`);
    }
    async powerOff (value='') {
        return await this._executeWrite(`QP${value}`);
    }
    async powerOn (value='') {
        return await this._writeCommand(`ZP${value}`, 0, 2, 15000);
    }
    async setReceiverStateNotification (value){
        if (isNaN(value)){
            return null;
        }
        let valueStr = ('0' + String(value)).slice(-2);
        const result = await this._executeWrite(`RT${valueStr}`);
        return result;
    }
    async addStepFrequency(){
        return await this._executeWrite(`ZK`);
    }
    async subStepFrequency(){
        return await this._executeWrite(`ZJ`);
    }
    _parseReceiverState(value) {
        const values = value.split(' ');
        let currentVFO = null;
        let currentFrequency = null;
        let currentStepFrequency = null;
        let currentMode = null;
        let currentSmeter = null;
        for(let item of values) {
            let prefix = item.substr(0,2);
            switch(prefix) {
            case 'VF':
                currentVFO = item.substr(2,1);
                break;
            case 'RF':
                currentFrequency = item.substr(2);
                break;
            case 'ST':
                currentStepFrequency = item.substr(2);
                break;
            case 'MD':
                currentMode = item.substr(2);
                let mode = item.substr(2);
                break;
            case 'LM':
                currentSmeter = item.substr(2,4);
                break;
            default:
                break;
            }
        }
        return {
            vfo: currentVFO,
            frequency: parseFloat(currentFrequency),
            stepFrequency: parseFloat(currentStepFrequency),
            mode: currentMode,
            smeter: currentSmeter
        };
    }
    async getReceiverState () {
        let result = await this._executeWrite('RX');
        result = this._parseReceiverState(result.resultBuf);
        return result;
    }
    async setToneSquelchFrequency (value) {
        return await this._executeWrite(`CN${value}`);
    }
    async getToneSquelchFrequency () {
        let result = await this._executeWrite('CN');
        let toneSquelchFrequencyId = this._getValue(result.resultBuf, 'CN', null);
        if (toneSquelchFrequencyId){
            toneSquelchFrequencyId = toneSquelchFrequencyId.trim();
        }
        return toneSquelchFrequencyId;
    }
    async setToneSquelch (value) {
        return await this._executeWrite(`CI${value}`);
    }
    async getToneSquelch () {
        let result = await this._executeWrite('CI');
        let toneSquelch = this._getValue(result.resultBuf, 'CI', 1);
        return toneSquelch;
    }
    async setDCS (value) {
        return await this._executeWrite(`DI${value}`);
    }
    async getDCS () {
        let result = await this._executeWrite('DI');
        let dcs = this._getValue(result.resultBuf, 'DI', 1);
        return dcs;
    }
    async setDCSCode (value) {
        return await this._executeWrite(`DS${value}`);
    }
    async getDCSCode () {
        let result = await this._executeWrite('DS');
        let dcsCode = this._getValue(result.resultBuf, 'DS', null);
        if (dcsCode){
            dcsCode = dcsCode.trim();
        }
        return dcsCode;
    }
    async setTTCSlot (value) {
        return await this._executeWrite(`TS${value}`);
    }
    async getTTCSlot () {
        let result = await this._executeWrite('TS');
        let ttcSlot = this._getValue(result.resultBuf, 'TS', 2);
        return ttcSlot;
    }
}
module.exports.CommandError = CommandError;
module.exports.ARReceiverCore = ARReceiverCore;
