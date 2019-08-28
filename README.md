# AR-WEB-RECEIVER-SERVER develop-dv10support v1908  

AR-WEB-RECEIVER-SERVER is the Web API of AR-DV1 TAI Web Adapter in VFO mode.  
You can control AR-DV1 and listen to the received audio, through a web app.  

## Installation  
 - Install on /home/aor/ar-web-receiver-server of your web adapter or on any web server.  

## Version history 
 - Add "SelectSquelch" and "NoiseSquelti" API for SQ and NQ commands. The former selects the squelch format and the latter sets NQ for AR-DV10 that does not work with LQ.
 - Add "ttcslot" API for TS command, that is set or get the slot number of receiving on T-TC mode for AR-DV1 FW v1903A or later.
