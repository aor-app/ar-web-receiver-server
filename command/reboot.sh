#!/bin/bash
echo "reboot"
forever stop ar-memory-server
sudo shutdown -r now
