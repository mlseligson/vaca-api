FROM node:22
WORKDIR /app
COPY ../ .
RUN npm i
EXPOSE 3000
RUN useradd vaca-daemon
USER vaca-daemon
CMD [ "npm", "start" ]