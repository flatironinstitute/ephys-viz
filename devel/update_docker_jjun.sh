#!/bin/bash

docker build -f Dockerfile.server -t jamesjun/ephys_viz_server .
docker push jamesjun/ephys_viz_server