# Book Management System (etoe2)

> **⚠️ IMPORTANT: This application is for testing purposes only.**  
> This project is designed as a demonstration and testing application for learning and evaluating web development technologies, testing frameworks, and real-time communication patterns. It is not intended for production use.

A full-stack web application for managing books with real-time notifications, built with Next.js, React, and Socket.io. This application demonstrates CRUD operations, authentication, real-time updates, and end-to-end testing capabilities.

## Features

- 🔐 **Authentication** - JWT-based user authentication with protected routes
- 📚 **Book CRUD Operations** - Create, Read, Update, and Delete books
- 🔔 **Real-time Notifications** - Live updates using Socket.io when books are created, updated, or deleted
- 📊 **Reports** - View and generate reports
- 🧪 **E2E Testing** - Automated end-to-end tests with WebDriverIO and Cucumber
- 🎨 **Modern UI** - Bootstrap 5 for responsive design
- ⚡ **Custom Server** - Custom Next.js server with integrated Socket.io support

## Functionality Overview

### Authentication System
- **Login**: Users can authenticate using credentials stored in the system
- **JWT Tokens**: Authentication uses JSON Web Tokens stored in HTTP-only cookies for security
- **Protected Routes**: All book management pages require authentication
- **Session Management**: Users can logout, and the system validates tokens on each request
- **Auto-redirect**: Unauthenticated users are automatically redirected to the login page

### Book Management (CRUD Operations)

#### Create Books
- **Form-based Creation**: Users can create new books through a dedicated form page
- **Required Fields**: Title, Author, ISBN, Published Year, and Genre are all required
- **Validation**: Server-side validation ensures data integrity
- **Success Feedback**: After creation, users are redirected to the books list page
- **Real-time Notification**: Socket.io emits a `book-created` event when a book is successfully created

#### Read Books
- **List View**: Display all books in a table format with pagination support
- **Book Details**: View individual book information including ID, timestamps, and all metadata
- **Search & Filter**: Books can be filtered and searched (if implemented)
- **Responsive Table**: Bootstrap-styled table that works on all screen sizes

#### Update Books
- **Edit Page**: Dedicated edit page for modifying book information
- **Pre-filled Form**: Form is pre-populated with existing book data
- **Field Validation**: Same validation rules as creation
- **Real-time Notification**: Socket.io emits a `book-updated` event when a book is modified

#### Delete Books
- **Confirmation Modal**: Delete operations require user confirmation via a modal dialog
- **Safe Deletion**: Prevents accidental deletions
- **Real-time Notification**: Socket.io emits a `book-deleted` event when a book is removed
- **Immediate UI Update**: Book list refreshes automatically after deletion

### Real-time Notifications
- **Socket.io Integration**: WebSocket-based real-time communication
- **Event Types**: 
  - `book-created` - Fired when a new book is added
  - `book-updated` - Fired when a book is modified
  - `book-deleted` - Fired when a book is removed
- **Notification Page**: Dedicated page to view all real-time notifications
- **Connection Status**: Visual indicator shows Socket.io connection status
- **Notification History**: All notifications are stored and displayed with timestamps
- **Badge System**: Different colored badges for create (green), update (yellow), and delete (red) events

### Reports & Analytics
- **Total Books Count**: Displays the total number of books in the system
- **Books by Genre**: Statistical breakdown showing count of books per genre
- **Books by Year**: Statistical breakdown showing count of books published per year
- **Complete Book List**: Full table view of all books with all details
- **Real-time Updates**: Reports reflect changes as books are added, updated, or deleted

### User Interface
- **Responsive Design**: Bootstrap 5 ensures the application works on desktop, tablet, and mobile devices
- **Navigation Bar**: Consistent navigation across all pages with links to Books, Notifications, and Reports
- **Loading States**: Spinner indicators during data fetching operations
- **Error Handling**: User-friendly error messages displayed via Bootstrap alerts
- **Modal Dialogs**: Confirmation modals for destructive actions
- **Form Validation**: Client-side and server-side validation for data integrity

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Bootstrap 5.3.8, Tailwind CSS 4
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Real-time**: Socket.io 4.8.3
- **Testing**: WebDriverIO 9.23.3, Cucumber
- **Linting**: ESLint
- **Runtime**: Node.js with ts-node

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Chrome browser (for E2E tests)
- Windows, macOS, or Linux (scripts are optimized for Windows/PowerShell)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd etoe2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (if needed):
Create a `.env.local` file in the root directory with any required environment variables.

## Running the Application

### Development Mode

Start the development server with Socket.io support:
```bash
npm run dev
```

The application will be available at:
- **Web App**: `http://localhost:3000`
- **Socket.io Server**: `http://localhost:3000/socket.io/`

The server runs a custom Next.js server (`server.ts`) that integrates Socket.io for real-time functionality.

### Production Mode

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

**Note**: The `start` script uses Windows-compatible syntax. For Unix/Linux systems, you may need to modify it to use `NODE_ENV=production` instead of `set NODE_ENV=production`.

## Available Scripts

- `npm run dev` - Start development server with Socket.io
- `npm run build` - Build the application for production
- `npm start` - Start production server (Windows-compatible)
- `npm run lint` - Run ESLint on all files
- `npm run wdio` - Run WebDriverIO E2E tests
- `npm run clean:cache` - Clear Next.js and node_modules cache (Windows PowerShell)

## Project Structure

```
etoe2/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints (login, logout, me)
│   │   ├── books/        # Book CRUD endpoints
│   │   └── socket/       # Socket.io endpoints
│   ├── books/            # Book management pages (list, create, edit)
│   ├── login/            # Login page
│   ├── notifications/    # Notifications page
│   ├── reports/         # Reports page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page (redirects to /books or /login)
│   └── globals.css      # Global styles
├── components/           # React components (e.g., ProtectedRoute)
├── lib/                 # Utility libraries (auth, books, socket)
├── tests/               # E2E tests
│   ├── features/       # Cucumber feature files (.feature)
│   ├── step-definitions/ # Step definitions (.steps.ts)
│   └── support/        # Test support files (hooks, context)
├── types/               # TypeScript type definitions
├── public/              # Static assets
├── server.ts           # Custom Next.js server with Socket.io
├── wdio.conf.ts        # WebDriverIO configuration
├── tsconfig.json       # TypeScript configuration
├── next.config.ts      # Next.js configuration
└── package.json        # Project dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book
- `GET /api/books/[id]` - Get a specific book
- `PUT /api/books/[id]` - Update a book
- `DELETE /api/books/[id]` - Delete a book
- `POST /api/books/reset` - Reset books data

## Testing

Run E2E tests:
```bash
npm run wdio
```

Tests are written using Cucumber (Gherkin syntax) and executed with WebDriverIO. 

**Test Structure:**
- Feature files: `tests/features/*.feature` (Gherkin syntax)
- Step definitions: `tests/step-definitions/*.steps.ts`
- Support files: `tests/support/*.ts` (hooks, context)

Test reports and logs are automatically generated in the `logs/` directory (which is gitignored). The logs directory contains:
- WebDriverIO execution logs
- Chrome browser profiles and debug logs
- Test execution reports

## Authentication

The application uses JWT tokens stored in HTTP-only cookies for authentication. Protected routes require a valid token to access.

## Real-time Features

Socket.io is integrated to provide real-time notifications when:
- Books are created
- Books are updated
- Books are deleted

## Development Notes

### Custom Server Setup

This project uses a custom Next.js server (`server.ts`) instead of the default Next.js server. This allows:
- Integration of Socket.io on the same HTTP server
- Custom server-side logic
- Shared HTTP server for both Next.js and Socket.io

### Environment Variables

Create a `.env.local` file for environment-specific configuration:
```env
PORT=3000
NODE_ENV=development
# Add other environment variables as needed
```

### Windows Compatibility

The scripts in `package.json` are optimized for Windows/PowerShell:
- `start` script uses `set NODE_ENV=production`
- `clean:cache` uses Windows `if exist` and `rmdir` commands

For Unix/Linux systems, modify these scripts accordingly.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run wdio`
4. Run linter: `npm run lint`
5. Ensure all tests pass
6. Submit a pull request

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, set a different port:
```bash
set PORT=3001 && npm run dev
```

### Cache Issues
Clear the Next.js cache:
```bash
npm run clean:cache
```

### Socket.io Connection Issues
Ensure the server is running and check the browser console for connection errors. The Socket.io server is available at `/socket.io/`.

## License

Private project
