FROM node:20.11.0-alpine 

# Make directories for our app, and copy npm package/angular information in
RUN mkdir -p /usr/src/app/
COPY package*.json /usr/src/app/
COPY angular.json /usr/src/app/
COPY tsconfig*.json /usr/src/app/
COPY tailwind.config.js /usr/src/app/

# Copy secrets into the container
RUN mkdir -p /root/secrets
RUN --mount=type=secret,id=ENVIRONMENT_SECRETS \
    cat /run/secrets/ENVIRONMENT_SECRETS | base64 -d > /root/secrets/secrets.env

# Install required npm modules
COPY tsconfig*.json /usr/src/app/

# Copy secrets into the container
RUN mkdir -p /root/secrets
RUN --mount=type=secret,id=ENVIRONMENT_SECRETS \
    cat /run/secrets/ENVIRONMENT_SECRETS | base64 -d > /root/secrets/secrets.env

# Install required npm modules
RUN cd /usr/src/app && npm install

# Update the PATH to include ng from the install
ENV PATH="${PATH}:/usr/src/app/node_modules/.bin/"

# Copy the source of our application into the container
RUN mkdir -p /usr/src/app/src
COPY src /usr/src/app/src/

# The dist directory is our compiled code

# The dist directory is our compiled code
RUN mkdir -p /usr/src/app/dist

# Set default run environment, expose services
WORKDIR /usr/src/app
EXPOSE 4200/tcp

CMD [ "set -a && source /root/secrets/secrets.env && set +a && ng serve --host 0.0.0.0 --port 4200" ]
ENTRYPOINT [ "/bin/sh", "-c" ]
