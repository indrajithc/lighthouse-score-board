FROM node:16-bullseye-slim

# Set variable so puppeteer will not try to download chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install utilities
RUN apt-get update --fix-missing && apt-get -y upgrade && apt-get install -y git wget gnupg && apt-get clean

# Install latest chrome stable package.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get clean

# Install Lighthouse CI
# RUN npm install -g @lhci/cli@0.10.0
RUN npm install -g lighthouse

# Install puppeteer
# RUN npm install -g puppeteer

# # Setup a user to avoid doing everything as root
# RUN groupadd --system lhci && \
#   useradd --system --create-home --gid lhci lhci && \
#   mkdir --parents /home/lhci/reports && \
#   chown --recursive lhci:lhci /home/lhci

# RUN cd /home/lhci/reports && npm link puppeteer

# USER lhci
# WORKDIR /home/lhci/reports

# CMD [ "lhci", "--help" ]

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
# RUN npm run build --production

# Add support for https on wget

EXPOSE 3893
CMD ["npm", "start"]