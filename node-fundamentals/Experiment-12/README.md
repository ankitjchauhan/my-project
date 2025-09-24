## Features

- **Seat Management**: 10 seats available for booking
- **Locking System**: Temporarily lock seats for 60 seconds
- **Auto-expiry**: Locked seats automatically become available after 1 minute if not confirmed
- **Concurrent Safety**: Handles multiple users trying to book the same seat
- **Clear Error Messages**: Informative responses for all edge cases

## API Endpoints

### GET /seats

Lists all seats and their current status.

**Response:**

```json
{
  "1": { "status": "available", "lockTimestamp": null, "timeoutId": null },
  "2": { "status": "locked", "lockTimestamp": 1632123456789, "timeoutId": {...} },
  "3": { "status": "booked", "lockTimestamp": null, "timeoutId": null }
  // ... more seats
}
```

### POST /lock/:id

Lock a seat temporarily (60 seconds).

**Parameters:**

- `id` - Seat ID (1-10)

**Success Response:**

```json
{
  "message": "Seat 5 locked successfully. Confirm within 1 minute."
}
```

**Error Response:**

```json
{
  "message": "Seat is already locked or booked"
}
```

### POST /confirm/:id

Confirm a previously locked seat.

**Parameters:**

- `id` - Seat ID (1-10)

**Success Response:**

```json
{
  "message": "Seat 5 booked successfully!"
}
```

**Error Response:**

```json
{
  "message": "Seat is not locked and cannot be booked"
}
```

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Access the API:**
   - Server runs on `http://localhost:3000`
   - Test endpoints using curl, Postman, or any HTTP client

## Testing Examples

### Using curl:

```bash
# Get all seats status
curl http://localhost:3000/seats

# Lock seat 5
curl -X POST http://localhost:3000/lock/5

# Confirm seat 5 (must be done within 60 seconds of locking)
curl -X POST http://localhost:3000/confirm/5

# Try to lock an already booked seat (will return error)
curl -X POST http://localhost:3000/lock/5
```

## Architecture

- **index.js**: Express server with API endpoints
- **seatManager.js**: Core logic for seat management, locking, and confirmation
- **In-memory storage**: Seats data stored in memory with timeout management

## Seat Statuses

- `available`: Seat can be locked
- `locked`: Seat is temporarily reserved (60-second timeout)
- `booked`: Seat is permanently booked

## Error Handling

The system handles various error scenarios:

- Invalid seat IDs
- Attempting to lock already locked/booked seats
- Attempting to confirm non-locked seats
- Automatic cleanup of expired locks
