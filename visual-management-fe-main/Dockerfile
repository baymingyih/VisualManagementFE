FROM node:16-alpine

WORKDIR /app
COPY . .

# ARG BASE_URL
ENV NEXT_PUBLIC_BASE_URL=

RUN npm install
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
