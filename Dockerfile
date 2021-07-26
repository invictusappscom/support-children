FROM node

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN cd server && npm i
RUN cd client && npm i
RUN cd client && yarn build

CMD "npm" "start"