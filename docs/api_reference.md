# API Reference

List of endpoints:

| Method | Endpoint                        | Summary                     |
| ------ | ------------------------------- | --------------------------- |
| GET    | [/health](#check-server-health) | Check server health         |
| POST   | [/rides](#create-a-ride-record) | Create a ride record        |
| GET    | [/rides](#get-all-rides)        | Get list of rides record    |
| GET    | [/rides/:id](#get-ride-by-id)   | Get ride record based on ID |

## Check server health

Check if server is up, curl example:

```sh
$ curl -XGET 'http://localhost:8010/health'
```

Response example:

```
Healthy
```

## Create a ride record

```
POST /rides
```

| Attribute        | Type   | Required | Description          |
| ---------------- | ------ | -------- | -------------------- |
| `start_lat`      | float  | yes      | Ride start latitude  |
| `start_long`     | float  | yes      | Ride start longitude |
| `end_lat`        | float  | yes      | Ride end latitude    |
| `end_long`       | float  | yes      | Ride end longitude   |
| `rider_name`     | string | yes      | Rider name           |
| `driver_name`    | string | yes      | Driver name          |
| `driver_vehicle` | string | yes      | Driver vehicle type  |

```sh
$ curl -XPOST -H "Content-type: application/json" -d '{
	"start_lat": 0,
	"start_long": 0,
	"end_lat": 0,
	"end_long": 0,
	"rider_name": "John Doe",
	"driver_name": "Tony",
	"driver_vehicle": "Honda X"
}' 'http://localhost:8010/rides'
```

Response example:

```json
[
  {
    "rideID": 1,
    "startLat": 0,
    "startLong": 0,
    "endLat": 0,
    "endLong": 0,
    "riderName": "John Doe",
    "driverName": "Tony",
    "driverVehicle": "Honda X",
    "created": "2020-09-03 10:07:34"
  }
]
```

## Get all rides

```
GET /rides
```

```sh
$ curl -XGET 'http://localhost:8010/rides'
```

Response example:

```json
[
  {
    "rideID": 1,
    "startLat": 0,
    "startLong": 0,
    "endLat": 0,
    "endLong": 0,
    "riderName": "John Doe",
    "driverName": "Tony",
    "driverVehicle": "Honda X",
    "created": "2020-09-03 10:07:34"
  }
]
```

## Get ride by ID

```
GET /rides/:id
```

```sh
$ curl -XGET 'http://localhost:8010/rides/1'
```

Response example:

```json
[
  {
    "rideID": 1,
    "startLat": 0,
    "startLong": 0,
    "endLat": 0,
    "endLong": 0,
    "riderName": "John Doe",
    "driverName": "Tony",
    "driverVehicle": "Honda X",
    "created": "2020-09-03 10:07:34"
  }
]
```
