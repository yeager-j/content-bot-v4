#!/usr/bin/env bash
tmux new-session -d -s bot "npm start"
tmux kill-session -t update