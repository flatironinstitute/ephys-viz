#!/bin/bash

docker build -f Dockerfile.server -t magland/ephys_viz_server .
docker push magland/ephys_viz_server