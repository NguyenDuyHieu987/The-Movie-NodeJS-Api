FROM node:18.15.0 AS prod-build
ENV PATH /Sample/node_modules/.bin:$PATH 

WORKDIR /Sample 

COPY . ./ 

RUN npm ci –production 

RUN npm install && npm run build
COPY api/server.js ./api/
ENV NODE_ENV production 

EXPOSE 5000

CMD ["node", "build/index.js"]