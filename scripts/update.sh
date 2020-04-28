#!/usr/bin/env bash
tmux new-session -d -s update "sh scripts/stop.sh && git pull origin master && sh scripts/start.sh"