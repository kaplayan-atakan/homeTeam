# GitHub Copilot Instructions - homeTeam Admin Dashboard

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js 14 admin dashboard for the homeTeam family task management application. The dashboard provides comprehensive management and analytics for users, groups, tasks, and notifications through a modern, responsive interface.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand + React Query (TanStack Query)
- **Authentication**: NextAuth.js with JWT backend integration
- **Charts**: Recharts + Chart.js for analytics
- **Icons**: Lucide React
- **HTTP Client**: Axios with React Query

### Backend Integration
- **API**: NestJS backend (http://localhost:3001)
- **Authentication**: JWT token-based with Redis session management
- **Real-time**: Socket.IO client for live updates
- **Cache**: React Query cache + server-side caching

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── groups/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── layout.tsx
│   ├── api/                # API routes (NextAuth, proxies)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Reusable components
│   ├── ui/                 # Shadcn/ui components
│   ├── layout/             # Layout components
│   ├── charts/             # Chart components
│   ├── forms/              # Form components
│   └── tables/             # Data table components
├── lib/                    # Utilities and configurations
│   ├── api/                # API client and endpoints
│   ├── auth/               # Authentication configuration
│   ├── utils/              # Utility functions
│   ├── validations/        # Zod schemas
│   └── socket.ts           # Socket.IO client
├── store/                  # Zustand stores
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── dashboard.store.ts
│   └── notification.store.ts
├── types/                  # TypeScript type definitions
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── dashboard.types.ts
│   └── index.ts
└── hooks/                  # Custom React hooks
    ├── use-api.ts
    ├── use-auth.ts
    └── use-socket.ts
```

## Coding Standards

### General Rules
- **Language**: Code and variables in English, UI text in Turkish
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **TypeScript**: Strict mode with proper type definitions
- **Components**: Functional components with React hooks
- **State**: Zustand for global state, useState for local state
- **Data Fetching**: React Query for server state management

### Next.js 14 App Router Rules
- Use App Router (not Pages Router)
- Server components by default, Client components only when needed
- Use `"use client"` directive for interactive components
- Leverage server-side rendering and static generation
- Use parallel routes and intercepting routes for complex layouts

### Styling Rules
- **Tailwind CSS**: Utility-first approach
- **Shadcn/ui**: Use pre-built components, customize via CSS variables
- **Responsive**: Mobile-first design (sm, md, lg, xl breakpoints)
- **Dark Mode**: Support both light and dark themes
- **Consistency**: Follow design system tokens

### State Management
- **Zustand**: For global state (auth, user data, app settings)
- **React Query**: For server state (API data, caching, mutations)
- **Local State**: useState for component-specific state
- **Form State**: React Hook Form for complex forms

## API Integration

### Backend API Endpoints
```typescript
// Base URL: http://localhost:3001
const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  
  // Groups
  GROUPS: '/groups',
  USER_GROUPS: '/groups/user',
  
  // Tasks
  TASKS: '/tasks',
  USER_TASKS: '/tasks/user',
  GROUP_TASKS: '/tasks/group',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  USER_NOTIFICATIONS: '/notifications/user',
  
  // Analytics
  ANALYTICS: '/analytics',
  STATS: '/analytics/stats',
}
```

### Authentication Flow
```typescript
// JWT token structure
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User session data
interface UserSession {
  id: string;
  email: string;
  role: 'admin' | 'user';
  groups: string[];
}
```

## UI Components Guidelines

### Shadcn/ui Components
- Use pre-built components: Button, Card, Dialog, Form, Table, etc.
- Customize via CSS variables in globals.css
- Extend components in `components/ui/` when needed
- Follow accessibility standards (ARIA, keyboard navigation)

### Charts and Analytics
- **Recharts**: For responsive charts (line, bar, pie, area)
- **Real-time Updates**: Socket.IO for live data
- **Performance**: Virtualization for large datasets
- **Export**: PDF/Excel export functionality

### Forms and Validation
- **React Hook Form**: For form state management
- **Zod**: For schema validation
- **Error Handling**: User-friendly error messages in Turkish
- **Loading States**: Proper loading and success feedback

## Real-time Features

### Socket.IO Integration
```typescript
// Socket events to listen for
const SOCKET_EVENTS = {
  // Task updates
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  
  // User activities
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  
  // System events
  SYSTEM_ALERT: 'system_alert',
}
```

## Performance Optimization

### Next.js Optimizations
- **Image Optimization**: Use next/image for all images
- **Code Splitting**: Dynamic imports for heavy components
- **Static Generation**: Use generateStaticParams for dynamic routes
- **Caching**: Leverage Next.js caching strategies

### React Query Configuration
```typescript
// Query configuration
const queryConfig = {
  staleTime: 5 * 60 * 1000,    // 5 minutes
  cacheTime: 10 * 60 * 1000,   // 10 minutes
  retry: 3,
  retryDelay: 1000,
}
```

## Error Handling

### Error Boundaries
- Implement error boundaries for route segments
- User-friendly error messages in Turkish
- Automatic error reporting to backend
- Graceful degradation for offline scenarios

### API Error Handling
```typescript
// Standard error response format
interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}
```

## Security Considerations

- **Authentication**: Secure JWT handling with httpOnly cookies
- **CORS**: Proper CORS configuration for backend communication
- **XSS Protection**: Sanitize user inputs
- **CSRF**: CSRF token validation for mutations
- **Content Security Policy**: Strict CSP headers

## Development Guidelines

### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Define props
}

export function Component({ ...props }: ComponentProps) {
  // Hooks first
  // Event handlers
  // Render logic
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Custom Hooks
- Extract reusable logic into custom hooks
- Use React Query hooks for API operations
- Follow naming convention: `use[FeatureName]`

### Type Safety
- Define proper TypeScript interfaces
- Use discriminated unions for state types
- Avoid `any` type, use `unknown` when necessary
- Implement runtime type validation with Zod

## Testing Strategy

### Unit Tests
- **Vitest**: For unit and integration tests
- **React Testing Library**: For component testing
- **MSW**: For API mocking in tests

### E2E Tests
- **Playwright**: For end-to-end testing
- **Critical User Flows**: Authentication, CRUD operations
- **Cross-browser Testing**: Chrome, Firefox, Safari

This admin dashboard should provide a comprehensive, user-friendly interface for managing the homeTeam application with real-time updates, robust error handling, and excellent performance.
