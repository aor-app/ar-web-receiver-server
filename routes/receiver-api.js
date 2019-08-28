const express = require('express');
const router = express.Router();
const ARReceiver = require('../lib/ar_receiver').ARReceiver;
const path = require('path');
const fs = require('fs');
const readline =require('readline');
const iconv = require('iconv-lite');
const url = require('url');
const authenticator = require('../lib/authenticator');
let arReceiver = null;
const initialize = async () => {
    try {
        arReceiver = await ARReceiver.build();
        return arReceiver;
    }catch (e) {
        console.log(e.message);
    }
};
router.get('/spectrum_data', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getSpectrumData();
    res.json(result);
});
router.get('/spectrum_span', authenticator.authenticate,  (req, res, next) => {
    const result = arReceiver.getSpectrumSpan();
    res.json(result);
});
router.get('/spectrum_center',authenticator.authenticate, (req, res, next) => {
    const result = arReceiver.getSpectrumCenter();
    res.json(result);
});
router.post('/spectrum_span', authenticator.authenticate, (req, res, next) => {
    const result = arReceiver.setSpectrumSpan(req.body.value);
    res.json(result);
});
router.post('/spectrum_center',authenticator.authenticate, (req, res, next) => {
    const result = arReceiver.setSpectrumCenter(req.body.value);
    res.json(result);
});

router.post('/power', authenticator.authenticate, async (req, res, next) => {
    if (req.body.value) {
        let result = null;
        switch(req.body.value){
        case '0':
            result = await arReceiver.powerOff();
            break;
        case '1':
            result = await arReceiver.powerOn();
            break;
        default:
            // error
        }
        res.json(result);
    }else {
        // error
    }
});
router.get('/receiver_state', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getReceiverState(null);
    res.json(result);
});
router.post('/demodulate_mode', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setDemodulateMode(req.body.value);
    res.json(result);
});
router.post('/receiver_state_notification', authenticator.authenticate, async (req, res, next)=>{
    const result = await arReceiver.setReceiverStateNotification(req.body.value);
    res.json(result);
});
router.post('/ifbandwidth', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setIFBandwidth(req.body.value);
    res.json(result);
});

router.get('/ifbandwidth', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getIFBandwidth();
    res.json(result);
});

router.post('/frequency_step', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setFrequencyStep(req.body.value);
    res.json(result);
});

router.post('/frequency_step_adjust', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setFrequencyStepAdjust(req.body.value);
    res.json(result);
});

router.post('/digital_data_output', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setDigitalDataOutput(req.body.value);
    res.json(result);
});

router.get('/digital_data_output', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getDigitalDataOutput();
    res.json(result);
});

router.post('/select_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setSelectSquelch(req.body.value);
    res.json(result);
});

router.get('/select_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getSelectSquelch();
    res.json(result);
});

router.post('/noise_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setNoiseSquelch(req.body.value);
    res.json(result);
});

router.get('/level_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getLevelSquelch();
    res.json(result);
});

router.post('/level_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setLevelSquelch(req.body.value);
    res.json(result);
});

router.get('/level_squelch', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getLevelSquelch();
    res.json(result);
});

router.post('/volume', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setVolume(req.body.value);
    res.json(result);
});
router.post('/vfo', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setVFO(req.body.value);
    res.json(result);
});

router.get('/vfo', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getVFO();
    res.json(result);
});

router.post('/time', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setReceiverTime(req.body.value);
    res.json(result);
});

router.post('/frequency', authenticator.authenticate, async (req, res, next) => {
    let result = null;
    if (req.body){
        if (req.body.value){
            result = await arReceiver.setFrequency(req.body.value);
        }else if(req.body.step){
            let step = parseInt(req.body.step);
            if ( step > 0 ){
                result = await arReceiver.addStepFrequency(step);
            }else{
                step = step * -1;
                result = await arReceiver.subStepFrequency(step);
            }
        }else{
            // error 
        }
    }else {
        // error 
    }
    res.json(result);
});

router.get('/volume', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getVolume();
    res.json(result);
});
router.get('/frequency_step_adjust', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getFrequencyStepAdjust();
    res.json(result);
});
router.get('/digital_additional_info', authenticator.authenticate, async (req, res, next) => {
    let force = false;
    let urlParse = url.parse(req.url, true);
    if (urlParse.query){
        if (urlParse.query.force == 'true'){
            force = true;
        }
    }
    const result = await arReceiver.getDigitalAdditionalInfo(force);
    res.json(result);
});
router.get('/smeter', authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getSmeter();
    res.json(result);
});
router.get('/ctcss',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getToneSquelch();
    res.json(result);
});
router.post('/ctcss',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setToneSquelch(req.body.value);
    res.json(result);
});
router.get('/ctcss_frequency',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getToneSquelchFrequency();
    res.json(result);
});
router.post('/ctcss_frequency',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setToneSquelchFrequency(req.body.value);
    res.json(result);
});
router.get('/dcs',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getDCS();
    res.json(result);
});
router.post('/dcs',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setDCS(req.body.value);
    res.json(result);
});
router.get('/dcs_code',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getDCSCode();
    res.json(result);
});
router.post('/dcs_code',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setDCSCode(req.body.value);
    res.json(result);
});
router.get('/dcr_encryption_code',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getDCREncryptionCode();
    res.json(result);
});
router.post('/dcr_encryption_code',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setDCREnqryptionCode(req.body.value);
    res.json(result);
});
router.get('/ttcslot',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.getTTCSlot();
    res.json(result);
});
router.post('/ttcslot',  authenticator.authenticate, async (req, res, next) => {
    const result = await arReceiver.setTTCSlot(req.body.value);
    res.json(result);
});

module.exports.router = router;
module.exports.initialize = initialize;
