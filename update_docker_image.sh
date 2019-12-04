#!/usr/bin/env bash
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root" 
  exit 1
fi
yarn
docker build -t skrt_ai .
docker stop skrt_ai || true
docker rm skrt_ai || true
docker run -p 3004:3004 -d --name skrt_ai skrt_ai