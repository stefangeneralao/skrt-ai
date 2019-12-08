#!/usr/bin/env bash
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root" 
  exit 1
fi
yarn
docker build -t skrt_human .
docker stop skrt_human || true
docker rm skrt_human || true
docker run -p 3005:3005 -d --name skrt_human skrt_human