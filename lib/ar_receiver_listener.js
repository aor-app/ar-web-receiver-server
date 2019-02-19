'use strict';
const iconv = require('iconv-lite');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const dataWacher = new EventEmitter();
const init =  (arReceiver) => {
    arReceiver.port.on('data', dataListener);
    return dataWacher;
};
const dataListener = (data) => {
    const buffer = Buffer.from(data, 'binary');
    const retStr = iconv.decode(buffer, 'Shift_JIS');
    try {
        const commandResults = retStr.split('\r\n');
        for(let i = 0; i < commandResults.length; i++){
            if (commandResults[i] === ''){
                break;
            }else{
                const [resultCode, resultBuf] = _parseBuf(commandResults[i]);
                if (resultCode != 10){
                    break;
                }
                const receiveCommand = resultBuf.substr(2,2);
                writeLog({buf: resultBuf, command: receiveCommand});
                writeLog({result: receiveCommand == 'DK'});
                if (receiveCommand == 'DK'){
                    // DK exec
                    writeLog({message: "DKPROCESS", value: commandResults[i]});
                    dk(commandResults[i]);
                }else if (receiveCommand == 'RX'){
                    rx(resultBuf);
                }else{
                    writeLog({message: "UNKNOWN"});
                }
                break;
            }
        }
    }catch(e){
        console.log(`notification error : ${e.message}`);
    }
};
const _parseBuf = (result) =>  {
    let resultBuf = result.split('\r\n')[0];
    if (!resultBuf) {
        return null, null;
    }
    let resultCode = resultBuf.substr(0, 2);
    return [resultCode, resultBuf];
};
const _getValue = (buf, prefix, valueLength=null) => {
    let index = buf.indexOf(prefix);
    if (index == -1 ) {
        return null;
    }
    if (valueLength === null) {
        return buf.substr(index + prefix.length);
    }else{
        return buf.substr(index + prefix.length, valueLength);
    }
};
const _parseReceiverState = (value) => {
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
};
const dk = (data) => {
    const digitalAdditionalInfo = _getValue(data, 'DK', null);
    dataWacher.emit('dk',JSON.stringify({command: 'DK', data: digitalAdditionalInfo}));
};
const rx = (data) => {
    const receiverState = _parseReceiverState(data);
    dataWacher.emit('rx', JSON.stringify({command: 'RX', data: receiverState}));
};
let debug = false;
const writeLog = (str) => {
    if (debug){
        fs.appendFile('./log/server.log', JSON.stringify(str) + '\n', (err)=> {
            if (err){
                throw err;
            }
        });
    }
};

module.exports.init = init;

