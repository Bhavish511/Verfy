# For NOTIFICATION SEARCH IN PROJECT
  "//* " ---> # The all notification were implementation were shown 



# 🚀 Complete API Documentation

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Member APIs](#member-apis)
3. [Sub-member APIs](#sub-member-apis)
4. [Transaction APIs](#transaction-apis)
5. [Flag Charge APIs](#flag-charge-apis)
6. [EOV (End of Visit) APIs](#eov-end-of-visit-apis)
7. [Feedback APIs](#feedback-apis)
8. [Club APIs](#club-apis)
9. [Finance APIs](#finance-apis)
10. [Expense APIs](#expense-apis)
11. [JSON Server APIs](#json-server-apis)

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "fullname": "John Doe",
      "email": "john.doe@example.com",
      "roles": "member",
      "currently_at": "1"
    }
  }
}
```

### Complete Login (with club selection)
```http
POST /auth/complete-login
Content-Type: application/json

{
  "userId": "1",
  "clubId": "1"
}
```

### Forget Password
```http
POST /auth/forget-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Update Profile
```http
PATCH /auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "John Smith",
  "phone": "+1-555-0123"
}
```

---

## 👤 Member APIs

### Get Member Dashboard
```http
GET /member/get-dashboard
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "user": {
      "id": "1",
      "fullname": "John Doe",
      "email": "john.doe@example.com",
      "roles": "member",
      "currently_at": "1"
    },
    "currentClub": {
      "id": "1",
      "name": "Tech Innovators Club",
      "location": "New York"
    },
    "clubs": [
      {
        "id": "1",
        "name": "Tech Innovators Club",
        "location": "New York"
      }
    ],
    "summary": {
      "totalSpent": 1200,
      "totalAllowance": 3000,
      "remainingAllowance": 1800,
      "pendingApprovals": 3
    },
    "recentPendingTransactions": [
      {
        "id": "16",
        "bill": 75,
        "category": "Food",
        "description": "Lunch with friends",
        "date": "2024-01-28T12:30:00.000Z"
      }
    ],
    "subMembers": [
      {
        "id": "012d",
        "fullname": "mosab",
        "email": "mosab@gmail.com",
        "allowance": 1500,
        "totalSpent": 450,
        "remainingAllowance": 1050
      }
    ]
  }
}
```

### Get Member Dashboard Summary
```http
GET /member/get-dashboard-summary?period=daily
Authorization: Bearer <member_token>
```

### Get Member Dashboard View
```http
GET /member/dashboard-view?view=daily
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard view retrieved successfully",
  "data": {
    "view": "Daily",
    "period": {
      "name": "Daily",
      "startDate": "2024-01-28",
      "endDate": "2024-01-28"
    },
    "totalSpent": 650,
    "transactionCount": 8,
    "userRole": "member"
  }
}
```

### Switch Club
```http
POST /member/switch-club/2
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Club switched successfully",
  "data": {
    "currentClub": {
      "id": "2",
      "name": "Business Leaders Network",
      "location": "San Francisco"
    },
    "user": {
      "id": "1",
      "fullname": "John Doe",
      "currently_at": "2"
    }
  }
}
```

---

## 👥 Sub-member APIs

### Register Sub-member
```http
POST /submember/register
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "fullname": "Jane Doe",
  "email": "jane.doe@example.com",
  "allowance": 1000
}
```

### Get Sub-member Dashboard
```http
GET /submember/get-dashboard
Authorization: Bearer <submember_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-member dashboard retrieved successfully",
  "data": {
    "user": {
      "id": "012d",
      "fullname": "mosab",
      "email": "mosab@gmail.com",
      "roles": "submember",
      "parentId": "1",
      "currently_at": "1"
    },
    "currentClub": {
      "id": "1",
      "name": "Tech Innovators Club",
      "location": "New York"
    },
    "summary": {
      "totalSpent": 450,
      "totalAllowance": 1500,
      "remainingAllowance": 1050,
      "pendingApprovals": 2
    },
    "recentTransactions": [
      {
        "id": "16",
        "bill": 75,
        "category": "Food",
        "status": "pending",
        "description": "Lunch with friends",
        "date": "2024-01-28T12:30:00.000Z"
      }
    ]
  }
}
```

### Get Sub-member Dashboard View
```http
GET /submember/dashboard-view?view=weekly
Authorization: Bearer <submember_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard view retrieved successfully",
  "data": {
    "view": "Weekly",
    "period": {
      "name": "Weekly",
      "startDate": "2024-01-21",
      "endDate": "2024-01-28"
    },
    "totalSpent": 1200,
    "transactionCount": 15,
    "userRole": "submember"
  }
}
```

### Get All Sub-members (Member only)
```http
GET /submember/get-all
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-members in current club (1)",
  "data": {
    "currentClub": "1",
    "users": [
      {
        "id": "012d",
        "fullname": "mosab",
        "email": "mosab@gmail.com",
        "allowance": 1500,
        "totalSpent": 450,
        "remainingAllowance": 1050
      }
    ]
  }
}
```

### Edit Sub-member Allowance
```http
POST /submember/edit-allowance/012d
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "allowance": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-member allowance updated successfully",
  "data": {
    "subMember": {
      "id": "012d",
      "fullname": "mosab",
      "allowance": 2000
    },
    "finance": {
      "totalAllowance": 2000,
      "totalSpent": 450,
      "remainingAllowance": 1550
    },
    "previousAllowance": 1500
  }
}
```

### Remove Sub-member
```http
POST /submember/remove-sub-member/012d
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-member removed successfully",
  "data": {
    "removedSubMember": {
      "id": "012d",
      "fullname": "mosab",
      "email": "mosab@gmail.com"
    },
    "cleanupSummary": {
      "invitationCodesDeleted": 1,
      "userClubsDeleted": 1,
      "dailyExpensesDeleted": 5,
      "financeDeleted": true
    }
  }
}
```

### Switch Club (Sub-member)
```http
POST /submember/switch-club/2
Authorization: Bearer <submember_token>
```

### Validate Invitation Code
```http
POST /submember/validate-invitation-code
Content-Type: application/json

{
  "invitationCode": "INV123456"
}
```

---

## 💳 Transaction APIs

### Create Transaction
```http
POST /transaction/create-transaction/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Food",
  "bill": 50
}
```

### Get Transactions for Sub-member
```http
GET /transaction/get-transactions-for-sub-member
Authorization: Bearer <submember_token>
```

### Get Transactions for Member
```http
GET /transaction/get-transactions-for-member
Authorization: Bearer <member_token>
```

### Get Transaction Feed
```http
GET /transaction/transaction-feed
Authorization: Bearer <token>
```

### Get Filtered Transaction Feed
```http
GET /transaction/transaction-feed/filtered?status=pending&category=Food&subMemberId=012d&dateRange=last7days
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction feed retrieved successfully",
  "data": {
    "transactionsByDay": [
      {
        "date": "2024-01-28",
        "transactions": [
          {
            "id": "16",
            "clubId": "1",
            "bill": 75,
            "userId": "012d",
            "memberId": "1",
            "category": "Food",
            "status": "pending",
            "verifyCharge": false,
            "flagChargeId": null,
            "description": "Lunch with friends",
            "date": "2024-01-28T12:30:00.000Z"
          }
        ],
        "totalSpent": 75
      }
    ],
    "totalTransactions": 1,
    "totalSpent": 75,
    "filtersApplied": 4,
    "appliedFilters": ["status", "category", "subMemberId", "dateRange"]
  }
}
```

### Verify Charge
```http
PATCH /transaction/verify-charge/16
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Charge verified successfully"
}
```

---

## 🚩 Flag Charge APIs

### Create Flag Charge
```http
POST /flag-charge/16
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "reasons": ["Suspicious amount", "Unusual location"],
  "comment": "This transaction seems suspicious",
  "file": <optional_file_upload>
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flag charge created successfully",
  "data": {
    "id": "flag_001",
    "transactionId": "16",
    "reasons": ["Suspicious amount", "Unusual location"],
    "comment": "This transaction seems suspicious",
    "file": "uploads/evidence_20240128.pdf",
    "severity": "medium",
    "createdAt": "2024-01-28T16:30:00.000Z"
  }
}
```

### Get Flag Charges
```http
GET /flag-charge
Authorization: Bearer <token>
```

### Get Flag Charge by ID
```http
GET /flag-charge/flag_001
Authorization: Bearer <token>
```

### Update Flag Charge
```http
PATCH /flag-charge/flag_001
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Updated comment",
  "severity": "high"
}
```

### Delete Flag Charge
```http
DELETE /flag-charge/flag_001
Authorization: Bearer <token>
```

---

## 📊 EOV (End of Visit) APIs

### Get EOV Dashboard
```http
GET /eov/dashboard
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "flaggedChargeCount": 2,
    "totalSpending": 3200,
    "totalAllowance": 5000,
    "flaggedTransactions": [
      {
        "id": "16",
        "bill": 75,
        "category": "Food",
        "flagChargeId": "flag_001"
      }
    ]
  }
}
```

### Get EOV Summary
```http
GET /eov/summary?period=monthly
Authorization: Bearer <member_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Summary report generated successfully",
  "data": {
    "period": {
      "name": "Monthly",
      "startDate": "2024-01-01",
      "endDate": "2024-01-28"
    },
    "summary": {
      "totalTransactions": 45,
      "totalSpending": 3200,
      "totalAllowance": 5000,
      "flaggedChargeCount": 2,
      "flaggedTransactions": 2
    },
    "breakdown": {
      "categories": {
        "Food": 1400,
        "Entertainment": 1000,
        "Transportation": 800
      },
      "status": {
        "approved": 35,
        "pending": 10
      },
      "timeBased": [
        {
          "date": "2024-01",
          "transactions": 45,
          "totalSpent": 3200,
          "categories": {
            "Food": 1400,
            "Entertainment": 1000,
            "Transportation": 800
          },
          "status": {
            "approved": 35,
            "pending": 10
          },
          "flaggedCount": 2
        }
      ]
    },
    "verifiedSpends": {
      "count": 35,
      "totalAmount": 2800,
      "transactions": [...]
    },
    "flaggedCharges": {
      "count": 2,
      "totalAmount": 150,
      "transactions": [...]
    },
    "clubAndMemberBreakdown": {
      "club": {
        "id": "1",
        "name": "Tech Innovators Club",
        "location": "New York"
      },
      "member": {
        "id": "1",
        "fullname": "John Doe",
        "email": "john.doe@example.com",
        "roles": "member",
        "finance": {
          "totalAllowance": 3000,
          "totalSpent": 1200,
          "remainingAllowance": 1800
        },
        "transactions": {
          "count": 20,
          "totalSpent": 1200,
          "verified": 18,
          "flagged": 1
        }
      },
      "subMembers": [
        {
          "subMember": {
            "id": "012d",
            "fullname": "mosab",
            "email": "mosab@gmail.com",
            "roles": "submember"
          },
          "finance": {
            "totalAllowance": 2000,
            "totalSpent": 450,
            "remainingAllowance": 1550
          },
          "transactions": {
            "count": 25,
            "totalSpent": 2000,
            "verified": 17,
            "flagged": 1
          }
        }
      ],
      "totals": {
        "totalAllowance": 5000,
        "totalSpent": 3200,
        "totalTransactions": 45,
        "totalVerified": 35,
        "totalFlagged": 2
      }
    },
    "subMembers": [
      {
        "id": "012d",
        "fullname": "mosab",
        "email": "mosab@gmail.com"
      }
    ]
  }
}
```

### Export PDF Report
```http
POST /eov/export-pdf?period=weekly
Authorization: Bearer <member_token>
```

**Response:** PDF file download

### Send Email Report
```http
POST /eov/send-email
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "period": "monthly",
  "autoSend": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email report sent automatically",
  "data": {
    "recipient": "john.doe@example.com",
    "period": {
      "name": "Monthly",
      "startDate": "2024-01-01",
      "endDate": "2024-01-28"
    },
    "sentAt": "2024-01-28T16:30:00.000Z",
    "emailId": "email_1706455800000_abc123def",
    "autoSent": true
  }
}
```

---

## 💬 Feedback APIs

### Submit Feedback
```http
POST /feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "stars": 5,
  "feedbackText": ["Great service", "Fast response", "User-friendly interface"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "feedback_001",
    "stars": 5,
    "feedbackText": ["Great service", "Fast response", "User-friendly interface"],
    "submittedAt": "2024-01-28T16:30:00.000Z"
  }
}
```

### Get All Feedbacks
```http
GET /feedback
Authorization: Bearer <token>
```

### Get Feedback by ID
```http
GET /feedback/feedback_001
Authorization: Bearer <token>
```

### Update Feedback
```http
PATCH /feedback/feedback_001
Authorization: Bearer <token>
Content-Type: application/json

{
  "stars": 4,
  "feedbackText": ["Good service", "Could be faster"]
}
```

### Delete Feedback
```http
DELETE /feedback/feedback_001
Authorization: Bearer <token>
```

---

## 🏢 Club APIs

### Get All Clubs
```http
GET /clubs
Authorization: Bearer <token>
```

### Get Club by ID
```http
GET /clubs/1
Authorization: Bearer <token>
```

### Create Club
```http
POST /clubs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Club",
  "location": "Chicago",
  "description": "A new club for members"
}
```

### Update Club
```http
PATCH /clubs/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Club Name",
  "location": "Updated Location"
}
```

### Delete Club
```http
DELETE /clubs/1
Authorization: Bearer <token>
```

---

## 💰 Finance APIs

### Get Finance Data
```http
GET /finance
Authorization: Bearer <token>
```

### Create Finance Record
```http
POST /finance
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalAllowance": 3000,
  "totalSpent": 0
}
```

### Update Finance Record
```http
PATCH /finance/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalAllowance": 3500,
  "totalSpent": 1200
}
```

### Delete Finance Record
```http
DELETE /finance/1
Authorization: Bearer <token>
```

---

## 📝 Expense APIs

### Get All Expenses
```http
GET /expenses
Authorization: Bearer <token>
```

### Get Expense by ID
```http
GET /expenses/1
Authorization: Bearer <token>
```

### Create Expense
```http
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "money_spent": 50,
  "userId": "1",
  "description": "Lunch expense"
}
```

### Update Expense
```http
PATCH /expenses/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "money_spent": 60,
  "description": "Updated lunch expense"
}
```

### Delete Expense
```http
DELETE /expenses/1
Authorization: Bearer <token>
```

---

## 🗄️ JSON Server APIs

### Get All Users
```http
GET /json-server/users
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /json-server/users/1
Authorization: Bearer <token>
```

### Create User
```http
POST /json-server/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "New User",
  "email": "newuser@example.com",
  "roles": "member"
}
```

### Update User
```http
PATCH /json-server/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "Updated Name",
  "email": "updated@example.com"
}
```

### Delete User
```http
DELETE /json-server/users/1
Authorization: Bearer <token>
```

---

## 🔧 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "Bad Request"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access
- **Member**: Can access member-specific routes and manage sub-members
- **Sub-member**: Can access sub-member-specific routes only
- **Admin**: Can access all routes (if implemented)

### Protected Routes
All routes except login and public endpoints require authentication.

---

## 📊 Query Parameters

### Common Query Parameters
- `page`: Page number for pagination
- `limit`: Number of items per page
- `sort`: Sort field
- `order`: Sort order (asc/desc)
- `search`: Search term
- `filter`: Filter criteria

### Time-based Parameters
- `period`: daily, weekly, monthly
- `view`: daily, weekly, monthly
- `dateRange`: last7days, thismonth, last3months, custom
- `fromDate`: Start date (YYYY-MM-DD)
- `toDate`: End date (YYYY-MM-DD)

### Transaction Filter Parameters
- `status`: pending, approved, refused, failed
- `category`: Food, Entertainment, Transportation, etc.
- `subMemberId`: Filter by specific sub-member
- `clubId`: Filter by specific club

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## 📝 Notes

1. **Base URL**: `http://localhost:3000`
2. **Content-Type**: `application/json` for most requests
3. **File Uploads**: Use `multipart/form-data` for file uploads
4. **Date Format**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
5. **Currency**: All amounts are in the base currency unit
6. **Timezone**: All dates are in UTC

---

## 🔄 Rate Limiting

- **General APIs**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **File Uploads**: 5 requests per minute

---

## 📱 Mobile Considerations

- All APIs are mobile-friendly
- Lightweight responses for dashboard views
- Optimized for mobile data usage
- Support for offline scenarios (where applicable)

---

*This documentation covers all available APIs in the project. For updates or additional information, please refer to the latest version.*
