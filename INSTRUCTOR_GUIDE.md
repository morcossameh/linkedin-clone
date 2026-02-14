# Instructor Guide: LinkedIn Clone - Axios Interceptors

## Project Overview
**Project:** api-13-linkedin-interceptors
**Learning Objectives:**
- Understand axios interceptors and middleware pattern
- Implement automatic JWT token injection
- Build automatic token refresh mechanism
- Handle request queuing during token refresh
- Manage session expiration gracefully
- Apply global error handling

---

## Prerequisites
Students should understand:
- axios basics (requests, responses)
- JWT authentication flow
- Async/await and Promises
- Token expiration concepts
- React context (helpful but not required)

---

## What Are Interceptors?

### Conceptual Overview

**Interceptors are middleware** that run before requests are sent or after responses are received.

Think of them as "checkpoints":
- **Request Interceptor:** Checkpoint before request leaves
- **Response Interceptor:** Checkpoint when response arrives

### Real-World Analogy
Imagine a security guard at a building:
- **Request Interceptor:** Guard checks your ID badge before you enter
- **Response Interceptor:** Guard checks packages when you leave

### Why Use Interceptors?

**Without Interceptors:**
```javascript
// Repeat this in every function
const token = localStorage.getItem('accessToken')
const response = await api.get('/api/posts', {
  headers: { Authorization: `Bearer ${token}` }
})
```

**With Interceptors:**
```javascript
// Write once in interceptor
// Use everywhere automatically
const response = await api.get('/api/posts')
```

### Benefits:
1. **DRY (Don't Repeat Yourself)** - Write auth logic once
2. **Centralized** - All requests use same logic
3. **Maintainable** - Update one place, affects all requests
4. **Consistent** - No forgetting to add token
5. **Powerful** - Can modify requests/responses globally

---

## Implementation Order & Teaching Points

### Step 1: Review Current Implementation
**Files to review:** `src/services/postsService.js`, `src/services/authService.js`

**Show the problem:**
```javascript
// This is repeated in EVERY function
const token = localStorage.getItem('accessToken')
headers: { Authorization: `Bearer ${token}` }
```

**Teaching Points:**
- Code duplication (violates DRY)
- Easy to forget in new functions
- Hard to maintain (change requires updating everywhere)
- No automatic token refresh
- Manual error handling in each component

**Ask Students:**
- "What happens if we forget to add the token?"
- "What happens when the token expires?"
- "How many places would we need to change if we updated the token storage?"

---

### Step 2: Create Shared Axios Instance
**File:** `src/services/api.js`

#### 2.1 Basic Setup
```javascript
import axios from 'axios'

const API_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
```

**Teaching Points:**

**axios.create():**
- Creates a custom axios instance
- Can have its own configuration
- Can have its own interceptors
- Isolated from global axios

**Why separate instance?**
- Can configure differently than global axios
- Interceptors only affect this instance
- Can have multiple instances for different APIs

**baseURL benefit:**
- Avoids repeating 'http://localhost:3000' everywhere
- Easy to change for different environments (dev/prod)
- Cleaner request calls

---

### Step 3: Add Request Interceptor
**File:** `src/services/api.js`

#### 3.1 Basic Request Interceptor
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

**Teaching Points:**

**interceptors.request.use():**
- Takes two functions: success and error handlers
- Runs before every request
- Must return config or Promise

**Success handler (config):**
- **config** is the request configuration object
- Contains: url, method, headers, data, params, etc.
- **Modify and return** - Changes apply to request
- If you don't return config, request won't be sent

**What we're doing:**
1. Get token from localStorage
2. If token exists, add to Authorization header
3. Return modified config
4. Request proceeds with token

**Error handler:**
- Catches errors during request setup (rare)
- Must return rejected Promise
- Allows error to propagate

**Key Concept - Middleware Pattern:**
- Request → Interceptor → Server
- Interceptor can:
  - Read config
  - Modify config
  - Cancel request (don't return config)
  - Add headers, params, etc.

---

### Step 4: Add Basic Response Interceptor
**File:** `src/services/api.js`

#### 4.1 Simple Error Formatting
```javascript
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
    return Promise.reject(new Error(errorMessage))
  }
)
```

**Teaching Points:**

**interceptors.response.use():**
- Two handlers: success and error
- Runs after every response
- Success: 2xx status codes
- Error: 4xx, 5xx status codes, or network errors

**Success handler:**
- Simply return response (could transform data here)
- Response contains: data, status, headers, config

**Error handler:**
- Runs on error responses
- **error.response** exists for HTTP errors (4xx, 5xx)
- **error.request** exists if request was made but no response
- **error.message** exists for setup errors

**Error formatting:**
- Backend sends: `{ error: "Invalid credentials" }`
- We extract: `error.response?.data?.error`
- Optional chaining (?.) prevents crashes
- Fallback messages for consistency

**Why format errors here?**
- Consistent error messages across app
- Components don't need to know backend error structure
- Easy to change if backend changes

---

### Step 5: Implement Token Refresh (Advanced)
**File:** `src/services/api.js`

This is the most complex part - break it down into sections.

#### 5.1 Setup Variables
```javascript
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}
```

**Teaching Points:**

**Why these variables?**

**Problem:** Multiple requests fail at same time when token expires
- User opens feed → 10 posts load
- Token expired
- All 10 requests fail simultaneously
- Without queue: 10 refresh token calls!
- With queue: 1 refresh call, others wait

**isRefreshing flag:**
- Prevents multiple simultaneous refresh calls
- Boolean: are we currently refreshing?
- Only one refresh at a time

**failedQueue array:**
- Holds Promise resolve/reject functions
- Requests wait here during refresh
- Processed after refresh completes

**processQueue function:**
- Resolves or rejects all queued requests
- Called after refresh succeeds/fails
- Clears queue when done

**Key Concept - Race Condition Prevention:**
- Without queue: Multiple refresh calls (wrong!)
- With queue: One refresh, others wait (correct!)

#### 5.2 Handle 401 Errors
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Not a 401 or already retried? Format and throw error
    if (error.response?.status !== 401 || originalRequest._retry) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred'
      return Promise.reject(new Error(errorMessage))
    }

    // ... token refresh logic ...
  }
)
```

**Teaching Points:**

**originalRequest = error.config:**
- Saves the original request configuration
- Need this to retry the request later
- Contains: url, method, data, headers, etc.

**Check conditions:**
1. **error.response?.status !== 401** - Not unauthorized
2. **originalRequest._retry** - Already tried to refresh

**_retry flag:**
- Custom property we add to config
- Prevents infinite loops
- If refresh fails, don't retry again

**Flow:**
- Request fails with 401
- Check: Is it 401? Haven't retried yet?
- Yes → Try to refresh token
- No → Format error and throw

#### 5.3 Queue Management
```javascript
if (isRefreshing) {
  // Already refreshing, queue this request
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  })
    .then(token => {
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    })
    .catch(err => {
      return Promise.reject(err)
    })
}
```

**Teaching Points:**

**If already refreshing:**
- Don't make another refresh call
- Return a Promise that will wait
- Push resolve/reject to queue

**Promise pattern:**
```javascript
new Promise((resolve, reject) => {
  failedQueue.push({ resolve, reject })
})
```
- Creates a Promise that doesn't resolve immediately
- Stores resolve/reject functions in queue
- Will be resolved/rejected later by processQueue

**After Promise resolves:**
- .then() receives the new token
- Update request's Authorization header
- Retry the original request with new token
- Return the result

**Visual Flow:**
```
Request 1 fails → Start refreshing (isRefreshing = true)
Request 2 fails → Queue (wait for token)
Request 3 fails → Queue (wait for token)
Refresh succeeds → Process queue → Retry all 3 requests
```

#### 5.4 Perform Token Refresh
```javascript
// Mark that we're trying to refresh
originalRequest._retry = true
isRefreshing = true

const refreshToken = localStorage.getItem('refreshToken')

if (!refreshToken) {
  isRefreshing = false
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '/login'
  return Promise.reject(new Error('Session expired. Please login again.'))
}

try {
  // Call refresh endpoint
  const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
    refreshToken
  })

  const { accessToken, refreshToken: newRefreshToken } = response.data

  // Update tokens
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', newRefreshToken)

  // Update default header
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  originalRequest.headers.Authorization = `Bearer ${accessToken}`

  // Process queued requests
  processQueue(null, accessToken)

  // Retry original request
  isRefreshing = false
  return api(originalRequest)
} catch (refreshError) {
  // Refresh failed
  processQueue(refreshError, null)
  isRefreshing = false

  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '/login'

  return Promise.reject(new Error('Session expired. Please login again.'))
}
```

**Teaching Points:**

**Step-by-step breakdown:**

**1. Mark request as retried:**
```javascript
originalRequest._retry = true
isRefreshing = true
```
- Prevents retry loop
- Signals we're refreshing

**2. Check for refresh token:**
```javascript
if (!refreshToken) {
  // No refresh token → logout
}
```
- Can't refresh without refresh token
- Clear storage and redirect

**3. Call refresh endpoint:**
```javascript
const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
  refreshToken
})
```
- **Important:** Use plain axios, not api instance
- Why? api instance has interceptors
- Would create infinite loop!
- Direct axios call bypasses interceptors

**4. Update tokens:**
```javascript
localStorage.setItem('accessToken', accessToken)
localStorage.setItem('refreshToken', newRefreshToken)
```
- Store new tokens
- Backend rotates refresh token (security best practice)

**5. Update headers:**
```javascript
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
originalRequest.headers.Authorization = `Bearer ${accessToken}`
```
- **api.defaults** - For future requests
- **originalRequest.headers** - For this retry

**6. Process queue:**
```javascript
processQueue(null, accessToken)
```
- Resolves all waiting Promises
- Provides new token
- Queued requests retry automatically

**7. Retry original request:**
```javascript
return api(originalRequest)
```
- Retries with new token
- Returns the response
- User never knows refresh happened!

**8. Handle refresh failure:**
```javascript
catch (refreshError) {
  processQueue(refreshError, null)  // Reject queued requests
  localStorage.clear()              // Clear all data
  window.location.href = '/login'   // Redirect to login
}
```
- Reject all queued requests
- Clear storage
- Redirect to login
- Session truly expired

**Key Concept - Transparent Refresh:**
- User makes request
- Token expired (unbeknownst to user)
- Request fails → Auto refresh → Retry → Success
- User sees: Normal request (slight delay)
- User doesn't see: The token refresh magic

---

### Step 6: Update Services to Use Shared Instance
**Files:** `src/services/postsService.js`, `src/services/authService.js`

#### 6.1 Posts Service Transformation

**Before:**
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

export const fetchPosts = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await api.get('/api/posts', {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  })
  return response.data
}

export const createPost = async (content, reactions = [], commentsCount = 0, repostsCount = 0) => {
  const token = localStorage.getItem('accessToken')
  const response = await api.post('/api/posts', {
    content,
    reactions,
    commentsCount,
    repostsCount,
  }, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  })
  return response.data
}

// ... more functions with repeated token logic
```

**After:**
```javascript
import api from './api'

export const fetchPosts = async () => {
  const response = await api.get('/api/posts')
  return response.data
}

export const createPost = async (content, reactions = [], commentsCount = 0, repostsCount = 0) => {
  const response = await api.post('/api/posts', {
    content,
    reactions,
    commentsCount,
    repostsCount,
  })
  return response.data
}

// All other functions similarly simplified
```

**Teaching Points:**

**Code reduction:**
- **Before:** 66 lines
- **After:** 31 lines
- **Removed:** 35 lines of repetitive code!

**Removed from each function:**
1. `const token = localStorage.getItem('accessToken')`
2. `headers: { Authorization: ... }` config

**Benefits:**
- **Cleaner:** Functions focus on business logic
- **Safer:** Can't forget to add token
- **Maintainable:** Change auth logic once
- **Testable:** Easier to mock/test

#### 6.2 Auth Service Update

**Before:**
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}
```

**After:**
```javascript
import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}
```

**Teaching Points:**

**Consistency:**
- All services use same axios instance
- Same interceptors apply everywhere
- Centralized configuration

**Note about auth endpoints:**
- Login doesn't need token (no auth required)
- Interceptor checks: `if (token)` before adding header
- Gracefully handles endpoints that don't need auth

---

## Complete Flow Diagrams

### Normal Request Flow (Token Valid)
```
1. Component calls api.get('/api/posts')
   ↓
2. Request Interceptor
   - Gets token from localStorage
   - Adds Authorization header
   ↓
3. Request sent to server
   ↓
4. Server validates token → 200 OK
   ↓
5. Response Interceptor (success handler)
   - Returns response unchanged
   ↓
6. Component receives data
```

### Token Expired Flow (First Request)
```
1. Component calls api.get('/api/posts')
   ↓
2. Request Interceptor
   - Adds expired token
   ↓
3. Server validates token → 401 Unauthorized
   ↓
4. Response Interceptor (error handler)
   - Detects 401
   - isRefreshing = false → Start refresh
   - isRefreshing = true
   ↓
5. Call POST /api/auth/refresh-token
   ↓
6. Server returns new tokens
   ↓
7. Update localStorage with new tokens
   ↓
8. Retry original request with new token
   ↓
9. Server validates new token → 200 OK
   ↓
10. Component receives data (no error!)
```

### Token Expired Flow (Multiple Simultaneous Requests)
```
1. Component makes 10 requests simultaneously
   ↓
2. All requests get expired token
   ↓
3. All requests fail with 401
   ↓
4. First request:
   - isRefreshing = false → Start refresh
   - isRefreshing = true
   - Calls refresh endpoint
   ↓
5. Requests 2-10:
   - isRefreshing = true → Queue
   - Added to failedQueue
   - Promises wait
   ↓
6. First request refresh succeeds
   - Updates tokens
   - Calls processQueue()
   ↓
7. processQueue() resolves all waiting Promises
   - Each gets new token
   - Each retries automatically
   ↓
8. All 10 requests retry and succeed
   ↓
9. Component receives all 10 responses
```

### Refresh Token Expired Flow
```
1. Request fails with 401
   ↓
2. Try to refresh token
   ↓
3. POST /api/auth/refresh-token
   ↓
4. Server: Refresh token expired → 401
   ↓
5. Catch error in interceptor
   ↓
6. processQueue(error) → Reject all waiting requests
   ↓
7. localStorage.clear()
   ↓
8. window.location.href = '/login'
   ↓
9. User redirected to login page
```

---

## Project Structure

```
src/
├── services/
│   ├── api.js                  [NEW] - Shared axios instance with interceptors
│   ├── postsService.js         [MODIFIED] - Uses shared instance, removed token logic
│   └── authService.js          [MODIFIED] - Uses shared instance
├── components/
│   ├── CenterContent.jsx       [UNCHANGED] - No changes needed!
│   ├── PostCreation.jsx        [UNCHANGED] - No changes needed!
│   └── ...
└── ...
```

**Key Point:**
- Only service layer changed
- Components unchanged
- Better separation of concerns

---

## Testing & Demonstration

### Test 1: Normal Operation
**Scenario:** Token is valid

**Steps:**
1. Login to application
2. Open DevTools → Network tab
3. Create a post
4. Check Network tab:
   - POST /api/posts request
   - Request Headers → Authorization: Bearer <token>
   - Token added automatically!
5. Refresh page, fetch posts
6. Check Network tab:
   - GET /api/posts request
   - Same Authorization header
   - All requests have token

**Teaching Points:**
- Token added without any explicit code
- Request interceptor working
- Same token on all requests

### Test 2: Token Refresh (Manual Simulation)
**Scenario:** Simulate expired token

**Setup:**
```javascript
// In browser console
// Save current token
const goodToken = localStorage.getItem('accessToken')

// Replace with expired token (or gibberish)
localStorage.setItem('accessToken', 'expired_token_12345')

// Now try to create a post
```

**Expected behavior:**
1. Request fails with 401
2. Interceptor detects 401
3. Calls refresh endpoint automatically
4. Gets new token
5. Retries original request
6. Success!

**Check Network tab:**
- POST /api/posts (fails with 401)
- POST /api/auth/refresh-token (succeeds)
- POST /api/posts (retry, succeeds)

**Teaching Points:**
- Automatic token refresh
- Request retry
- Transparent to user
- Check Network tab timing

### Test 3: Multiple Requests (Queue Test)
**Scenario:** Multiple requests with expired token

**Setup:**
```javascript
// In browser console
localStorage.setItem('accessToken', 'expired')

// Trigger multiple requests
// Refresh the feed page (loads multiple posts)
```

**Expected behavior:**
1. Multiple requests fail with 401
2. Only ONE refresh token call
3. All requests wait in queue
4. After refresh, all retry
5. All succeed

**Check Network tab:**
- Multiple POST/GET requests (401)
- ONE POST /api/auth/refresh-token
- Multiple retry requests (200)

**Teaching Points:**
- Queue prevents multiple refresh calls
- Race condition handled
- Efficient (1 refresh, not N refreshes)

### Test 4: Refresh Token Expired
**Scenario:** Both tokens expired

**Setup:**
```javascript
// In browser console
localStorage.setItem('accessToken', 'expired')
localStorage.setItem('refreshToken', 'expired')

// Try to create a post
```

**Expected behavior:**
1. Request fails with 401
2. Try to refresh token
3. Refresh fails (refresh token expired)
4. localStorage cleared
5. Redirect to /login
6. User must login again

**Teaching Points:**
- Graceful session expiration
- Automatic cleanup
- Security: No lingering data

### Test 5: Error Formatting
**Scenario:** Various error types

**Try these:**
1. Invalid request (400) → See formatted error
2. Not found (404) → See formatted error
3. Server error (500) → See formatted error
4. Network error → See fallback message

**Teaching Points:**
- Consistent error format
- User-friendly messages
- Fallback handling

---

## Common Teaching Discussion Points

### 1. Why Not Just Increase Token Expiration?

**Student Question:** "Why not make tokens last forever?"

**Answer:**

**Security trade-off:**
- **Short expiration:** More secure (if stolen, expires soon)
- **Long expiration:** Less secure but convenient

**Access token (15 min):**
- Used frequently
- If stolen: Limited window
- Refresh frequently is okay

**Refresh token (7 days):**
- Used rarely (only for refresh)
- Less exposure
- Longer validity okay

**Best practice:**
- Short-lived access token
- Longer-lived refresh token
- Automatic refresh = Security + Convenience

### 2. Why Use Separate Refresh Token?

**Student Question:** "Why not just extend the access token?"

**Answer:**

**Rotation principle:**
- Each refresh gives NEW tokens
- Old tokens invalidated
- If stolen, thief loses access on next refresh

**Different permissions:**
- Access token: Access resources
- Refresh token: Get new access token
- Separation of concerns

**Revocation:**
- Can revoke refresh tokens (logout all devices)
- Can't revoke access tokens (too many, expire anyway)
- Better control

### 3. When Do Interceptors Run?

**Visual representation:**

```
api.get('/posts')
     ↓
[Request Interceptor]  ← Runs here
     ↓
[Network Request]
     ↓
[Server Processing]
     ↓
[Network Response]
     ↓
[Response Interceptor] ← Runs here
     ↓
.then(response => ...)
```

**Key points:**
- Request: Before network call
- Response: After network call, before .then()
- Can modify both
- Can cancel/reject

### 4. What About Multiple axios Instances?

**Student Question:** "Can we have multiple instances with different interceptors?"

**Answer:** Yes!

**Use case:**
```javascript
// api.js - Internal API with auth
const internalApi = axios.create({ baseURL: '/api' })
internalApi.interceptors.request.use(addToken)

// externalApi.js - External API without auth
const externalApi = axios.create({ baseURL: 'https://external.com' })
// No token interceptor

// Use different instances
internalApi.get('/posts')     // Has token
externalApi.get('/public')    // No token
```

**Benefits:**
- Different APIs, different configs
- Different interceptors
- Different error handling

### 5. Interceptor Order Matters

**Multiple interceptors:**
```javascript
api.interceptors.request.use(interceptor1) // Runs first
api.interceptors.request.use(interceptor2) // Runs second
api.interceptors.request.use(interceptor3) // Runs third

// Request goes: 1 → 2 → 3 → Server

api.interceptors.response.use(interceptor1) // Runs last
api.interceptors.response.use(interceptor2) // Runs second
api.interceptors.response.use(interceptor3) // Runs first

// Response goes: Server → 3 → 2 → 1
```

**Response interceptors run in reverse order!**

**Why?**
- Think of nesting/wrapping
- Like middleware stack
- First added = outer layer
- Last added = inner layer

### 6. Can Interceptors Cancel Requests?

**Student Question:** "Can we prevent a request from happening?"

**Answer:** Yes!

```javascript
api.interceptors.request.use(config => {
  if (someCondition) {
    return Promise.reject(new Error('Request cancelled'))
  }
  return config
})
```

**Use cases:**
- Cancel if offline
- Cancel duplicate requests
- Cancel if rate limited
- Validation before sending

### 7. Memory Leaks with Interceptors?

**Student Question:** "Do interceptors cause memory leaks?"

**Answer:** Can, if not careful

**Problem:**
```javascript
useEffect(() => {
  const interceptor = api.interceptors.request.use(...)
  // Never cleaned up! Accumulates on every mount
}, [])
```

**Solution:**
```javascript
useEffect(() => {
  const interceptor = api.interceptors.request.use(...)

  return () => {
    api.interceptors.request.eject(interceptor)
  }
}, [])
```

**In our case:**
- Interceptors added once at module level
- Not in components
- No cleanup needed

---

## Advanced Concepts

### 1. Request Cancellation

**Use case:** User navigates away before request completes

```javascript
import axios from 'axios'

const CancelToken = axios.CancelToken
let cancel

api.get('/api/posts', {
  cancelToken: new CancelToken(c => cancel = c)
})

// Later, cancel if needed
cancel('Operation cancelled by user')
```

**In React:**
```javascript
useEffect(() => {
  const source = axios.CancelToken.source()

  api.get('/api/posts', {
    cancelToken: source.token
  }).catch(err => {
    if (axios.isCancel(err)) {
      console.log('Request cancelled')
    }
  })

  return () => source.cancel()
}, [])
```

### 2. Request/Response Transformation

**Transform request data:**
```javascript
api.interceptors.request.use(config => {
  // Convert dates to ISO strings
  if (config.data?.date) {
    config.data.date = config.data.date.toISOString()
  }
  return config
})
```

**Transform response data:**
```javascript
api.interceptors.response.use(response => {
  // Convert ISO strings to Date objects
  if (response.data?.createdAt) {
    response.data.createdAt = new Date(response.data.createdAt)
  }
  return response
})
```

### 3. Request Retry Logic (Beyond Token Refresh)

**Retry on network errors:**
```javascript
api.interceptors.response.use(null, async error => {
  const config = error.config

  if (!config || !config.retry) return Promise.reject(error)

  config.retryCount = config.retryCount || 0

  if (config.retryCount >= config.retry) {
    return Promise.reject(error)
  }

  config.retryCount += 1

  const backoff = new Promise(resolve => {
    setTimeout(() => resolve(), config.retryDelay || 1000)
  })

  await backoff
  return api(config)
})

// Usage
api.get('/api/posts', { retry: 3, retryDelay: 1000 })
```

### 4. Request Logging/Analytics

**Log all requests:**
```javascript
api.interceptors.request.use(config => {
  console.log(`[${new Date().toISOString()}] ${config.method.toUpperCase()} ${config.url}`)

  // Send to analytics
  analytics.track('api_request', {
    method: config.method,
    url: config.url,
    timestamp: Date.now()
  })

  return config
})
```

**Track response times:**
```javascript
api.interceptors.request.use(config => {
  config.metadata = { startTime: Date.now() }
  return config
})

api.interceptors.response.use(response => {
  const duration = Date.now() - response.config.metadata.startTime
  console.log(`Request to ${response.config.url} took ${duration}ms`)

  if (duration > 3000) {
    analytics.track('slow_request', {
      url: response.config.url,
      duration
    })
  }

  return response
})
```

### 5. Global Loading State

**With React Context:**
```javascript
// LoadingContext.js
export const LoadingContext = React.createContext()

// api.js
let activeRequests = 0

api.interceptors.request.use(config => {
  activeRequests++
  loadingContextSetState(true)
  return config
})

api.interceptors.response.use(
  response => {
    activeRequests--
    if (activeRequests === 0) {
      loadingContextSetState(false)
    }
    return response
  },
  error => {
    activeRequests--
    if (activeRequests === 0) {
      loadingContextSetState(false)
    }
    return Promise.reject(error)
  }
)
```

---

## Code Quality & Best Practices

### 1. Interceptor Organization

**Good:**
```javascript
// api.js - Clear sections
const api = axios.create({ ... })

// Request Interceptor
api.interceptors.request.use(...)

// Response Interceptor
api.interceptors.response.use(...)

export default api
```

**Better:**
```javascript
// api.js
const api = axios.create({ ... })

// interceptors/auth.js
export const authRequestInterceptor = config => { ... }

// interceptors/errorHandler.js
export const errorResponseInterceptor = error => { ... }

// api.js
api.interceptors.request.use(authRequestInterceptor)
api.interceptors.response.use(null, errorResponseInterceptor)
```

**Benefits:**
- Testable in isolation
- Reusable across instances
- Easier to understand

### 2. Error Handling Hierarchy

**Priority:**
1. Specific errors (401, 403, 404)
2. HTTP errors (4xx, 5xx)
3. Network errors
4. Unknown errors

**Implementation:**
```javascript
api.interceptors.response.use(null, async error => {
  // 1. Token refresh (401)
  if (error.response?.status === 401) {
    return handleTokenRefresh(error)
  }

  // 2. Permission error (403)
  if (error.response?.status === 403) {
    return handlePermissionError(error)
  }

  // 3. HTTP errors
  if (error.response) {
    return handleHttpError(error)
  }

  // 4. Network errors
  if (error.request) {
    return handleNetworkError(error)
  }

  // 5. Unknown
  return handleUnknownError(error)
})
```

### 3. Configuration Management

**Environment-based:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'
const TIMEOUT = process.env.REACT_APP_TIMEOUT || 10000

const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
})
```

**Benefits:**
- Different settings for dev/staging/prod
- Easy to configure
- No hardcoded values

---

## Common Pitfalls & Solutions

### 1. Infinite Loop with Refresh

**Problem:**
```javascript
// Using api instance to call refresh endpoint
const response = await api.post('/api/auth/refresh-token', ...)
// Interceptors run again → 401 → Refresh again → Loop!
```

**Solution:**
```javascript
// Use plain axios (no interceptors)
const response = await axios.post(`${API_URL}/api/auth/refresh-token`, ...)
```

### 2. Not Returning Config

**Problem:**
```javascript
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer token'
  // Forgot to return! Request won't be sent
})
```

**Solution:**
```javascript
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer token'
  return config // Must return!
})
```

### 3. Not Resetting isRefreshing Flag

**Problem:**
```javascript
try {
  const response = await refreshToken()
  // Success
} catch (error) {
  // Error
}
// Forgot: isRefreshing = false
// Now stuck, no more refreshes possible
```

**Solution:**
```javascript
try {
  const response = await refreshToken()
  isRefreshing = false
} catch (error) {
  isRefreshing = false // Reset in both paths!
}
```

### 4. Not Handling Network Errors

**Problem:**
```javascript
api.interceptors.response.use(null, error => {
  // Only handles error.response (HTTP errors)
  const message = error.response.data.error
  // Crashes on network error (no response)!
})
```

**Solution:**
```javascript
api.interceptors.response.use(null, error => {
  const message = error.response?.data?.error || 'Network error'
  // Optional chaining handles missing response
})
```

### 5. Mutating Original Config

**Problem:**
```javascript
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer token'
  return config
})
// Config mutated, might affect retries
```

**Solution (if needed):**
```javascript
api.interceptors.request.use(config => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: 'Bearer token'
    }
  }
})
// New object, original unchanged
```

**Note:** For our use case, mutation is fine and more efficient.

---

## Extension Ideas for Advanced Students

### 1. Add Request Timeout Handling
- Set timeout per request
- Show timeout error message
- Retry on timeout

### 2. Implement Request Deduplication
- Prevent duplicate simultaneous requests
- Cache responses
- Return cached data

### 3. Add Offline Detection
- Check navigator.onLine
- Queue requests when offline
- Retry when back online

### 4. Create Request/Response Logger
- Log all API calls
- Track timing
- Export logs for debugging

### 5. Implement Rate Limiting
- Limit requests per second
- Queue excess requests
- Prevent API throttling

### 6. Add Circuit Breaker Pattern
- Track failure rate
- Open circuit after N failures
- Close after cooldown period

### 7. Create Axios DevTools
- Visual request/response viewer
- Interactive request builder
- Real-time monitoring

---

## Testing Strategies

### Unit Testing Interceptors

```javascript
import api from './api'
import MockAdapter from 'axios-mock-adapter'

describe('Request Interceptor', () => {
  it('should add authorization header', async () => {
    const mock = new MockAdapter(api)
    localStorage.setItem('accessToken', 'test-token')

    mock.onGet('/api/posts').reply(config => {
      expect(config.headers.Authorization).toBe('Bearer test-token')
      return [200, { posts: [] }]
    })

    await api.get('/api/posts')
  })
})

describe('Token Refresh', () => {
  it('should refresh token on 401', async () => {
    const mock = new MockAdapter(api)

    // First request fails
    mock.onGet('/api/posts').replyOnce(401)

    // Refresh succeeds
    mock.onPost('/api/auth/refresh-token').replyOnce(200, {
      accessToken: 'new-token',
      refreshToken: 'new-refresh'
    })

    // Retry succeeds
    mock.onGet('/api/posts').replyOnce(200, { posts: [] })

    const result = await api.get('/api/posts')
    expect(result.data.posts).toEqual([])
  })
})
```

---

## Summary Comparison

### Before Interceptors:
❌ Manual token in every function
❌ No automatic token refresh
❌ 66 lines in postsService
❌ Code duplication
❌ Easy to forget token
❌ Inconsistent error handling
❌ Component handles errors individually

### After Interceptors:
✅ Automatic token injection
✅ Automatic token refresh
✅ 31 lines in postsService (-53%)
✅ DRY principle
✅ Impossible to forget token
✅ Consistent error formatting
✅ Transparent retry on token refresh
✅ Queue management for race conditions
✅ Graceful session expiration
✅ Centralized auth logic

---

## Key Takeaways

This project teaches:
- ✅ Axios interceptor pattern (middleware)
- ✅ Request transformation and enrichment
- ✅ Response error handling
- ✅ Automatic JWT token injection
- ✅ Token refresh mechanism
- ✅ Race condition prevention (queue)
- ✅ Retry logic
- ✅ Global error formatting
- ✅ Session expiration handling
- ✅ Code organization and DRY principle

**Real-world value:**
- Industry-standard pattern
- Production-ready authentication
- Scalable architecture
- Better developer experience
- More maintainable code

**Next steps:**
- Request deduplication
- Offline support
- Rate limiting
- Analytics integration
- Advanced error handling
