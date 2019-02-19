'use strict';
const SerialPort = require('serialport');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const constLib = require('./const');
const portList = ['/dev/ttyUSB0', '/dev/ttyACM0'];

let debugOn = true;
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
class ARReceiver {
    constructor(port){
        if (typeof port === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        this.port = port;
        this.machineStatus = null;
        this.powerState = null;
        this.listenCommand = [];
        this.cacheEnabled = null;
        this.cacheData = {
            digitalAdditionalInfo: null,
            receiverState: null
        };
    }
    static async build(){
        const openPort = (portName) => {
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
        for(let i = 0; i < portList.length; i++){
            try {
                let port = await openPort(portList[i]);
                return new ARReceiver(port);
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
    _writeCommand (data, waitTime, receiveResultCount, timeout=15000)  {
        if (!receiveResultCount) {
            receiveResultCount = 1;
        }
        const current = this;
        return new Promise((resolve, reject) => {
            try{
//                debug(`execute: ${data}`);
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
//                            debug('cleanUp');
                        };
                        if (err) {
                            debug('Err: ' + err);
                            reject(err);
                        }
                        this.port.on('data', receiveBuf);
                        this.port.on('error', receiveError);

//                        debug('count 15s.');
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
    _read (data) {
        return this._writeCommand(data, 0);
    }
    _write(data) {
        return this._writeCommand(data, 0);
    }
    _parseBuf(result) {
        let resultBuf = result.split('\r\n')[0];
        if (!resultBuf) {
            return null, null;
        }
        let resultCode = resultBuf.substr(0, 2);
        return [resultCode, resultBuf];
    }
    _getValue (buf, prefix, valueLength) {
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
        let result = await this._write(str);
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
    async _read2 (command) {
        let result = await this._read(command);
        let [resultCode, resultBuf] = this._parseBuf(result);
        if(resultCode != '20'){
            throw new CommandError(-2, "command execute error.");
        }
        return { resultCode: resultCode, resultBuf: resultBuf };
    }
    async initialize() {
        let model = null;
        let version = null;
        let zp = await this._writeCommand('ZP00', 0, 2).catch(
            error =>{
                if ( error.code === -3 ){
                    console.log('recever already power on.');
                } else {
                    console.log('writecommand zp00');
                    reject('error');
                }
            });
        await this._write('LT00').then(
            result => {
                let [resultCode, resultBuf] = this._parseBuf(result);
            });

        await this._write('RT00').then(
        result => {
            let [resultCode, resultBuf] = this._parseBuf(result);
        });

        let wi = await this._read2('WI');
        model = wi.resultBuf.substr(wi.resultBuf.indexOf('AOR') + 4).trim();

        let vr = await this._read2('VR');
        version = this._getValue(vr.resultBuf, 'VR', 5);

        return { model: model, version: version };
    }
    async writeMemory() {
        try {
            await this._writeCommand('MM2', 3000, 2);
            return true;
        } catch (error) {
            // -2
            let resultBuf = error.result[0].split('\r\n', 2);
            if (!resultBuf) {
                throw new CommandError(-3, 'write memory faild.');
            }
            if (resultBuf.length != 2){
                throw new CommandError(-3, 'write memory faild.');
            }
            if (resultBuf[1].trim() !== '20') {
                throw new CommandError(-3, 'write memory faild.');
            }
            return true;
        }
    }
    async createChannel (
        bankNo,
        channelNo,
        passChannel,
        receiveFrequency,
        frequencyStep,
        stepAdjustFrequency,
        writeProtect,
        memoryTag,
        digitalModeEnable,
        digitalDecodeMode,
        analogReceiveMode
    ) {
        let MDn = analogReceiveMode;
        let MDa = '';
        if(digitalModeEnable == '0'){
            MDa = 'F';
        }else{
            let DIGITAL_DECODE_MODE = ['128', '000', '001', '002', '003', '004', '005', '006', '007'];
            MDa = String(DIGITAL_DECODE_MODE.indexOf(digitalDecodeMode));
        }

        let commandMX = `MX${bankNo}${channelNo}`;
        let commandMP = `MP${passChannel}`;
        let commandRF = `RF${receiveFrequency}`;
        let commandST = `ST${frequencyStep}`;
        let commandSH = `SH${stepAdjustFrequency}`;
        let commandMD = `MD0${MDa}${MDn}`;
        let commandPT = `PT${writeProtect}`;
        let commandTT = `TT${memoryTag}`;
        let command = `${commandMX} ${commandMP} ${commandRF} ${commandST} ${commandSH} ${commandMD} ${commandPT} ${commandTT}`;

        let result = await this._write(command);
        let [resultCode, resultBuf] = this._parseBuf(result);
        if (resultCode != '20') {
            return false;
        }
        return { resultCode: resultCode, resultBuf: resultBuf };
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
    async setOffsetIndex (offsetIndex) {
        return await this._executeWrite(`OF${offsetIndex}`);
    }
    async setVoiceDescramblerFrequency (voiceDescramblerFrequency) {
        let voiceDescrambelerFrequency10HzNum = Number(voiceDescramblerFrequency) / 10;
        return await this._executeWrite(`SC${voiceDescrambelerFrequency10HzNum}`);
    }
    async setDCREnqryptionCode (dCREncryptionCode) {
        return await this._executeWrite(`DC${dCREncryptionCode}`); // NOT D-CR -> result:30??
    }
    async setLevelSquelch (level) {
        return await this._executeWrite(`LQ${level}`);
    }
    async setVolume (vol) {
        return await this._executeWrite(`AG${vol}`);
    }
    async setSelectSquelch (selectSquelch) {
        let selectSquelchCode = '0';
        switch (selectSquelch) {
        case '0': //view --> LevelSQ
            selectSquelchCode = '2';
            break;
        case '1': //view --> NoiseSQ
            selectSquelchCode = '1';
            break;
        case '2': //view --> Auto
            selectSquelchCode = '0';
            break;
        default:  //Auto
            selectSquelchCode = '0';
            break;
        }
        return await this._executeWrite(`SQ${selectSquelchCode}`);
    }
    async setAGC (agc) {
        return await this._executeWrite(`AC${agc}`); // NOT IN(AM/SAH/SAL/USB/LSB/CW) -> result:30
    }
    async setDMRSlotSelection (dMRSlotSelection) {
        return await this._executeWrite(`OT${dMRSlotSelection}`);
    }
    async setSquelchType (squelchType) {
        switch(squelchType){
        case constLib.SQUELCH_TYPE.OFF.value:
            return await this._executeWrite('CI0');
        case constLib.SQUELCH_TYPE.CTC.value:
            return await this._executeWrite('CI1');
        case constLib.SQUELCH_TYPE.DCS.value:
            return await this._executeWrite('DI1');
        case constLib.SQUELCH_TYPE.V_SCR.value:
            return await this._executeWrite('SI1');
        case constLib.SQUELCH_TYPE.REV_T.value:
            return await this._executeWrite('CI2');
        default:
            return await this._executeWrite('CI0');
        }
    }
    async setDigitalDataOutput (digitalDataOutput) {
        const result =  await this._executeWrite(`DJ${digitalDataOutput}`);
        return result;
    }
    async setIFBandwidth (iFBandwidth) {
        return await this._executeWrite(`IF${iFBandwidth}`); // DIGITAL MODE -> result: 30
    }
    async setToneSquelchFrequencyCode (toneSquelchFrequencyCode) {
        return await this._executeWrite(`CN${constLib.TONE_SQUELCH_FREQUENCY_CODE[Number(toneSquelchFrequencyCode)]}`);
    }
    async setDCSCode (dCSCode) {
        return await this._executeWrite(`DS${constLib.DCS_CODE[Number(dCSCode)]}`);
    }
    async setDMRColorCode (dMRColorCode) {
        return await this._executeWrite(`CC${dMRColorCode}`);
    }
    async setDMRMuteByColorCode (dMRMuteByColorCode) {
        return await this._executeWrite(`CM${dMRMuteByColorCode}`);
    }
    async setAPCO_P25_NACCode (aPCO_P25NACCode) {
        return await this._executeWrite(`PC${aPCO_P25NACCode.substr(2, 3)}`);
    }
    async setAPCO_P25MuteByNACCode (aPCO_P25MuteByNACCode) {
        return await this._executeWrite(`PM${aPCO_P25MuteByNACCode}`);
    }
    async setNXDN_RANCode (nXDN_RANCode) {
        return await this._executeWrite(`NC${nXDN_RANCode}`);
    }
    async setNXDNMuteByRANCode (nXDNMuteByRANCode) {
        return await this._executeWrite(`NM${nXDNMuteByRANCode}`);
    }
    async setVoiceDescrambler(voiceDescrambler) {
        if (voiceDescrambler === '00') {
            return await this._executeWrite('SI0');
        }else{
            return await this._executeWrite('SI1');
        }
    }
    async getChannelHeader (bankNo, channelNo) {
        let parseMode = (mode) => {
            let digitalDecodeModeCode = mode.substr(0,1);
            let digitalModeSettingCode = mode.substr(1,1);
            let analogReceiveModeCode = mode.substr(2,1);
            let DIGITAL_DECODE_MODE = ['128', '000', '001', '002', '003', '004', '005', '006', '007'];
            let digitalModeEnable = null;
            let digitalDecodeMode = null;
            let analogReceiveMode = analogReceiveModeCode;
            if (digitalModeSettingCode == 'F') {
                digitalModeEnable = '0'; //analog
                digitalDecodeMode = '000';
            } else {
                digitalModeEnable = '1'; //digital

                digitalDecodeMode = DIGITAL_DECODE_MODE[digitalModeSettingCode];
            }
            return {
                digitalModeEnable: digitalModeEnable,
                digitalDecodeMode: digitalDecodeMode,
                analogReceiveMode: analogReceiveMode
            };
        };
        let channelNoStr = ('00' + channelNo).slice(-2);
        let bankNoStr = ('00' + bankNo).slice(-2);
        let readChannelCommand = 'MA' + bankNoStr + channelNoStr;
        let readChannelInfo = {};
        let result = await this._read(readChannelCommand);
        if (!result) {
            return false;
        }
        let [resultCode, resultBuf] = this._parseBuf(result);
        if (resultCode != '20') {
            return false;
        }
        readChannelInfo.channelRegistedFlg = resultBuf.indexOf('MX' + bankNoStr + channelNoStr + ' --- ') == -1 ? '1' : '0';
        readChannelInfo.bankNo = this._getValue(resultBuf, 'MX', 2);
        readChannelInfo.channelNo = this._getValue(resultBuf, 'MX' + bankNoStr, 2);
        if (readChannelInfo.channelRegistedFlg == '0') {
            return false;
        }
        readChannelInfo.passChannel = this._getValue(resultBuf, 'MP', 1);
        readChannelInfo.receiveFrequency = this._getValue(resultBuf, 'RF', 10);
        readChannelInfo.frequencyStep = this._getValue(resultBuf, 'ST', 6);
        readChannelInfo.stepAdjustFrequency = this._getValue(resultBuf, 'SH', 6);

        readChannelInfo.writeProtect = this._getValue(resultBuf, 'PT', 1);
        readChannelInfo.memoryTag = this._getValue(resultBuf, 'TT', 12);
        let mode = parseMode(this._getValue(resultBuf,'MD', 3));
        readChannelInfo.digitalModeEnable = mode.digitalModeEnable;
        readChannelInfo.digitalDecodeMode = mode.digitalDecodeMode;
        readChannelInfo.analogReceiveMode = mode.analogReceiveMode;

        return readChannelInfo;
    }
    async getOffsetIndex () {
        let result = await this._read2('OF');
        return this._getValue(result.resultBuf, 'OF', 3);
    }
    async getVoiceDescramblerFrequency () {
        let result = await this._read2('SC');
        return Number(this._getValue(result.resultBuf, 'SC', 3)) * 10;
    }
    async getDCREncryptionCode () {
        let result = await this._read2('DC');
        return  this._getValue(result.resultBuf, 'DC', 5);
    }
    async getSelectSquelch () {
        let result = await this._read2('SQ');
        return this._getValue(result.resultBuf, 'SQ', 1);
    }
    async getLevelSquelch () {
        let result = await this._read2('LQ');
        return this._getValue(result.resultBuf, 'LQ', 2);
    }
    async getAGC () {
        let result = await this._read2('AC');
        return this._getValue(result.resultBuf, 'AC', 1);
    }
    async getDMRSlotSelection () {
        let result = await this._read2('OT');
        return this._getValue(result.resultBuf, 'OT', 1);
    }
    async getVoiceDescrambler () {
        let result = await this._read2('SI');
        return this._getValue(result.resultBuf, 'SI', 1);
    }
    async getSmeter () {
        let result = await this._read2('LM');
        return this._getValue(result.resultBuf, 'LM', 3);
    }
    async getSquelchType () {
        let squelchType = '0';
        let ciResult = await this._read2('CI');
        let toneSquelchState = this._getValue(ciResult.resultBuf, 'CI', 1);
        if (toneSquelchState == '1'){
            squelchType = '1'; // CTC
        } else if (toneSquelchState == '2') {
            squelchType = '4'; // REV.T
        } else {
            //
        }

        let diResult = await this._read2('DI');
        let dcsState = this._getValue(diResult.resultBuf, 'DI', 1);
        if (dcsState == '1'){
            squelchType = '2'; // DCS
        }

        let voiceDescramblerState = await this.getVoiceDescrambler();
        if(voiceDescramblerState == '1'){
            squelchType = '3'; // V.SCR
        }
        return squelchType;
    }
    async getDigitalDataOutput () {
        let result = await this._read2('DJ');
        return this._getValue(result.resultBuf, 'DJ', 1);
    }
    async getFrequencyStepAdjust () {
        let result = await this._read2('SH');
        return this._getValue(result.resultBuf, 'SH', 6);
    }
    async getIFBandwidth () {
        let result = await this._read2('IF');
        return this._getValue(result.resultBuf, 'IF', 1);
    }
    async getDigitalAdditionalInfo (force=false) {
        let result = null;
        let listener = this.listenCommand.find((item)=> { return item == 'DK';});
        if (force || !listener){
            result = await this._read2('DK');
            result = this._getValue(result.resultBuf, 'DK', null);
        }else{
            result = this.cacheData.digitalAdditionalInfo;
        }
        return result;
    }
    async getSystemClock () {
        let result = await this._read2('DT');
        return this._getValue(result.resultBuf, 'DT', null);
    }
    async getToneSquelch () {
        let result = await this._read2('CN');
        let toneSquelchFrequencyId = constLib.TONE_SQUELCH_FREQUENCY_CODE.indexOf(this._getValue(result.resultBuf, 'CN', 2));
        return ('00' + toneSquelchFrequencyId).slice(-2);
    }
    async getDCSCode () {
        let result = await this._read2('DS');
        let dcsCodeId = constLib.DCS_CODE.indexOf(this._getValue(result.resultBuf, 'DS', 3));
        return ('00' + dcsCodeId).slice(-2);
    }
    async getDMRColorCode () {
        let result = await this._read2('CC');
        return this._getValue(result.resultBuf, 'CC', 2);
    }
    async getDMRMuteByColorCode () {
        let result = await this._read2('CM');
        return this._getValue(result.resultBuf, 'CM', 1);
    }
    async getAPCO_P25NACCode () {
        let result = await this._read2('PC');
        return '0x' + this._getValue(result.resultBuf, 'PC', 3);
    }
    async getAPCO_P25MuteByNACCode () {
        let result = await this._read2('PM');
        return this._getValue(result.resultBuf, 'PM', 1);
    }
    async getNXDN_RANCode () {
        let result = await this._read2('NC');
        return this._getValue(result.resultBuf, 'NC', 2);
    }
    async getNXDNMuteByRANCode () {
        let result = await this._read2('NM');
        return  this._getValue(result.resultBuf, 'NM', 1);
    }
    async getVoiceSquelch () {
        let result = await this._read2('VQ');
        return  this._getValue(result.resultBuf, 'VQ', 1);
    }
    async getAutoNotch () {
        let result = await this._read2('LS');
        return this._getValue(result.resultBuf, 'LS', 1);
    }
    async getNoiseRedirection () {
        let result = await this._read2('NR');
        return this._getValue(result.resultBuf, 'NR', 1);
    }
    async getVolume () {
        let result = await this._read2('AG');
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
    async getChannelData (model, bankNo, channelNo) {
        let channel = constLib.setDefaultData(new Array);
        let channelNoStr = ('00' + channelNo).slice(-2);
        let bankNoStr = ('00' + bankNo).slice(-2);

        let channelHeader = await this.getChannelHeader(bankNo, channelNo);
        if (!channelHeader) {
            return false;
        }
        if (channelHeader.channelRegistedFlg != '1') {
            return false;
        }

        channel[constLib.MC.MEMORY_BANK] = channelHeader.bankNo;
        channel[constLib.MC.MEMORY_CHANNEL] = channelHeader.channelNo;
        channel[constLib.MC.CHANNEL_REGISTERD_FLG] = channelHeader.channelRegistedFlg;
        channel[constLib.MC.PASS_CHANNEL] = channelHeader.passChannel;
        channel[constLib.MC.RECEIVE_FREQUENCY] = channelHeader.receiveFrequency;
        channel[constLib.MC.FREQUENCY_STEP] = channelHeader.frequencyStep;
        channel[constLib.MC.STEP_ADJUST_FREQUENCY] = channelHeader.stepAdjustFrequency;
        channel[constLib.MC.WRITE_PROTECT] = channelHeader.writeProtect;
        channel[constLib.MC.MEMORY_TAG] = channelHeader.memoryTag;
        channel[constLib.MC.DIGITAL_MODE_ENABLE] = channelHeader.digitalModeEnable;
        channel[constLib.MC.DIGITAL_DECODE_MODE] = channelHeader.digitalDecodeMode;
        channel[constLib.MC.ANALOG_RECEIVE_MODE] = channelHeader.analogReceiveMode;

        if (channel[constLib.MC.CHANNEL_REGISTERD_FLG] != '1') {
            return channel;
        }

        await this.selectChannel(bankNoStr, channelNoStr);

        channel[constLib.MC.OFFSET_INDEX] = await this.getOffsetIndex();
        channel[constLib.MC.VOICE_DESCRAMBLER_FREQUENCY] = await this.getVoiceDescramblerFrequency();
        channel[constLib.MC.DCR_ENQRYPTION_CODE] = await this.getDCREncryptionCode();
        channel[constLib.MC.SELECT_SQUELCH] = await this.getSelectSquelch();
        channel[constLib.MC.AGC] = await this.getAGC();
        channel[constLib.MC.DMR_SLOT_SELECTION] = await this.getDMRSlotSelection();
        channel[constLib.MC.SQUELCH_TYPE] = await this.getSquelchType();
        channel[constLib.MC.VOICE_DESCRAMBLER] = await this.getVoiceDescrambler();
        channel[constLib.MC.DIGITAL_DATA_OUTPUT] = await this.getDigitalDataOutput();
        channel[constLib.MC.IF_BANDWIDTH] = await this.getIFBandwidth();
        channel[constLib.MC.TONE_SQUELCH_FREQUENCY] = await this.getToneSquelch();
        channel[constLib.MC.DCS_CODE] = await this.getDCSCode();
        channel[constLib.MC.DMR_COLOR_CODE] = await this.getDMRColorCode();
        channel[constLib.MC.DMR_MUTE_BY_COLOR_CODE] = await this.getDMRMuteByColorCode();
        channel[constLib.MC.APCO_P_25_NAC_CODE] = await this.getAPCO_P25NACCode();
        channel[constLib.MC.APCO_P_25_MUTE_BY_NAC_CODE] = await this.getAPCO_P25MuteByNACCode();
        channel[constLib.MC.NXDN_RAN_CODE] = await this.getNXDN_RANCode();
        channel[constLib.MC.NXDN_MUTE_BY_RAN_CODE] = await this.getNXDNMuteByRANCode();

        if (model === 'AR-DV1'){
            channel[constLib.MC.VOICE_SQUELCH] = await this.getVoiceSquelch();
            channel[constLib.MC.AUTO_NOTCH] = await this.getAutoNotch();
            channel[constLib.MC.NOISE_REDIRECTION] = await this.getNoiseRedirection();
        }

        return channel;
    }
    async destroyBank (bankNo) {
        return await this._executeWrite(`MB${bankNo}`);
    }
    async writeMemoryChannelData (model, bankNo, channelNo, data) {
        let bankNoStr = ('00' + bankNo).slice(-2);
        let channelNoStr = ('00' + channelNo).slice(-2);

        await this.selectVFO('A');
        await this.createChannel(bankNoStr,
                            channelNoStr,
                            data[constLib.MC.PASS_CHANNEL],
                            data[constLib.MC.RECEIVE_FREQUENCY],
                            data[constLib.MC.FREQUENCY_STEP],
                            data[constLib.MC.STEP_ADJUST_FREQUENCY],
                            data[constLib.MC.WRITE_PROTECT],
                            data[constLib.MC.MEMORY_TAG],
                            data[constLib.MC.DIGITAL_MODE_ENABLE],
                            data[constLib.MC.DIGITAL_DECODE_MODE],
                            data[constLib.MC.ANALOG_RECEIVE_MODE]
                                );
        await this.writeMemory();
        await this.selectChannel(bankNoStr, channelNoStr);
        await this.setOffsetIndex(data[constLib.MC.OFFSET_INDEX]);
        await this.setVoiceDescramblerFrequency(data[constLib.MC.VOICE_DESCRAMBLER_FREQUENCY]);
        await this.setDCREnqryptionCode(data[constLib.MC.DCR_ENQRYPTION_CODE]);
        await this.setSelectSquelch(data[constLib.MC.SELECT_SQUELCH]);
        await this.setAGC(data[constLib.MC.AGC]);
        await this.setDMRSlotSelection(data[constLib.MC.DMR_SLOT_SELECTION]);
        await this.setSquelchType(data[constLib.MC.SQUELCH_TYPE]);
        await this.setDigitalDataOutput(data[constLib.MC.DIGITAL_DATA_OUTPUT]);
        await this.setIFBandwidth(data[constLib.MC.IF_BANDWIDTH]);
        await this.setToneSquelchFrequencyCode(data[constLib.MC.TONE_SQUELCH_FREQUENCY]);
        if (model === 'AR-DV10') {
            await this.setVoiceDescrambler(data[constLib.MC.VOICE_DESCRAMBLER]);
        }
        await this.setDCSCode(data[constLib.MC.DCS_CODE]);
        await this.setDMRColorCode(data[constLib.MC.DMR_COLOR_CODE]);
        await this.setDMRMuteByColorCode(data[constLib.MC.DMR_MUTE_BY_COLOR_CODE]);
        await this.setAPCO_P25_NACCode(data[constLib.MC.APCO_P_25_NAC_CODE]);
        await this.setAPCO_P25MuteByNACCode(data[constLib.MC.APCO_P_25_MUTE_BY_NAC_CODE]);
        await this.setNXDN_RANCode(data[constLib.MC.NXDN_RAN_CODE]);
        await this.setNXDNMuteByRANCode(data[constLib.MC.NXDN_MUTE_BY_RAN_CODE]);

        return true;

    }
    readMemoryData () {
        let task = async () => {
            let model =  null;
            let version =  null;
            let banks =  [];
            let info = await  this.initialize();
            model = info.model;
            version = info.version;
            for(let bankNo = 0; bankNo < 40; bankNo++){
                let bank = [];
                for(let channelNo = 0; channelNo < 50; channelNo++){
                    let channelData = await this.getChannelData(model, bankNo, channelNo);
                    bank.push(channelData);
                }
                banks[bankNo] = bank;
            }
            banks = banks;
            await this._writeCommand('EX', 3000);
            return { model: model, version: version, banks: banks };
        };
        return new Promise((resolve, reject) => {
            if ( this.machineStatus != null ) {
                console.log('read process');
                reject(new CommandError(-2, 'busy.'));
            }else{
                this.machineStatus = 'ReadingMemoryData';
                task().then(
                    result => {
                        this.machineStatus = null;
                        resolve({ code: 0, data: result });
                    }).catch(
                        error => {
                            this.machineStatus = null;
                            reject(error);
                            console.log(error);
                        });
            }
        });
    }
    writeMemoryData (banks) {
        let task = async () => {
            let model = null;
            await this.initialize().then(
                result => {
                    model = result.model;
                });
            await this.selectVFO('A');
            for(let bankNo = 0; bankNo < banks.length; bankNo++) {
                let bankNoStr = ('00' + bankNo).slice(-2);
                await this.destroyBank(bankNoStr);
                await this.writeMemory();
                for(let channelNo = 0; channelNo < banks[bankNo].length; channelNo++){
                    let data =  banks[bankNo][channelNo];
                    let channelRegisterdFlg = data[constLib.MC.CHANNEL_REGISTERD_FLG];
                    if(channelRegisterdFlg === '1') {
                        await this.writeMemoryChannelData(model, bankNo, channelNo, data);
                        await this.writeMemory();
                    }
                }
            }
            await this.writeMemory();
            await this._writeCommand('EX', 3000);
        };
        return new Promise((resolve, reject) => {
            if ( this.machineStatus != null ) {
                reject(new CommandError(-2, 'busy.'));
            }else{
                this.machineStatus = 'WritingMemoryData';
                task().then(
                    result => {
                        this.machineStatus = null;
                        resolve({ code: 0, message: 'complete'});
                        console.log('write process done');
                    },
                    error => {
                        console.log(error);
                        this.machineStatus = null;
                        reject(error);
                    });
            }
        });
    }
    getModel () {
        let task = async () => {
            let model = null;
            await this.initialize().then(
                result => {
                    model = result.model;
                });
            await this._writeCommand('EX', 3000);
            return model;
        };
        return new Promise((resolve, reject) => {
            if ( this.machineStatus != null ) {
                reject(new CommandError( -2, 'busy.'));
            }else{
                this.machineStatus = 'getModel';
                task().then(
                    result => {
                        this.machineStatus = null;
                        resolve({ code: 0, model: result});
                        console.log('get model process done');
                    },
                    error => {
                        this.machineStatus = null;
                        reject(error);
                    });
            }
        });
    }
    async powerOff() {
        let result = null;
        if ( this.powerState === null || this.powerState === 'ON'){
            await this.setReceiverStateNotification('00');
            this.powerState = 'OFF';
        }
        return result;
    }
    async _powerOn() {
        let result = null;
        let zpError = null;
        console.log(this.powerState);
        if ( this.powerState === null || this.powerState === 'OFF') {
            this.powerState = 'ON';
            result = await this._writeCommand('ZP00', 0, 2, 15000).catch(
                error => {
                    zpError = error;
                    if ( error.code === -3 ){
                        console.log('recever already power on.');
                    } else {
                        this.powerState = null;
                    }
                });
        }
        if ( zpError ) {
            result = zpError;
        }
        return result;
    }

    powerOn () {
        let task = async () => {
            const power = await this._powerOn();
            await this.setReceiverStateNotification('00');
            await this._write('LC0').then(/* server setup */
                result => {
                    let [resultCode, resultBuf] = this._parseBuf(result);
                });
            await this._write('LT00').then(/* server setup */
                result => {
                    let [resultCode, resultBuf] = this._parseBuf(result);
                });
            await this._write('RE1').then( /* server setup */
                result => {
                    let [resultCode, resultBuf] = this._parseBuf(result);
                });

            return null;
        };
        return new Promise((resolve, reject) => {
            if ( this.machineStatus === null ) {
                this.machineStatus = 'receiverMode';
                task().then(
                    result => {
                        this.machineStatus = null;
                        resolve({ code: 0});
                    },
                    error => {
                        this.machineStatus = null;
                        reject(error);
                    });
            } else {
                reject(new CommandError( -2, 'busy.'));
            }
        });
    }
    _execTask (task) {
        return new Promise((resolve, reject) => {
            if ( this.machineStatus === null ) {
                this.machineStatus = 'receiverMode';
                task().then(
                    result => {
                        this.machineStatus = null;
                        resolve(result);
                    },
                    error => {
                        this.machineStatus = null;
                        if (error.code == -3) {
                            resolve ({ code: -3, message: 'time out.receiver powered off?'});
                        }
                        reject(error);
                    });
            } else {
                resolve({ code: -2, message: 'busy.'});
            }
        });
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
    async getReceiverState (force=false) {
        let result = null;
        if ( this.cacheData.receiverState && !force ){
            result = this.cacheData.receiverState;
        }else{
            result = await this._read2('RX');
            result = this._parseReceiverState(result.resultBuf);
        }
        return result;
    }
    disconnect () {
        let task = async () => {
            try {
                let powerOff = await this.powerOff();
                await this._write('LC0').then(
                    result => {
                        let [resultCode, resultBuf] = this._parseBuf(result);
                    });
                await this._write('LT00').then(
                    result => {
                        let [resultCode, resultBuf] = this._parseBuf(result);
                    });
                await this._writeCommand('EX', 3000);
                await this._write('QP00').then (
                    result => {
                        let [resultCode, resultBuf] = this._parseBuf(result);
                    });
                return {code: 0};
            } catch (error) {

                if ( error.code === -3 ){
                    return { code: -3, message: 'time out. receiver powered off?'};
                }else{
                    throw error;
                }
            }
        };
        return this._execTask(task);
    }
}

module.exports.CommandError = CommandError;
module.exports.ARReceiver = ARReceiver;

