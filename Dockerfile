FROM ubuntu:latest

RUN apt-get update; apt-get clean

# Add a user for running applications.
RUN useradd apps
RUN mkdir -p /home/apps && chown apps:apps /home/apps

# Install x11vnc.
RUN apt-get install -y x11vnc 

# Install xvfb.
RUN apt-get install -y xvfb

# Install fluxbox.
RUN apt-get install -y fluxbox

# Install wget.
RUN apt-get install -y wget

# Install wmctrl.
RUN apt-get install -y wmctrl


RUN apt-get update && apt-get install -y gnupg2

# Set the Chrome repo.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list

RUN apt-get install -y git-core curl build-essential openssl libssl-dev  

# update and install all required packages (no sudo required as root)
# https://gist.github.com/isaacs/579814#file-only-git-all-the-way-sh
RUN apt-get update -yq && apt-get upgrade -yq && \
apt-get install -yq curl git nano

RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
 apt-get install -y nodejs

 # Install Chrome.
RUN apt-get clean
 
 
# WORKDIR /app
# COPY package*.json ./

# RUN npm install

# COPY . .
# # RUN npm run build --production

# # Add support for https on wget

# EXPOSE 3893
# CMD ["npm", "start"]
COPY bootstrap.sh /

CMD '/bootstrap.sh'