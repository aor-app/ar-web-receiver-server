'use strict';
const fs = require('fs');
const path = require('path');
const RECEIVER_FILE_PATH = path.resolve('./config/receiver.json');
const DOTS = 80;
const SPACE_CHAR_CODE = parseInt(20, 16);
const ARReceiverCore = require('./ar_receiver_core').ARReceiverCore;
class ARReceiver extends ARReceiverCore {
    constructor(port){
        super(port);
        this.powerState = null;
        this.machineStatus = null;
    }
    static async build() {
        let port = await ARReceiverCore.createPort();
        return new ARReceiver(port);
    }
    async execTask (task) {
        if ( this.machineStatus === null ) {
            this.machineStatus = 'receiverMode';
            try {
                let result = await task();
                this.machineStatus = null;
                return result ;
            }catch(e) {
                this.machineStatus = null;
                if (e.code == -3) {
                    return { code: -3, message: 'time out.'}; 
                }else{
                    return { code: -99, message: e.message};
                }
            }
        } else {
            return { code: -2, message: 'busy.'};
        }
    }
    setFrequency (value) {
        const task = async () => {
            const floatValue = parseFloat(value);
            let param = null;
            if ( isFinite(floatValue) ){
                param = floatValue.toFixed(5);
            }
            const result = await super.setFrequency(param);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
    addStepFrequency (value) {
        const task = async () => {
            for(let i = 0; i < value; i++){
                let result = await super.addStepFrequency();
                if ( result.resultCode != '20' ){
                    return { code: -4, message: result.message };
                }
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    subStepFrequency (value) {
        const task = async () => {
            for(let i = 0; i < value; i++){
                let result = await super.subStepFrequency();
                if ( result.resultCode != '20' ){
                    return { code: -4, message: result.message };
                }
            }
            return { code: 0 };
        };
        return this.execTask(task);
    };
    getReceiverState (force=false) {
        const task = async () => {
            let result = null;
            result = await super.getReceiverState(force);
            return Object.assign({code: 0} , result );
        };
        return this.execTask(task);
    }
    setDemodulateMode (value) {
        const task = async () => {
            const result = await super.setDemodulateMode(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    setReceiverStateNotification (value) {
        const task = async () => {
            const result = await super.setReceiverStateNotification(value);
            if (result.resultCode != '20'){
                return { code: -4, message: result.message };
            }
            return Object.assign({code: 0});
        };
        return this.execTask(task);
    }
    setIFBandwidth (value) {
        const task = async () => {
            const result = await super.setIFBandwidth(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    getIFBandwidth () {
        const task = async () => {
            const result = await super.getIFBandwidth();
            return { code: 0 , value: result };
        };
        return this.execTask(task);
    }
    setFrequencyStep (value) {
        const task = async () => {
            const floatValue = parseFloat(value);
            let param = null;
            if ( isFinite(floatValue) ){
                param = floatValue.toFixed(2);
            }
            const result = await super.setFrequencyStep(param);
            if ( result.resultCode != '20' ) {
                return { code: -4, message: result.message };
            }
            const result1 = await super.setFrequencyStepAdjust('0.0');
            if ( result1.resultCode != '20' ) {
                return { code: -4, message: result1.message };
            }
            return {code: 0};
        };
        return this.execTask(task);
    }
    setFrequencyStepAdjust (value) {
        const task = async () => {
            const floatValue = parseFloat(value);
            let param = null;
            if ( isFinite(floatValue) ){
                param = floatValue.toFixed(2);
            }
            const result = await super.setFrequencyStepAdjust(param);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    getFrequencyStepAdjust () {
        const task = async () => {
            const result = await super.getFrequencyStepAdjust();
            if ( result ) {
                return  { code: 0,  value: parseFloat(result) };
            }
            return { code: 0, value: null };
        };
        return this.execTask(task);
    }
    setDigitalDataOutput (value) {
        const task = async () => {
            const result = await super.setDigitalDataOutput(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }

            return { code: 0 };
        };
        return this.execTask(task);
    }
    getDigitalDataOutput () {
        const task = async() => {
            const result = await super.getDigitalDataOutput();
            return { code: 0,  value: result };
        };
        return this.execTask(task);
    }
    setLevelSquelch (value) {
        const task = async () => {
            const intValue = parseInt(value);
            if ( !isFinite(intValue) ){
                return { code: -4, message: 'invalid argument.'};
            }
            if ( !(intValue >= 0 && intValue < 100) ){
                return { code: -4, message: 'argument is out of range.'};
            }
            const param = ('00' + intValue).slice(-2);
            const result = await super.setLevelSquelch(param);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }

            return { code: 0 };
        };
        return this.execTask(task);
    }
    getLevelSquelch () {
        const task = async () => {
            const result = await super.getLevelSquelch();
            if ( result ){
                return { code: 0,  value: parseInt(result) };
            }
            return { code: 0,  value: result };
        };
        return this.execTask(task);
    }
    setVolume (value) {
        const task = async () => {
            const intValue = parseInt(value);
            if ( !isFinite(intValue) ){
                return { code: -4, message: 'invalid argument.'};
            }
            if ( !(intValue >= 0 && intValue < 100) ){
                return { code: -4, message: 'argument is out of range.'};
            }
            const param = ( '00' + intValue ).slice(-2);
            const result = await super.setVolume(param);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    setVFO (value) {
        const task = async () => {
            const result = await super.selectVFO(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    getVFO () {
        const task = async () => {
            const result = await super.getVFOInfo();
            return Object.assign({code: 0} , { value: result });
        };
        return this.execTask(task);
    }
    setReceiverTime (value) {
        const task = async () => {
            const result = await super.setTime(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }
            return { code: 0 };
        };
        return this.execTask(task);
    }
    getVolume () {
        const task = async () => {
            const result = await super.getVolume();
            if ( result ) {
                return { code: 0, value: parseInt(result) };
            }
            return { code:0, value: result};
        };
        return this.execTask(task);
    }
    getDigitalAdditionalInfo (force=false) {
        const task = async () => {
            const result = await super.getDigitalAdditionalInfo(force);
            return Object.assign({code: 0} , { value: result });
        };
        return this.execTask(task);
    }
    getSmeter (){
        const task = async () => {
            const result = await super.getSmeter();
            return Object.assign({code: 0},  { value: result });
        };
        return this.execTask(task);
    };
    getSpectrumSpan () {
        const receiverFile = _readReceiverFile();
        if (receiverFile){
            if (receiverFile['spectrumSpan']){
                return {code: 0, value: receiverFile['spectrumSpan']};
            }else{
                return {code: -4, message: 'read receiver info faild.'};
            }
        }else{
            return {code: -4, message: 'read receiver info faild.'};
        }
    }
    getSpectrumCenter () {
        const receiverFile = _readReceiverFile();
        if (receiverFile){
            if (receiverFile['spectrumCenter']){
                return {code: 0, value: receiverFile['spectrumCenter']};
            }else{
                return {code: -4, message: 'read receiver info faild.'};
            }
        }else{
            return {code: -4, message: 'read receiver info faild.'};
        }
    }
    setSpectrumSpan (value) {
        const result = _writeReceiverFile('spectrumSpan', value);
        if (result != 0){
            return {code: -4, message: 'Error has occured.'};
        }else{
            return {code: 0};
        }
    }
    setSpectrumCenter (value) {
        const result = _writeReceiverFile('spectrumCenter', value);
        if (result != 0){
            return {code: -4, message: 'Error has occured.'};
        }else{
            return {code: 0};
        }
    }
    getSpectrumData () {
        const task = async () => {
            const backup = async () => {
                let tempMode = null;
                let tempFrequency = null;
                let tempIfbw = null;
                let vfo = await super.getReceiverState();
                if (vfo){
                    tempMode = vfo.mode;
                    tempFrequency = vfo.frequency;
                }else{
                    throw new Error('error');
                }
                let ifbw = await super.getIFBandwidth();
                if (ifbw){
                    tempIfbw = ifbw;
                }else{
                    throw new Error('error');
                }
                return [tempMode, tempFrequency, tempIfbw];
            };
            const restore = async () => {
                await super.setFrequency(parseFloat(tempFrequency).toFixed(5));
                await super.setDemodulateMode(tempMode);
                await super.setIFBandwidth(tempIfbw);
            };
            const readParam = () => {
                let centerFrequency = null;
                let span = null;
                const readFile = _readReceiverFile();
                if (readFile){
                    if (readFile.spectrumCenter){
                        centerFrequency = parseFloat(readFile.spectrumCenter);
                    }else{
                        centerFrequency = parseFloat(90);
                    }
                    if (readFile.spectrumSpan){
                        span = parseFloat(readFile.spectrumSpan);
                    }else{
                        span = parseFloat(10);
                    }
                }else {
                    centerFrequency = parseFloat(90);
                    span = parseFloat(10);
                }
                let startFrequency = centerFrequency - span / 2;
                let endFrequency = centerFrequency + span / 2;
                let stepFrequency = span / DOTS;
                return {
                    centerFrequency: centerFrequency,
                    span: span,
                    startFrequency: startFrequency,
                    endFrequency: endFrequency,
                    stepFrequency: stepFrequency
                };
            };
            const init = async (param) => {
                let mode = param.mode;
                let ifbw = param.ifbw;
                if (ifbw == 'default'){
                    if (param.stepFrequency > 100 ){
                        ifbw = '0'; // 200
                    }else if (param.stepFrequency > 50) {
                        ifbw = '1'; // 100
                    }else if (param.stepFrequency > 12 ) {
                        ifbw = '2'; // 30
                    }else if (param.stepFrequency > 6 ) {
                        ifbw = '3'; // 15
                    }else {
                        ifbw = '4'; // 6
                    }
                }
                await super.setDemodulateMode(mode);
                await super.setIFBandwidth(ifbw);
                return ;
            };
            const scan = async (startFrequency, stepFrequency) => {
                let data = [];
                for(let i = 0; i < DOTS; i++){ 
                    let frequency = startFrequency + stepFrequency * i;
                    await super.setFrequency(frequency);
                    await new Promise( (resolve) => {
                        setTimeout( async () => {
                            resolve();
                        },  wait_miri_sec);
                    });
                    let result = await super.getSmeter();
                    if (result){
                        let state = result[0];
                        let smeter = parseInt(result.substr(1,2));
                        let char = String.fromCharCode(smeter + SPACE_CHAR_CODE);
                        data.push(char);
                    }else{
                        console.log('error');
                        data.push(null);
                    }
                }
                return data;
            };
            let wait_miri_sec = 50;

            const [tempMode, tempFrequency, tempIfbw] = await backup();
            const param = readParam();
            await init({
                mode: '0F0',
                ifbw: 'default',
                stepFrequency: param.stepFrequency * 1000
            });
            let data = await scan(param.startFrequency, param.stepFrequency);
            await restore(tempMode,tempFrequency, tempIfbw);

            return { code: 0, value: data.join('') };
        };
        return this.execTask(task);
    }
    powerOn (){
        const task = async () => {
            if ( this.powerState != 'ON'){
                try {
                    const zp = await super.powerOn();
                }catch (e){
                    if (e.code != -3){
                        throw e;
                    }
                }
            }
            const n = await super.setReceiverStateNotification('00');
            const lc = await super.setReceiverStateChangedNotification('0');
            const lt = await super.setSmeterNotification('00');
            const re = await super.setCodeToCommandResult('1');
            this.powerState = 'ON';

            return { code: 0 };
        };
        return this.execTask(task);
    }
    powerOff () {
        const task = async () => {
            if (this.powerState == 'OFF') {
                return { code: 0 };
            }
            const n = await super.setReceiverStateNotification('00');
            const lc = await super.setReceiverStateChangedNotification('0');
            const lt = await super.setSmeterNotification('00');
            const ex = await super.setEX();
            const qp = await super.powerOff('00');
            this.powerState = 'OFF';
            return { code: 0 };
        };
        return this.execTask(task);
    }
    getToneSquelchFrequency () {
        const task = async () => {
            const result = await super.getToneSquelchFrequency();
            return {code: 0, value: result };
        };
        return this.execTask(task);
    }
    getToneSquelch() {
        const task = async () => {
            const result = await super.getToneSquelch();
            return {code: 0, value: result };
        };
        return this.execTask(task);
    }
    setToneSquelch(value) {
        const task = async () => {
            const result = await super.setToneSquelch(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
    setToneSquelchFrequency(value) {
        const task = async () => {
            const result = await super.setToneSquelchFrequency(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
    getDCS() {
        const task = async () => {
            const result = await super.getDCS();
            return {code: 0, value: result };
        };
        return this.execTask(task);
    }
    setDCS(value) {
        const task = async () => {
            const result = await super.setDCS(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
    getDCSCode() {
        const task = async () => {
            const result = await super.getDCSCode();
            return {code: 0, value: result };
        };
        return this.execTask(task);
    }
    setDCSCode(value) {
        const task = async () => {
            const result = await super.setDCSCode(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
    getDCREncryptionCode() {
        const task = async () => {
            const result = await super.getDCREncryptionCode();
            return {code: 0, value: result };
        };
        return this.execTask(task);
    }
    setDCREnqryptionCode(value) {
        const task = async () => {
            const result = await super.setDCREnqryptionCode(value);
            if ( result.resultCode != '20' ){
                return { code: -4, message: result.message };
            }else{
                return { code: 0 };
            }
        };
        return this.execTask(task);
    }
}
const _readReceiverFile = () => {
    const readFile = fs.readFileSync(RECEIVER_FILE_PATH, 'utf8');
    if ( !readFile ){ return null; }
    return JSON.parse(readFile);
};
const _writeReceiverFile = (key, value) => {
    const oldReceiverConfig = _readReceiverFile();
    let newReceiverConfig = {};
    if (!value || !key) { return -1; }
    if (oldReceiverConfig){
        newReceiverConfig = oldReceiverConfig;
    }else{
        newReceiverConfig = {
            "spectrumCenter": 90000000,
            "spectrumSpan": 10000000
        };
    }
    newReceiverConfig[key] = value;
    let result = null;
    fs.writeFileSync(RECEIVER_FILE_PATH, JSON.stringify(newReceiverConfig), (err) => {
        if (err){
            console.log('faild');
        }else{
            console.log('success');
        }
    });
    return 0;
};
module.exports.ARReceiver = ARReceiver;
