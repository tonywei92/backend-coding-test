# Rides API

<h1 align="center">
  <br>
   <img src="https://openclipart.org/image/400px/svg_to_png/323107/ridesapilogo-0.png&disposition=attachment" alt="Logo Rides API" title="Logo Rides API" />
  <br>
</h1>
<p align="center">
<img src="https://img.shields.io/badge/Node-%3E8.6%20and%20%3C%3D%2010-yellow"/>
<img src="https://travis-ci.com/tonywei92/backend-coding-test.svg?branch=master">
</p>
<p>This repository contains the RidesAPI source code. Rides API is a API service to manage online-rides service records. Powerful and secure to use.</p>

## Installation

Ensure `node (>8.6 and <= 10)` and `npm` are installed

```sh
$ npm install
```

## Running the API Server

```sh
$ npm start
```

## Endpoints:

| Method | Endpoint      | Summary                                     |
| ------ | ------------- | ------------------------------------------- |
| GET    | /health       | Check server health                         |
| POST   | /rides        | Create a ride record                        |
| GET    | /rides?page=1 | Get list of rides record, default page is 1 |
| GET    | /rides/:id    | Get ride record based on ID                 |

## Documentation

You can read full [documentation here](docs/README.md)

Or you can start the documentation server:

```sh
$ npm run docs
```

## Testing

```sh
$ npm test
```

## Load testing

```sh
$ npm run test:load
```
