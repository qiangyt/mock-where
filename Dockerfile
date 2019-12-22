FROM node:7.10-stretch

LABEL maintainer="qiangyt@wxcount.com"

WORKDIR /opt/mock-where

COPY config ./config
EXPOSE 7007 8000

COPY .babelrc .eslintignore .eslintrc.js .istanbul.yml ./

COPY src ./src

CMD node src/App.js
#CMD node --inspect=0.0.0.0:9029 src/App.js


