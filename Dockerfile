FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y curl

# RUN curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.13.0/cloud-sql-proxy.linux.amd64 \
#     && chmod +x cloud-sql-proxy \
#     && mv cloud-sql-proxy /usr/local/bin/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

# CMD /usr/local/bin/cloud-sql-proxy cloudfinal-443701:us-central1:cloudfinaldb & npm start
