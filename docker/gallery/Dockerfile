FROM ubuntu:18.04

#########################################
### Python                                                               
RUN apt-get update && apt-get -y install git wget build-essential
RUN apt-get install -y python3 python3-pip
RUN ln -s python3 /usr/bin/python
RUN ln -s pip3 /usr/bin/pip
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3-tk

#########################################
### Node and yarn
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get update && apt-get install -y nodejs
RUN npm install -g yarn

#########################################
### Numpy
RUN pip install numpy

#########################################
### Reactopya
RUN pip install reactopya

#########################################
### Make sure we have python3 and a working locale
RUN rm /usr/bin/python && ln -s python3 /usr/bin/python && rm /usr/bin/pip && ln -s pip3 /usr/bin/pip
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN apt-get install -y locales && locale-gen en_US.UTF-8

#########################################
### Install this project
RUN mkdir /src
COPY package.json /src/package.json
COPY reactopya.config.json /src/reactopya.config.json
COPY widgets /src/widgets
WORKDIR /src
RUN reactopya install-jupyter
RUN reactopya install-server

#########################################
### Copy in the gallery script
COPY examples/gallery/gallery.py /gallery.py

EXPOSE 6065
CMD [ "/gallery.py", "--port",  "6065" ]
