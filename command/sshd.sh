#!/bin/bash
echo "sshd $1"
if [ "$1" = "start" ]; then
    echo "start"
    sudo service ssh start
    sudo systemctl enable ssh
elif [ "$1" = "stop" ]; then
    echo "stop"
    sudo service ssh stop
    sudo systemctl disable ssh
else
    echo "error"
fi
