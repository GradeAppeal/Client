FROM node:20.11.0-alpine 

RUN mkdir -p /usr/src/app/
COPY package*.json /usr/src/app/
COPY angular.json /usr/src/app/

#/usr/src/app
RUN cd /usr/src/app && npm install

RUN mkdir -p /usr/src/app/src
COPY src /usr/src/app/src/
RUN mkdir -p /usr/src/app/dist
COPY dist /usr/src/app/dist/

# comment
WORKDIR /usr/src/app
EXPOSE 4200/tcp
