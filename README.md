# 🎉 EventBrite Clone
App video- https://youtu.be/fuQ44dA1_iM
A modern, full-stack event management platform built with React, Node.js, MongoDB, and Clerk authentication. Create, discover, and book tickets to amazing events.

![EventBrite Clone](https://img.shields.io/badge/version-1.0.0-purple)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 📸 Screenshots

<div align="center">
  <img src="screenshots/home.png" alt="Home Page" width="80%"/>
  <p><em>Modern, colorful homepage with animated hero section</em></p>
</div>

## ✨ Features

### 🎫 Event Management
- **Create Events** - Rich event creation with images, multi-day support, highlights
- **Edit Events** - Full editing capabilities for event organizers
- **Browse Events** - Search, filter by category, sort by date/price/popularity
- **Event Details** - Comprehensive event pages with booking functionality

### 🎟️ Ticketing System
- **Book Tickets** - Secure ticket booking with quantity selection
- **My Tickets** - View upcoming and past tickets
- **QR Codes** - Ticket QR codes for event check-in
- **Cancel Tickets** - Self-service ticket cancellation

### 👥 User Features
- **Clerk Authentication** - Secure sign-in/sign-up with Google, email, etc.
- **User Profiles** - Personalized dashboard and ticket management
- **Real-time Chat** - Message event organizers and attendees
- **Online Status** - See who's online in real-time

### 🛡️ Admin Dashboard
- **Event Management** - View, edit, delete any event
- **Statistics** - Total events, tickets sold, revenue tracking
- **User Overview** - Monitor platform activity

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Zustand | State Management |
| React Router v6 | Routing |
| Clerk React | Authentication |
| Axios | HTTP Client |
| Socket.io Client | Real-time Communication |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Clerk SDK | Authentication |
| Socket.io | Real-time Events |
| JWT | Token Handling |

## 📁 Project Structure

```
eventbrite-clone/
├── frontend/                    # React frontend application
│   ├── public/
│   │   └── images/             # Static images (hero backgrounds)
│   │       ├── concert.jpg
│   │       ├── office.jpg
│   │       └── party.jpg
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── home/
│   │   │   │   └── HomePage.tsx
│   │   │   ├── browse/
│   │   │   │   └── BrowsePage.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPage.tsx
│   │   │   │   └── components/
│   │   │   │       ├── UsersList.tsx
│   │   │   │       ├── ChatHeader.tsx
│   │   │   │       └── MessageInput.tsx
│   │   │   ├── admin/
│   │   │   │   └── AdminPage.tsx
│   │   │   ├── my-tickets/
│   │   │   │   └── MyTicketsPage.tsx
│   │   │   ├── MyEventsPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   └── EditEventPage.tsx
│   │   ├── stores/             # Zustand state stores
│   │   │   ├── useEventStore.ts
│   │   │   ├── useAuthStore.ts
│   │   │   └── useChatStore.ts
│   │   ├── providers/          # Context providers
│   │   │   └── AuthProvider.tsx
│   │   ├── lib/               # Utilities
│   │   │   ├── axios.ts       # Axios instance
│   │   │   └── utils.ts       # Helper functions
│   │   ├── App.tsx            # Main app with routes
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── event.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── message.controller.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── event.model.js
│   │   │   ├── ticket.model.js
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/             # API routes
│   │   │   ├── event.route.js
│   │   │   ├── auth.route.js
│   │   │   ├── user.route.js
│   │   │   └── message.route.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── clerk.middleware.js
│   │   │   └── auth.middleware.js
│   │   ├── lib/               # Utilities
│   │   │   ├── db.js          # Database connection
│   │   │   └── socket.js      # Socket.io setup
│   │   └── index.js           # Server entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
└── README.md
```

## 🗄️ Database Schema

### Event Model
```javascript
{
  title: String,              // Event title
  description: String,        // Rich description
  imageUrl: String,           // Base64 or URL
  eventDate: Date,            // Start date
  eventEndDate: Date,         // End date (optional)
  eventTime: String,          // Start time (HH:mm)
  eventEndTime: String,       // End time (optional)
  location: String,           // City/Region
  venue: String,              // Specific venue
  category: String,           // Event category
  ticketPrice: Number,        // Price per ticket
  capacity: Number,           // Total capacity
  ticketsAvailable: Number,   // Remaining tickets
  highlights: [String],       // Event highlights
  status: String,             // upcoming/ongoing/completed/cancelled
  visibility: String,         // public/private
  createdBy: String,          // Clerk user ID
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Model
```javascript
{
  eventId: ObjectId,          // Reference to Event
  userId: String,             // Clerk user ID
  quantity: Number,           // Number of tickets
  totalPrice: Number,         // Total amount paid
  ticketNumber: String,       // Unique ticket ID
  bookingStatus: String,      // confirmed/cancelled
  bookedAt: Date,
  cancelledAt: Date
}
```

### User Model
```javascript
{
  clerkId: String,            // Clerk user ID
  fullName: String,
  imageUrl: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  senderId: String,           // Clerk user ID
  receiverId: String,         // Clerk user ID
  content: String,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Events API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | ❌ | Get all public events |
| GET | `/api/events/featured` | ❌ | Get featured events |
| GET | `/api/events/search?q=` | ❌ | Search events |
| GET | `/api/events/:eventId` | ❌ | Get single event |
| GET | `/api/events/user/my-events` | ✅ | Get user's created events |
| GET | `/api/events/user/my-tickets` | ✅ | Get user's booked tickets |
| POST | `/api/events` | ✅ | Create new event |
| PUT | `/api/events/:eventId` | ✅ | Update event |
| DELETE | `/api/events/:eventId` | ✅ | Delete event |
| POST | `/api/events/:eventId/book` | ✅ | Book tickets |
| POST | `/api/events/tickets/:ticketId/cancel` | ✅ | Cancel ticket |

### Admin API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/admin/stats` | ✅ Admin | Get platform statistics |
| GET | `/api/events/admin/all` | ✅ Admin | Get all events (including drafts) |

### Auth API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/check-admin` | ✅ | Check if user is admin |
| POST | `/api/auth/callback` | ✅ | Clerk webhook callback |

### Users API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | ✅ | Get all users for chat |

### Messages API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/:userId` | ✅ | Get messages with user |
| POST | `/api/messages/send` | ✅ | Send message |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Clerk account (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eventbrite-clone.git
cd eventbrite-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventbrite

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Configuration
ADMIN_EMAIL=your-admin-email@example.com
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:5000
```

Add hero images:

```bash
mkdir -p public/images
# Add your images:
# - public/images/concert.jpg
# - public/images/office.jpg  
# - public/images/party.jpg
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    Clerk    │────▶│   Backend   │
│  (React)    │◀────│   (Auth)    │◀────│  (Node.js)  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │  1. Sign In        │                   │
      │───────────────────▶│                   │
      │                    │                   │
      │  2. JWT Token      │                   │
      │◀───────────────────│                   │
      │                    │                   │
      │  3. API Request with Bearer Token      │
      │───────────────────────────────────────▶│
      │                    │                   │
      │                    │  4. Verify Token  │
      │                    │◀──────────────────│
      │                    │                   │
      │                    │  5. User Info     │
      │                    │──────────────────▶│
      │                    │                   │
      │  6. Response                           │
      │◀───────────────────────────────────────│
```

## 🎨 UI/UX Features

### Color Scheme
- **Primary**: Purple → Pink gradient (`from-purple-500 to-pink-500`)
- **Secondary**: Blue → Cyan gradient (`from-blue-500 to-cyan-500`)
- **Accent**: Orange → Yellow gradient (`from-orange-500 to-yellow-500`)
- **Admin**: Amber → Orange gradient (`from-amber-500 to-orange-500`)
- **Background**: White/Zinc-50
- **Text**: Zinc-800 (dark), Zinc-500 (muted)

### Animations
- Hero background slideshow (5-second intervals)
- Card hover effects (lift + shadow)
- Button scale on hover
- Animated counters on scroll
- Staggered card fade-in
- Loading spinners

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Grid layouts: 1 → 2 → 3 → 4 columns
- Touch-friendly interactions

## 📱 Pages Overview

### 1. Home Page (`/`)
- Animated hero with sliding backgrounds
- Statistics section with counters
- Category quick links
- Featured events carousel
- All events grid

### 2. Browse Page (`/browse`)
- Search bar
- Category filter dropdown
- Sort options (date, price, popularity)
- Event cards grid
- Empty state handling

### 3. Event Detail Page (`/events/:eventId`)
- Large hero image
- Event information (date, time, venue)
- Highlights list
- Ticket booking form
- Organizer info with message button
- Related events

### 4. My Events Page (`/my-events`)
- Create event dialog
- User's events list
- Event statistics (tickets sold, revenue)
- Edit/delete actions

### 5. My Tickets Page (`/my-tickets`)
- Upcoming tickets tab
- Past tickets tab
- Ticket cards with QR code
- Cancel ticket functionality

### 6. Chat Page (`/chat`)
- Users list with online status
- Real-time messaging
- Message input with emoji support
- Typing indicators

### 7. Admin Dashboard (`/admin`)
- Statistics cards
- All events table
- Event management actions
- Revenue tracking

## 🔧 Configuration

### Admin Access
To grant admin access, set the `ADMIN_EMAIL` environment variable to match the email used for Clerk sign-in:

```env
ADMIN_EMAIL=admin@yourdomain.com
```

### Categories
Default categories (can be modified in code):
- Music
- Sports
- Arts
- Food & Drink
- Business
- Technology
- Health
- Community
- Film
- Fashion
- Education
- Travel
- Charity
- Other

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User can sign up/sign in
- [ ] Events display on homepage (logged out)
- [ ] User can create an event
- [ ] User can edit their event
- [ ] User can book tickets
- [ ] User can view their tickets
- [ ] User can cancel tickets
- [ ] Admin can access dashboard
- [ ] Admin can delete any event
- [ ] Real-time chat works
- [ ] Search and filters work

## 🚢 Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set environment variables
4. Deploy

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
ADMIN_EMAIL=admin@yourdomain.com

# Frontend
VITE_API_URL=https://your-backend.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) - Authentication
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons
- [Zustand](https://zustand-demo.pmnd.rs) - State Management

---

<div align="center">
  <p>Built with ❤️ by Smit Patne</p>
  <p>
    <a href="https://github.com/smithp17">GitHub</a> •
    <a href="https://www.linkedin.com/in/smit-patne/">LinkedIn</a> •
    
  </p>
</div>

