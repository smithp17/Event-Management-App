# 📚 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

The token is automatically included when using the Clerk React SDK.

---

## 📅 Events API

### Get All Events (Public)

```http
GET /events
```

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference...",
    "imageUrl": "data:image/jpeg;base64,...",
    "eventDate": "2024-03-15T00:00:00.000Z",
    "eventEndDate": "2024-03-17T00:00:00.000Z",
    "eventTime": "09:00",
    "eventEndTime": "18:00",
    "location": "San Francisco, CA",
    "venue": "Moscone Center",
    "category": "Technology",
    "ticketPrice": 299,
    "capacity": 5000,
    "ticketsAvailable": 3500,
    "highlights": ["Keynote speakers", "Networking", "Workshops"],
    "status": "upcoming",
    "visibility": "public",
    "createdBy": "user_abc123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Featured Events (Public)

```http
GET /events/featured
```

Returns 8 random events for the homepage carousel.

**Response:** Array of event objects (same structure as above)

---

### Search Events (Public)

```http
GET /events/search?q=<query>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| q | string | Search query (searches title, description, location) |

**Example:**
```http
GET /events/search?q=music
```

**Response:** Array of matching event objects

---

### Get Single Event (Public)

```http
GET /events/:eventId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| eventId | string | MongoDB ObjectId |

**Response:**
```json
{
  "_id": "65abc123...",
  "title": "Tech Conference 2024",
  // ... full event object
  "organizer": {
    "_id": "...",
    "fullName": "John Doe",
    "imageUrl": "https://...",
    "email": "john@example.com"
  }
}
```

---

### Get User's Created Events 🔒

```http
GET /events/user/my-events
```

**Auth Required:** Yes

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "title": "My Event",
    // ... event object
    "ticketsSold": 150,
    "revenue": 4500
  }
]
```

---

### Get User's Tickets 🔒

```http
GET /events/user/my-tickets
```

**Auth Required:** Yes

**Response:**
```json
[
  {
    "_id": "ticket123...",
    "eventId": {
      "_id": "event123...",
      "title": "Tech Conference 2024",
      "eventDate": "2024-03-15T00:00:00.000Z",
      "eventTime": "09:00",
      "venue": "Moscone Center",
      "imageUrl": "..."
    },
    "quantity": 2,
    "totalPrice": 598,
    "ticketNumber": "TKT-1234567890-ABC123",
    "bookingStatus": "confirmed",
    "bookedAt": "2024-01-20T15:30:00.000Z"
  }
]
```

---

### Create Event 🔒

```http
POST /events
```

**Auth Required:** Yes

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**
```json
{
  "title": "My New Event",
  "description": "Event description...",
  "eventDate": "2024-06-15",
  "eventEndDate": "2024-06-16",
  "eventTime": "18:00",
  "eventEndTime": "23:00",
  "location": "New York, NY",
  "venue": "Madison Square Garden",
  "category": "Music",
  "ticketPrice": 75,
  "capacity": 20000,
  "highlights": ["Live performance", "Meet & greet"],
  "image": "<base64_encoded_image>"
}
```

**Response:**
```json
{
  "_id": "new_event_id",
  "title": "My New Event",
  // ... full event object
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 201 | Event created successfully |
| 400 | Validation error |
| 401 | Unauthorized |
| 500 | Server error |

---

### Update Event 🔒

```http
PUT /events/:eventId
```

**Auth Required:** Yes (must be owner or admin)

**Request Body:** Same as create (partial updates allowed)

**Response:** Updated event object

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Event updated successfully |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (not owner or admin) |
| 404 | Event not found |

---

### Delete Event 🔒

```http
DELETE /events/:eventId
```

**Auth Required:** Yes (must be owner or admin)

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Event deleted |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Event not found |

---

### Book Tickets 🔒

```http
POST /events/:eventId/book
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Tickets booked successfully",
  "ticket": {
    "_id": "ticket_id",
    "eventId": "event_id",
    "userId": "user_id",
    "quantity": 2,
    "totalPrice": 598,
    "ticketNumber": "TKT-1234567890-ABC123",
    "bookingStatus": "confirmed",
    "bookedAt": "2024-01-20T15:30:00.000Z"
  },
  "event": {
    // Updated event with new ticketsAvailable
  }
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 201 | Tickets booked |
| 400 | Invalid quantity or not enough tickets |
| 401 | Unauthorized |
| 403 | Cannot book own event |
| 404 | Event not found |

---

### Cancel Ticket 🔒

```http
POST /events/tickets/:ticketId/cancel
```

**Auth Required:** Yes (must be ticket owner)

**Response:**
```json
{
  "message": "Ticket cancelled successfully",
  "ticket": {
    // Updated ticket with bookingStatus: "cancelled"
  }
}
```

---

## 🛡️ Admin API

### Get Admin Statistics 🔒👑

```http
GET /events/admin/stats
```

**Auth Required:** Yes (admin only)

**Response:**
```json
{
  "totalEvents": 150,
  "totalTicketsSold": 5000,
  "totalRevenue": 125000,
  "activeUsers": 1200
}
```

---

### Get All Events (Admin) 🔒👑

```http
GET /events/admin/all
```

**Auth Required:** Yes (admin only)

Returns all events including drafts and cancelled events.

**Response:** Array of all event objects

---

## 🔐 Auth API

### Check Admin Status 🔒

```http
GET /auth/check-admin
```

**Auth Required:** Yes

**Response:**
```json
{
  "isAdmin": true,
  "userId": "user_abc123",
  "email": "admin@example.com",
  "adminEmail": "admin@example.com"
}
```

---

## 👥 Users API

### Get All Users 🔒

```http
GET /users
```

**Auth Required:** Yes

Returns all users for chat functionality.

**Response:**
```json
[
  {
    "_id": "user_doc_id",
    "clerkId": "user_abc123",
    "fullName": "John Doe",
    "imageUrl": "https://...",
    "email": "john@example.com"
  }
]
```

---

## 💬 Messages API

### Get Messages with User 🔒

```http
GET /messages/:userId
```

**Auth Required:** Yes

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| userId | string | Clerk user ID of the other user |

**Response:**
```json
[
  {
    "_id": "message_id",
    "senderId": "user_abc123",
    "receiverId": "user_xyz789",
    "content": "Hello!",
    "createdAt": "2024-01-20T15:30:00.000Z"
  }
]
```

---

### Send Message 🔒

```http
POST /messages/send
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "receiverId": "user_xyz789",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "_id": "new_message_id",
  "senderId": "user_abc123",
  "receiverId": "user_xyz789",
  "content": "Hello, how are you?",
  "createdAt": "2024-01-20T15:35:00.000Z"
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { userId: 'user_abc123' }
});
```

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `user_connected` | Server → Client | `{ userId: string }` | User came online |
| `user_disconnected` | Server → Client | `{ userId: string }` | User went offline |
| `send_message` | Client → Server | `{ receiverId, content }` | Send a message |
| `receive_message` | Server → Client | `{ senderId, content, createdAt }` | Receive a message |
| `get_online_users` | Server → Client | `string[]` | List of online user IDs |

---

## 📊 Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not allowed) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📝 Example Requests

### Using cURL

```bash
# Get all events
curl http://localhost:5000/api/events

# Search events
curl "http://localhost:5000/api/events/search?q=music"

# Create event (authenticated)
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "description": "Description",
    "eventDate": "2024-06-15",
    "eventTime": "18:00",
    "location": "NYC",
    "category": "Music",
    "ticketPrice": 50,
    "capacity": 100
  }'

# Book tickets
curl -X POST http://localhost:5000/api/events/EVENT_ID/book \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### Using Axios (Frontend)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = getClerkToken(); // Get from Clerk
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get events
const events = await api.get('/events');

// Create event
const newEvent = await api.post('/events', eventData);

// Book tickets
const ticket = await api.post(`/events/${eventId}/book`, { quantity: 2 });
```