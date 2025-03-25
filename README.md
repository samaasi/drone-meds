# Drone Meds

## A RESTful API service for managing a fleet of drones for medication delivery.

## Features
- Register a new drones to the fleet


## Technology Stack
- Node.js with TypeScript
- Express.js for the REST API
- Zod for validation
- Prisma ORM with SQLite database

## Base URL: `http://localhost:5005/api/v1`

## API Endpoints
- `POST /drones` - Register a new drone
- `GET /drones/available` - Get all available drones
- `POST /drones/:id/load` - Load a drone with medication
- `GET /drones/:id/battery` - Get the battery level of a drone
- `GET /drones/:id/medications` - Get the medications loaded on a drone

## Prerequisites
- Node.js (v16+)
- npm, pnpm or yarn
- Docker (optional for containerization)

## Running the application (Locally)
1. Clone the repository
    ```bash 
    git clone https://github.com/bsamaasi/drone-meds.git
    cd drone-meds
    ```

2. Install dependencies
    ```bash
    npm install
    ```
   
3. Set up the database
    ```bash
    npx prisma migrate dev or npm run prisma:migrate
    npm run prisma:seed
    ```
   
4. Start the application
    ```bash
    npm run dev
    ```
The application will be available at http://localhost:5005/api/v1

## Running the application (Docker: source)

1. Build the Docker image
   ```bash
   npm run docker:build
   ```
2. Run the Docker container
   ```bash
   npm run docker:run
   ```
Alternatively, you could pull from DockerHub:
## Running the application (Docker: prebuilt)
#### Using a Pre-built Image from Docker Hub
   ```bash
   docker pull bsamasi/drone-meds:latest
   docker run -p 5005:5005 bsamasi/drone-meds:latest
   ```

## Testing

Run the test suite:
   ```bash
   npm run test
   ```

## API Examples
## Base URL: `http://localhost:5005/api/v1`

### Register a new drone
```curl
POST /drones
Content-Type: application/json

{
  "model": "Lightweight",
  "weightLimit": 200,
  "batteryCapacity": 100,
  "state": "IDLE"
}
```

### Load a drone with medications
```curl
POST /drones/:id/load
Content-Type: application/json

{
  "medicationIds": [
    "cm8l9knmw0000w7sone638rji", 
    "cm8l9knnf0004w7so8arjorpm", 
    "cm8l9knnp0005w7sovushi80h"
  ]
}
```
> Where `:id` is the ID of the drone to load (string). 
> The medications must be available in the database.
> The drone must be in the `IDLE` state to be loaded.
> The sum of the weights of the medications should not exceed the weight limit of the drone.
> The battery level of the drone should be at least greater than 25% to be loaded.
> The drone will be in the `LOADED` state after loading.

### Get all available drones
```curl
GET /drones/available
```

### Get the battery level of a drone
```curl
GET /drones/:id/battery
```
> Where `:id` is the ID of the drone to get the battery level (string).
> The battery level is a percentage value.

### Get the medications loaded on a drone
```
GET /drones/:id/medications
```
> Where `:id` is the ID of the drone to get the medications loaded (string).
> The medications will be returned as an array of objects.
> Each object will contain the details of the medication.