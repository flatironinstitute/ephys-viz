#!/bin/bash                                                                                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                                                              
sudo docker run \                                                                                                                                                                                                                                                                                                             
    -p 8080:8080 \                                                                                                                                                                                                                                                                                                            
    -v /tmp/sha1-cache:/tmp/sha1-cache \                                                                                                                                                                                                                                                                                      
    magland/ephys_viz_server bash -c "PORT=8080 reactopya start-server"