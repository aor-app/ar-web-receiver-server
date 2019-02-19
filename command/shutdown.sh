#!/bin/bash
echo "shutdown"
forever stop ar-memory-server
sudo shutdown -h now
