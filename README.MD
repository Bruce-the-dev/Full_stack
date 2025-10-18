# Full-Stack User Management System

A modern admin panel built with **Next.js** (frontend) and **NestJS** (backend), featuring cryptographic security with digital signatures, Protocol Buffers serialization, and real-time analytics.

## 🚀 Features

### Core Functionality

- ✅ **User CRUD Operations** - Create, Read, Update, and Delete users
- ✅ **Protobuf Serialization** - Efficient binary data encoding using Protocol Buffers
- ✅ **Digital Signatures** - RSA-PSS signatures with SHA-384 hashing
- ✅ **Signature Verification** - Frontend verification using Web Crypto API
- ✅ **Analytics Dashboard** - 7-day user creation chart
- ✅ **SQLite Database** - Lightweight persistent storage

### Security Features

- 🔒 **SHA-384 Hashing** - Email addresses hashed for secure identification
- 🔑 **RSA-PSS Signatures** - 4096-bit key pairs for digital signatures
- ✅ **Frontend Verification** - Signatures verified in browser before display
- 📦 **Protocol Buffers** - Secure binary serialization format

## 📁 Project Structure

```
project-root/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/user.entity.ts
│   │   ├── proto/
│   │   │   └── users.proto
│   │   |── app.controller.ts
│   │   |── app.module.ts
│   │   |── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                # Next.js Frontend
    ├── src/
    │   └── app/
    │       ├── page.tsx     # Main dashboard
    │       └── create/
    │           └── page.tsx # Create user page
    ├── public/
    │   └── proto/
    │       └── users.proto
    ├── package.json
    └── next.config.js
```

## 🛠️ Technologies Used

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM
- **SQLite** - Lightweight database
- **Protocol Buffers** - Binary serialization
- **Node.js WebCrypto API** - Cryptographic operations

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Chart.js** - Data visualization
- **Protocol Buffers** - Binary deserialization
- **Web Crypto API** - Signature verification
- **Lucide React** - Icon library

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3001` (or the next available port)

## 🔧 API Endpoints

### User Management

- `GET /users` - List all users
- `POST /users` - Create a new user
  ```json
  {
    "email": "user@example.com",
    "role": "user"
  }
  ```
- `PUT /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID

### Protobuf Export

- `GET /users/export` - Export all users in Protobuf format
  - Returns binary data with cryptographic signatures
  - Content-Type: `application/octet-stream`

## 🔐 How It Works

### 1. User Creation Flow

1. User submits email and role via frontend form
2. Backend hashes email using SHA-384
3. Backend signs the email bytes with RSA-PSS (4096-bit key)
4. User data, signature, and public key stored in SQLite
5. Success response sent to frontend

### 2. Protobuf Export & Verification

1. Frontend requests `/users/export` endpoint
2. Backend serializes users using Protocol Buffers
3. Frontend decodes Protobuf binary data
4. For each user:
   - Frontend hashes the email with SHA-384
   - Verifies signature using stored public key
   - Only displays users with valid signatures ✅

### 3. Protocol Buffers Schema

```protobuf
syntax = "proto3";

package users;

message User {
  string id = 1;
  string email = 2;
  string role = 3;
  bool status = 4;
  int64 createdAt = 5;
  bytes signature = 6;
  bytes publicKeySpki = 7;
}

message Users {
  repeated User users = 1;
}
```

## 📊 Dashboard Features

### User Management Tab

- View all users in a table
- Create new users
- Edit existing users
- Delete users
- Real-time status updates

### Analytics Tab

- Line chart showing user creation trends
- Last 7 days statistics
- Day-by-day breakdown

### Protobuf Export Tab

- Fetch and decode Protobuf data
- Signature verification status for each user
- Filter out invalid signatures
- Visual indicators (✅/❌) for verification status

## 🧪 Testing the Application

1. **Create a User**

   - Navigate to the Create User page
   - Enter an email and select a role
   - Click "Create User"

2. **Verify on Dashboard**

   - Return to main dashboard
   - Check "User Management" tab for new user
   - View chart in "Analytics" tab

3. **Test Protobuf Export**
   - Click "Protobuf Export" tab
   - Click "Refresh Protobuf Data"
   - Verify all users show ✅ (valid signature)

## 🚨 Important Notes

### Database

- SQLite database is created automatically on first run
- Located at `backend/database.sqlite` (or as configured)
- Delete the database file to reset all data

### Cryptographic Keys

- RSA keypair is generated in-memory on backend startup
- Keys are NOT persisted - they regenerate on restart
- After backend restart, old signatures will be invalid
- **Solution**: Delete database and create fresh users

### CORS Configuration

- Backend allows requests from `http://localhost:3001`
- Modify CORS settings in `main.ts` if using different ports

## 🐛 Troubleshooting

### "Invalid signatures" after backend restart

- **Cause**: New keypair generated, old signatures incompatible
- **Fix**: Delete `database.sqlite` and create new users

### "Failed to fetch users/export"

- **Check**: Backend is running on port 3000
- **Check**: CORS is properly configured
- **Check**: Protobuf schema matches on both ends

### Database locked errors

- **Fix**: Close any database viewers
- **Fix**: Restart backend server

## 📝 Assignment Requirements Checklist

- ✅ User CRUD operations with SQLite persistence
- ✅ User graph showing 7-day creation statistics
- ✅ Protocol Buffers schema defined and implemented
- ✅ `/users/export` endpoint returning Protobuf data
- ✅ Frontend decodes Protobuf and displays users
- ✅ SHA-384 email hashing
- ✅ RSA-PSS digital signatures (4096-bit)
- ✅ Frontend signature verification
- ✅ Only verified users displayed in Protobuf tab

## 👨‍💻 Author

Submitted for Full-Stack JavaScript Developer position at QT Global Software Ltd.

---

**Submission Date**: October 19, 2025  
**Deadline**: 6:00 PM Rwanda Time (UTC+2)
