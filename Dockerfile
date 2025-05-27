FROM node:22

RUN mkdir /app
RUN useradd vaca-daemon
RUN chown vaca-daemon /app
WORKDIR /app
COPY . .
RUN npm i
EXPOSE 3000
USER vaca-daemon

CMD [ "npm", "start" ]