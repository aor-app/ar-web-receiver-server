const MC = {
    MC1_ROWNAME:                  0,
    MEMORY_BANK:                  1,
    MEMORY_CHANNEL:               2,
    RECEIVE_FREQUENCY:            3,
    FREQUENCY_STEP:               4,
    STEP_ADJUST_FREQUENCY:        5,
    OFFSET_INDEX:                 6,
    DUMMY1:                       7,
    CW_PITCH:                     8,
    VOICE_DESCRAMBLER_FREQUENCY:  9,
    DCR_ENQRYPTION_CODE:         10,
    VOICE_SQUELCH:               11,
    SELECT_SQUELCH:              12,
    AGC:                         13,
    DUMMY2:                      14,
    //MC2
    MC2_ROWNAME:                 15,
    AUTO_NOTCH:                  16,
    NOISE_REDIRECTION:           17,
    DMR_SLOT_SELECTION:          18,
    SQUELCH_TYPE:                19,
    DIGITAL_DATA_OUTPUT:         20,
    DIGITAL_MODE_ENABLE:         21,
    ANALOG_RECEIVE_MODE:         22,
    DIGITAL_DECODE_MODE:         23,
    IF_BANDWIDTH:                24,
    TONE_SQUELCH_FREQUENCY:      25,
    VOICE_DESCRAMBLER:           26,
    DCS_CODE:                    27,
    CHANNEL_REGISTERD_FLG:       28,
    DUMMY3:                      29,
    PASS_CHANNEL:                30,
    DUMMY4:                      31,
    WRITE_PROTECT:               32,
    DUMMY5:                      33,
    MEMORY_TAG:                  34,
    //MC3
    MC3_ROWNAME:                 35,
    DMR_COLOR_CODE:              36,
    DMR_MUTE_BY_COLOR_CODE:      37,
    DUMMY6:                      38,
    APCO_P_25_NAC_CODE:          39,
    APCO_P_25_MUTE_BY_NAC_CODE:  40,
    DUMMY7:                      41,
    NXDN_RAN_CODE:               42,
    NXDN_MUTE_BY_RAN_CODE:       43,
    DUMMY8:                      44
};
function setDefaultData(array){
    array[MC.MC1_ROWNAME] = 'MC1';
    array[MC.MEMORY_BANK] = null;
    array[MC.MEMORY_CHANNEL] = null;
    array[MC.RECEIVE_FREQUENCY] = '0434.40000';
    array[MC.FREQUENCY_STEP] = '020.00';
    array[MC.STEP_ADJUST_FREQUENCY] = '000.00';
    array[MC.OFFSET_INDEX] = '+00';
    array[MC.DUMMY1] = '+00000';
    array[MC.CW_PITCH] = '0600';
    array[MC.VOICE_DESCRAMBLER_FREQUENCY] = '2000';
    array[MC.DCR_ENQRYPTION_CODE] = '00000';
    array[MC.VOICE_SQUELCH] = '0';
    array[MC.SELECT_SQUELCH] = '2';
    array[MC.AGC] = '0';
    array[MC.DUMMY2] = '0x0000';
    array[MC.MC2_ROWNAME] = 'MC2';
    array[MC.AUTO_NOTCH] = '0';
    array[MC.NOISE_REDIRECTION] = '0';
    array[MC.DMR_SLOT_SELECTION] = '0';
    array[MC.SQUELCH_TYPE] = '0';
    array[MC.DIGITAL_DATA_OUTPUT] = '1';
    array[MC.DIGITAL_MODE_ENABLE] = '0';
    array[MC.ANALOG_RECEIVE_MODE] = '0';
    array[MC.DIGITAL_DECODE_MODE] = '000';
    array[MC.IF_BANDWIDTH] = '3';
    array[MC.TONE_SQUELCH_FREQUENCY] = '00';
    array[MC.VOICE_DESCRAMBLER] = '00';
    array[MC.DCS_CODE] = '00';
    array[MC.CHANNEL_REGISTERD_FLG] = '0';
    array[MC.DUMMY3] = '0';
    array[MC.PASS_CHANNEL] = '0';
    array[MC.DUMMY4] = '0';
    array[MC.WRITE_PROTECT] = '0';
    array[MC.DUMMY5] = '00';
    array[MC.MEMORY_TAG] = '';
    array[MC.MC3_ROWNAME] = 'MC3';
    array[MC.DMR_COLOR_CODE] = '00';
    array[MC.DMR_MUTE_BY_COLOR_CODE] = '0';
    array[MC.DUMMY6] = '0';
    array[MC.APCO_P_25_NAC_CODE] = '0x000';
    array[MC.APCO_P_25_MUTE_BY_NAC_CODE] = '0';
    array[MC.DUMMY7] = '0';
    array[MC.NXDN_RAN_CODE] = '00';
    array[MC.NXDN_MUTE_BY_RAN_CODE] = '0';
    array[MC.DUMMY8] = '0';
    return array;
}
const SQUELCH_TYPE = {
    OFF: { value: '0', name: 'OFF'},
    CTC: { value: '1', name: 'CTC'},
    DCS: { value: '2', name: 'DCS'},
    V_SCR: { value: '3', name: 'V.SCR'},
    REV_T: { value: '4', name: 'REV.T'}
};
const DCS_CODE = [
    '000',
    '999',
    '017',
    '023',
    '025',
    '026',
    '031',
    '032',
    '036',
    '043',
    '047',
    '050',
    '051',
    '053',
    '054',
    '065',
    '071',
    '072',
    '073',
    '074',
    '114',
    '115',
    '116',
    '122',
    '125',
    '131',
    '132',
    '134',
    '143',
    '145',
    '152',
    '155',
    '156',
    '162',
    '165',
    '172',
    '174',
    '205',
    '212',
    '223',
    '225',
    '226',
    '243',
    '244',
    '245',
    '246',
    '251',
    '252',
    '255',
    '261',
    '263',
    '265',
    '266',
    '271',
    '274',
    '306',
    '311',
    '315',
    '325',
    '331',
    '332',
    '343',
    '346',
    '351',
    '356',
    '364',
    '365',
    '371',
    '411',
    '412',
    '413',
    '423',
    '431',
    '432',
    '445',
    '446',
    '452',
    '454',
    '455',
    '462',
    '464',
    '465',
    '466',
    '503',
    '506',
    '516',
    '523',
    '526',
    '532',
    '546',
    '565',
    '606',
    '612',
    '624',
    '627',
    '631',
    '632',
    '654',
    '662',
    '664',
    '703',
    '712',
    '723',
    '731',
    '732',
    '734',
    '743',
    '754'
];
const TONE_SQUELCH_FREQUENCY_CODE = [
    '00',
    '99',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53'
];
const STEP_ADJUST_FREQUENCY = {
    '0HZ': { text: '0Hz', value: '000.00' },
    '50HZ': { text: '50Hz', value: '000.05' },
    '0.25KHZ': {text: '0.25kHz', value: '000.25' },
    '0.5KHZ': { text: '0.5kHz', value: '000.50' },
    '1KHZ': { text: '1kHz', value: '001.00' },
    '2.5KHZ': { text: '2.5kHz', value: '002.50' },
    '3.12KHZ': { text: '3.12kHz', value: '003.12' },
    '3.75KHZ': { text: '3.75kHz', value: '003.75' },
    '4.16KHZ': { text: '4.16kHz', value: '004.16' },
    '4.5KHZ': { text: '4.5kHz', value: '004.50' },
    '5KHZ': { text: '5kHz', value: '005.00' },
    '6.25KHZ': { text: '6.25kHz', value: '006.25' },
    '7.5KHZ': { text: '7.5kHz', value: '007.50' },
    '10KHZ': { text: '10kHz', value: '010.00' },
    '12.5KHZ': { text: '12.5kHz', value: '012.50' },
    '15KHZ': { text: '15kHz', value: '015.00' },
    '20KHZ': { text: '20kHz', value: '020.00' },
    '25KHZ': { text: '25kHz', value: '025.00' },
    '50KHZ': { text: '50kHz', value: '050.00' },
    '250KHZ': { text: '250kHz', value: '250.00'}
};
const FREQUENCY_STEP = {
    '10HZ': {
        text: '10Hz',
        value: '000.01',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ']
        ]
    },
    '50HZ': {
        text: '50Hz',
        value: '000.05',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ']
        ]
    },
    '0.1KHZ': {
        text: '0.1kHz',
        value: '000.10',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ']
        ]
    },
    '0.5KHZ': {
        text: '0.5kHz',
        value: '000.50',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ']
        ]
    },
    '1KHZ': {
        text: '1kHz',
        value: '001.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ']
        ]
    },
    '2KHZ': {
        text: '2kHz',
        value: '002.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ']
        ]
    },
    '5KHZ': {
        text: '5kHz',
        value: '005.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ']
        ]
    },
    '6.25KHZ': {
        text: '6.25kHz',
        value: '006.25',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ']
        ]
    },
    '7.5KHZ': {
        text: '7.5kHz',
        value: '007.50',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ']
        ]
    },
    '8.33KHZ': {
        text: '8.33kHz',
        value: '008.33',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ']
        ]
    },
    '9KHZ': {
        text: '9kHz',
        value: '009.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ']
        ]
    },
    '10KHZ': {
        text: '10kHz',
        value: '010.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ']
        ]
    },
    '12.5KHZ': {
        text: '12.5kHz',
        value: '012.50',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ']
        ]
    },
    '15KHZ': {
        text: '15kHz',
        value: '015.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ']
        ]
    },
    '20KHZ': {
        text: '20kHz',
        value: '020.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ']
        ]
    },
    '25KHZ': {
        text: '25kHz',
        value: '025.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ'],
            STEP_ADJUST_FREQUENCY['12.5KHZ']
        ]
    },
    '30KHZ': {
        text: '30kHz',
        value: '030.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ'],
            STEP_ADJUST_FREQUENCY['12.5KHZ'],
            STEP_ADJUST_FREQUENCY['15KHZ']
        ]
    },
    '50KHZ': {
        text: '50kHz',
        value: '050.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ'],
            STEP_ADJUST_FREQUENCY['12.5KHZ'],
            STEP_ADJUST_FREQUENCY['15KHZ'],
            STEP_ADJUST_FREQUENCY['20KHZ'],
            STEP_ADJUST_FREQUENCY['25KHZ']
        ]
    },
    '100KHZ': {
        text: '100kHz',
        value: '100.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ'],
            STEP_ADJUST_FREQUENCY['12.5KHZ'],
            STEP_ADJUST_FREQUENCY['15KHZ'],
            STEP_ADJUST_FREQUENCY['20KHZ'],
            STEP_ADJUST_FREQUENCY['25KHZ'],
            STEP_ADJUST_FREQUENCY['50KHZ']
        ]
    },
    '500KHZ': {
        text: '500kHz',
        value: '500.00',
        step_adjust_frequency: [
            STEP_ADJUST_FREQUENCY['0HZ'],
            STEP_ADJUST_FREQUENCY['50HZ'],
            STEP_ADJUST_FREQUENCY['0.25KHZ'],
            STEP_ADJUST_FREQUENCY['0.5KHZ'],
            STEP_ADJUST_FREQUENCY['1KHZ'],
            STEP_ADJUST_FREQUENCY['2.5KHZ'],
            STEP_ADJUST_FREQUENCY['3.12KHZ'],
            STEP_ADJUST_FREQUENCY['3.75KHZ'],
            STEP_ADJUST_FREQUENCY['4.16KHZ'],
            STEP_ADJUST_FREQUENCY['4.5KHZ'],
            STEP_ADJUST_FREQUENCY['5KHZ'],
            STEP_ADJUST_FREQUENCY['6.25KHZ'],
            STEP_ADJUST_FREQUENCY['7.5KHZ'],
            STEP_ADJUST_FREQUENCY['10KHZ'],
            STEP_ADJUST_FREQUENCY['12.5KHZ'],
            STEP_ADJUST_FREQUENCY['15KHZ'],
            STEP_ADJUST_FREQUENCY['20KHZ'],
            STEP_ADJUST_FREQUENCY['25KHZ'],
            STEP_ADJUST_FREQUENCY['50KHZ'],
            STEP_ADJUST_FREQUENCY['250KHZ']
        ]
    }
};

exports.setDefaultData = setDefaultData;
exports.SQUELCH_TYPE = SQUELCH_TYPE;
exports.TONE_SQUELCH_FREQUENCY_CODE = TONE_SQUELCH_FREQUENCY_CODE;
exports.DCS_CODE = DCS_CODE;
exports.FREQUENCY_STEP = FREQUENCY_STEP;
exports.STEP_ADJUST_FREQUENCY = STEP_ADJUST_FREQUENCY;
exports.MC = MC;
