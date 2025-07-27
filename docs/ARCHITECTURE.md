# homeTeam - Sistem Mimarisi Dokümantasyonu

## 🏗️ Genel Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────┬───────────────────────────────────────┤
│   React Native App     │        Web Dashboard (Future)        │
│   • Redux Toolkit      │        • React.js                    │
│   • React Navigation   │        • Admin Panel                 │
│   • Socket.IO Client   │        • Analytics                   │
└─────────────────────────┴───────────────────────────────────────┘
                                    │
                              HTTP/HTTPS + WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│   NestJS Backend Server (Port: 3001)                          │
│   • Global Exception Filter                                    │
│   • CORS Configuration                                         │
│   • Request/Response Interceptors                              │
│   • Rate Limiting (Future)                                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   AUTH MIDDLEWARE   │  │   BUSINESS LOGIC    │  │   WEBSOCKET LAYER   │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ • JWT Strategy      │  │ • Auth Module       │  │ • Socket.IO Gateway │
│ • Role Guards       │  │ • Users Module      │  │ • Real-time Events  │
│ • Permission Check  │  │ • Groups Module     │  │ • Room Management   │
└─────────────────────┘  │ • Tasks Module      │  │ • User Presence     │
                         │ • Notifications     │  └─────────────────────┘
                         │ • Music Integration │
                         │ • Error Logging     │
                         └─────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                               │
├─────────────────────────┬───────────────────┬───────────────────┤
│     MongoDB             │      Redis        │   External APIs   │
│   (Port: 27018)         │   (Port: 6380)    │                   │
├─────────────────────────┼───────────────────┼───────────────────┤
│ • users                 │ • Sessions (*)    │ • Spotify API     │
│ • groups                │ • Cache (*)       │ • YouTube API     │
│ • tasks                 │ • Rate Limits (*) │ • Google OAuth    │
│ • notifications         │                   │ • Facebook OAuth  │
│ • musicintegrations     │                   │                   │
│ • errorlogs             │                   │                   │
└─────────────────────────┴───────────────────┴───────────────────┘

(*) Henüz aktif kullanılmıyor ama altyapı hazır
```

## 🔐 Authentication & Authorization Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │    │   Guards    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
   1.  │──Login Request──▶│                  │                  │
       │                  │                  │                  │
   2.  │                  │──Find User──────▶│                  │
       │                  │◀─User Data───────│                  │
       │                  │                  │                  │
   3.  │                  │──Password Check──│                  │
       │                  │                  │                  │
   4.  │◀─JWT Token───────│                  │                  │
       │                  │                  │                  │
   5.  │──API Request─────▶│                  │                  │
       │  (with Bearer)    │                  │                  │
       │                  │                  │                  │
   6.  │                  │──Verify Token───▶│                  │
       │                  │◀─Token Valid─────│                  │
       │                  │                  │                  │
   7.  │                  │──Role Check─────▶│                  │
       │                  │◀─Permissions─────│                  │
       │                  │                  │                  │
   8.  │◀─Response────────│                  │                  │
```

## 📊 Database Schema Relationships

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Users       │         │     Groups      │         │     Tasks       │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ _id (ObjectId)  │◀────────│ owner           │         │ _id (ObjectId)  │
│ firstName       │         │ members[]       │◀────────│ groupId         │
│ lastName        │         │ • userId        │         │ title           │
│ email           │         │ • role          │         │ description     │
│ role            │         │ • permissions   │         │ status          │
│ groups[]        │────────▶│ settings        │         │ priority        │
│ notificationPref│         │ stats           │         │ assignedTo      │◀───┐
│ lastLoginAt     │         │ subscription    │         │ createdBy       │◀───┤
│ createdAt       │         │ activityLog[]   │         │ dueDate         │    │
│ updatedAt       │         │ createdAt       │         │ comments[]      │    │
└─────────────────┘         │ updatedAt       │         │ activityLog[]   │    │
                            └─────────────────┘         │ createdAt       │    │
                                                        │ updatedAt       │    │
                                                        └─────────────────┘    │
                                                                              │
┌─────────────────┐         ┌─────────────────┐                              │
│  Notifications  │         │ Music Integrations│                             │
├─────────────────┤         ├─────────────────┤                              │
│ _id (ObjectId)  │         │ _id (ObjectId)  │                              │
│ userId          │─────────│ userId          │──────────────────────────────┘
│ title           │         │ provider        │
│ message         │         │ accessToken     │
│ type            │         │ refreshToken    │
│ isRead          │         │ playlists[]     │
│ priority        │         │ preferences     │
│ metadata        │         │ lastSyncAt      │
│ createdAt       │         │ createdAt       │
│ readAt          │         │ updatedAt       │
└─────────────────┘         └─────────────────┘
```

## 🔄 Real-time Communication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  WebSocket  │    │   Server    │    │  Database   │
│             │    │   Gateway   │    │   Events    │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
   1.  │──Connect─────────▶│                  │                  │
       │                  │                  │                  │
   2.  │                  │──Authenticate───▶│                  │
       │                  │◀─User Valid──────│                  │
       │                  │                  │                  │
   3.  │                  │──Join Rooms──────│                  │
       │                  │  (user groups)   │                  │
       │                  │                  │                  │
   4.  │──Task Created────▶│                  │                  │
       │                  │                  │                  │
   5.  │                  │──Process Event───▶│                  │
       │                  │                  │                  │
   6.  │                  │                  │──Save to DB─────▶│
       │                  │                  │◀─Confirm─────────│
       │                  │                  │                  │
   7.  │                  │◀─Broadcast───────│                  │
       │                  │  (to room)       │                  │
       │                  │                  │                  │
   8.  │◀─Live Update─────│                  │                  │
       │                  │                  │                  │
```

## 🔧 Error Handling & Logging System

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │    │   Guard/    │    │   Global    │    │   Error     │
│   Incoming  │    │ Validation  │    │ Exception   │    │   Logger    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
   1.  │──API Call───────▶│                  │                  │
       │                  │                  │                  │
   2.  │                  │──Validate────────│                  │
       │                  │                  │                  │
   3.  │                  │◀─Error───────────│                  │
       │                  │                  │                  │
   4.  │                  │                  │──Catch Error────▶│
       │                  │                  │                  │
   5.  │                  │                  │                  │──Log to DB──┐
       │                  │                  │                  │             │
   6.  │                  │                  │                  │──Generate ID─│
       │                  │                  │                  │ (Correlation)│
       │                  │                  │                  │             │
   7.  │◀─Error Response──│◀─Formatted Error─│◀─Processed───────│             │
       │  (with ID)       │  (User Friendly) │                  │             │
       │                  │                  │                  │             │
                                                                               │
┌─────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────┐
│   MongoDB       │
│  errorlogs      │
├─────────────────┤
│ correlationId   │
│ message         │
│ level           │
│ category        │
│ statusCode      │
│ stack           │
│ context         │
│ metadata        │
│ isResolved      │
│ createdAt       │
└─────────────────┘
```

## 🎵 Music Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   MUSIC INTEGRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Music     │    │  External   │    │  Database   │
│             │    │  Service    │    │   APIs      │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
   1.  │──Connect Request─▶│                  │                  │
       │  (Spotify)        │                  │                  │
       │                  │                  │                  │
   2.  │                  │──OAuth Request───▶│                  │
       │                  │                  │                  │
   3.  │                  │◀─Access Token────│                  │
       │                  │                  │                  │
   4.  │                  │──Store Token─────│                  │──Store Integration──▶
       │                  │                  │                  │                     │
   5.  │                  │──Get Playlists───▶│                  │                     │
       │                  │                  │                  │                     │
   6.  │                  │◀─Playlist Data───│                  │                     │
       │                  │                  │                  │                     │
   7.  │◀─Connected───────│                  │                  │◀─Save Data──────────┘
       │                  │                  │                  │
```

## 📱 Mobile App Connection Points

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOBILE APP INTEGRATION                       │
└─────────────────────────────────────────────────────────────────┘

React Native App Components:
├── Authentication
│   ├── LoginScreen ────────────────────────────▶ POST /auth/login
│   └── RegisterScreen ─────────────────────────▶ POST /auth/register
│
├── Groups Management
│   ├── GroupListScreen ────────────────────────▶ GET /groups
│   ├── GroupDetailScreen ──────────────────────▶ GET /groups/:id
│   └── CreateGroupScreen ──────────────────────▶ POST /groups
│
├── Tasks Management
│   ├── TasksScreen ────────────────────────────▶ GET /tasks
│   ├── CreateTaskScreen ───────────────────────▶ POST /tasks
│   └── TaskDetailScreen ───────────────────────▶ GET /tasks/:id
│
├── Profile Management
│   └── ProfileScreen ──────────────────────────▶ GET/PATCH /users/profile
│
├── Notifications
│   └── NotificationsScreen ───────────────────▶ GET /notifications
│
└── Real-time Features
    └── WebSocket Connection ──────────────────▶ WS /ws
```

## 🔄 Data Flow Summary

```
1. Client Request → API Gateway → Authentication → Guards → Business Logic
2. Business Logic → Database Operations → Response Formation
3. Real-time Events → WebSocket Broadcasting → Client Updates
4. Errors → Global Handler → Database Logging → Client Response
5. External Integrations → Service Layer → Database Storage
```

## 📊 Performance & Scalability

```
Current Infrastructure:
├── Database: MongoDB (Document-based, Horizontal scaling ready)
├── Cache: Redis (Ready for session management & caching)
├── API: NestJS (Microservices architecture ready)
├── Real-time: Socket.IO (Clustered deployment ready)
└── Monitoring: Comprehensive error logging & correlation tracking

Scaling Points:
├── API: Load balancer + Multiple instances
├── Database: MongoDB Atlas cluster
├── Cache: Redis Cluster
├── Files: Cloud storage integration (AWS S3, etc.)
└── Monitoring: Advanced APM tools
```

---

**homeTeam Backend Architecture v1.0**  
*Production-Ready Enterprise-Grade API*
