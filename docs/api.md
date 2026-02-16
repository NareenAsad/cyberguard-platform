# API Documentation

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.cyberguard.com/v1
```

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Token Expiry
- Access Token: 15 minutes
- Refresh Token: 7 days

---

## Authentication Endpoints

### Register User

```http
POST /api/v1/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "role": "security_analyst"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "security_analyst",
      "created_at": "2025-02-16T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

### Login

```http
POST /api/v1/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "security_analyst"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**:
- `401 Unauthorized`: Invalid credentials

---

### Refresh Token

```http
POST /api/v1/auth/refresh
```

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout

```http
POST /api/v1/auth/logout
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## Asset Management Endpoints

### Get All Assets

```http
GET /api/v1/assets
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by asset type
- `criticality` (optional): Filter by criticality level
- `search` (optional): Search by name or description

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "uuid-here",
        "name": "Web Server 01",
        "type": "server",
        "description": "Production web server",
        "ip_address": "192.168.1.10",
        "hostname": "web-server-01.company.com",
        "operating_system": "Ubuntu 22.04",
        "software": [
          {
            "name": "Apache HTTP Server",
            "version": "2.4.52",
            "cpe": "cpe:2.3:a:apache:http_server:2.4.52"
          }
        ],
        "criticality": "high",
        "owner": "IT Team",
        "vulnerabilities_count": 3,
        "created_at": "2025-01-15T08:00:00Z",
        "updated_at": "2025-02-10T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    }
  }
}
```

---

### Get Single Asset

```http
GET /api/v1/assets/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Web Server 01",
    "type": "server",
    "description": "Production web server",
    "ip_address": "192.168.1.10",
    "hostname": "web-server-01.company.com",
    "operating_system": "Ubuntu 22.04",
    "software": [...],
    "criticality": "high",
    "owner": "IT Team",
    "vulnerabilities": [
      {
        "cve_id": "CVE-2024-12345",
        "severity": "high",
        "cvss_score": 8.2,
        "description": "Buffer overflow vulnerability",
        "affected_software": "Apache HTTP Server 2.4.52"
      }
    ],
    "recent_alerts": [
      {
        "id": "alert-uuid",
        "severity": "high",
        "created_at": "2025-02-15T10:00:00Z"
      }
    ],
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-02-10T14:30:00Z"
  }
}
```

**Errors**:
- `404 Not Found`: Asset not found

---

### Create Asset

```http
POST /api/v1/assets
```

**Request Body**:
```json
{
  "name": "Database Server 02",
  "type": "database",
  "description": "Customer database server",
  "ip_address": "192.168.1.25",
  "hostname": "db-server-02.company.com",
  "operating_system": "CentOS 8",
  "software": [
    {
      "name": "PostgreSQL",
      "version": "14.5",
      "cpe": "cpe:2.3:a:postgresql:postgresql:14.5"
    }
  ],
  "criticality": "critical",
  "owner": "Database Team"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-here",
    "name": "Database Server 02",
    ...
  },
  "message": "Asset created successfully"
}
```

**Errors**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Asset with same IP/hostname exists

---

### Update Asset

```http
PUT /api/v1/assets/:id
```

**Request Body**: (Same as Create, all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Database Server 02 - Updated",
    ...
  },
  "message": "Asset updated successfully"
}
```

---

### Delete Asset

```http
DELETE /api/v1/assets/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

### Bulk Import Assets

```http
POST /api/v1/assets/import
Content-Type: multipart/form-data
```

**Request Body**:
```
file: assets.csv (CSV file)
```

**CSV Format**:
```csv
name,type,ip_address,hostname,operating_system,criticality,owner
Web Server 01,server,192.168.1.10,web-01.company.com,Ubuntu 22.04,high,IT Team
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "imported": 50,
    "failed": 2,
    "errors": [
      {
        "row": 15,
        "error": "Invalid IP address format"
      }
    ]
  },
  "message": "Import completed with 50 successes and 2 failures"
}
```

---

## Alert Management Endpoints

### Get All Alerts

```http
GET /api/v1/alerts
```

**Query Parameters**:
- `page`, `limit`: Pagination
- `severity`: Filter by severity (critical, high, medium, low)
- `status`: Filter by status (open, investigating, resolved, false_positive)
- `assigned_to`: Filter by assigned user ID
- `date_from`, `date_to`: Date range filter

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-uuid",
        "title": "Critical Vulnerability Detected in Web Server",
        "severity": "critical",
        "risk_score": 92,
        "status": "open",
        "threat_type": "vulnerability",
        "cve_id": "CVE-2024-12345",
        "affected_assets": [
          {
            "id": "asset-uuid",
            "name": "Web Server 01"
          }
        ],
        "indicators": {
          "type": "cve",
          "value": "CVE-2024-12345",
          "source": "nvd"
        },
        "mitre_attack": {
          "tactic": "Initial Access",
          "technique": "T1190 - Exploit Public-Facing Application"
        },
        "assigned_to": null,
        "created_at": "2025-02-16T09:00:00Z",
        "updated_at": "2025-02-16T09:00:00Z"
      }
    ],
    "pagination": {...},
    "statistics": {
      "total_alerts": 150,
      "critical": 12,
      "high": 35,
      "medium": 68,
      "low": 35,
      "open": 87,
      "investigating": 23,
      "resolved": 40
    }
  }
}
```

---

### Get Single Alert

```http
GET /api/v1/alerts/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "title": "Critical Vulnerability Detected",
    "description": "CVE-2024-12345 affects Apache HTTP Server 2.4.52",
    "severity": "critical",
    "risk_score": 92,
    "status": "open",
    "threat_details": {
      "cve_id": "CVE-2024-12345",
      "cvss_score": 9.8,
      "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "exploit_available": true,
      "public_exploit_url": "https://exploit-db.com/...",
      "vendor_advisory": "https://..."
    },
    "affected_assets": [...],
    "indicators": {...},
    "mitre_attack": {...},
    "timeline": [
      {
        "timestamp": "2025-02-16T09:00:00Z",
        "event": "Alert created",
        "user": "system"
      },
      {
        "timestamp": "2025-02-16T09:15:00Z",
        "event": "Assigned to John Doe",
        "user": "admin@company.com"
      }
    ],
    "notes": [],
    "assigned_to": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@company.com"
    },
    "created_at": "2025-02-16T09:00:00Z",
    "updated_at": "2025-02-16T09:15:00Z"
  }
}
```

---

### Update Alert Status

```http
PUT /api/v1/alerts/:id/status
```

**Request Body**:
```json
{
  "status": "investigating",
  "note": "Starting investigation, assigned to security team"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "status": "investigating",
    "updated_at": "2025-02-16T10:00:00Z"
  },
  "message": "Alert status updated"
}
```

---

### Assign Alert

```http
PUT /api/v1/alerts/:id/assign
```

**Request Body**:
```json
{
  "assigned_to": "user-uuid"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Alert assigned successfully"
}
```

---

### Generate Incident Response Playbook

```http
POST /api/v1/alerts/:id/response
```

**Request Body** (optional):
```json
{
  "include_sections": ["investigation", "containment", "eradication", "recovery"],
  "organization_context": {
    "response_capabilities": ["firewall_rules", "user_disable"],
    "business_constraints": "Maintain 24/7 service availability"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "playbook_id": "playbook-uuid",
    "alert_id": "alert-uuid",
    "generated_at": "2025-02-16T10:30:00Z",
    "playbook": {
      "title": "Incident Response: CVE-2024-12345 in Web Server 01",
      "severity": "critical",
      "estimated_time": "2-4 hours",
      "sections": [
        {
          "phase": "investigation",
          "title": "Investigation Procedures",
          "steps": [
            {
              "step": 1,
              "action": "Verify vulnerability presence",
              "command": "apache2 -v",
              "expected_output": "Server version: Apache/2.4.52"
            },
            {
              "step": 2,
              "action": "Check for exploitation attempts",
              "command": "grep 'suspicious_pattern' /var/log/apache2/access.log"
            }
          ]
        },
        {
          "phase": "containment",
          "title": "Containment Strategies",
          "steps": [
            {
              "step": 1,
              "action": "Isolate affected server from internet",
              "command": "iptables -A INPUT -i eth0 -j DROP"
            }
          ]
        }
      ],
      "recommendations": [
        "Patch Apache to version 2.4.53 or later",
        "Review firewall rules to restrict unnecessary access"
      ]
    }
  }
}
```

---

### Add Note to Alert

```http
POST /api/v1/alerts/:id/notes
```

**Request Body**:
```json
{
  "note": "Confirmed exploitation attempts in logs. Patching in progress."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "note_id": "note-uuid",
    "author": "John Doe",
    "note": "Confirmed exploitation attempts...",
    "created_at": "2025-02-16T11:00:00Z"
  }
}
```

---

## Reporting Endpoints

### Get Available Reports

```http
GET /api/v1/reports
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-uuid",
        "title": "Weekly Security Summary - Feb 10-16, 2025",
        "type": "executive_summary",
        "date_range": {
          "start": "2025-02-10",
          "end": "2025-02-16"
        },
        "generated_by": "John Doe",
        "generated_at": "2025-02-16T17:00:00Z",
        "file_url": "/api/v1/reports/report-uuid/download"
      }
    ]
  }
}
```

---

### Generate Report

```http
POST /api/v1/reports/generate
```

**Request Body**:
```json
{
  "report_type": "executive_summary",
  "date_range": {
    "start": "2025-02-10",
    "end": "2025-02-16"
  },
  "include_sections": [
    "alert_summary",
    "risk_trends",
    "top_threats",
    "remediation_status"
  ],
  "format": "pdf"
}
```

**Report Types**:
- `executive_summary`: Business-focused overview
- `technical_report`: Detailed technical findings
- `compliance_report`: ISO 27001, NIST CSF alignment

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "report_id": "report-uuid",
    "status": "generating",
    "estimated_completion": "2025-02-16T17:05:00Z"
  },
  "message": "Report generation initiated"
}
```

---

### Download Report

```http
GET /api/v1/reports/:id/download
```

**Response** (200 OK):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="security-report-2025-02-16.pdf"

[Binary PDF data]
```

---

## Configuration Endpoints

### Get System Configuration

```http
GET /api/v1/config
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "threat_intelligence": {
      "polling_interval": 14400,
      "enabled_sources": ["nvd", "otx", "threatfox", "urlhaus", "abuseipdb"]
    },
    "risk_scoring": {
      "cvss_weight": 0.4,
      "exploit_weight": 0.2,
      "asset_criticality_weight": 0.2,
      "network_exposure_weight": 0.1,
      "data_sensitivity_weight": 0.1
    },
    "alerting": {
      "critical_threshold": 80,
      "high_threshold": 60,
      "medium_threshold": 40,
      "notification_channels": ["email", "dashboard"]
    },
    "integrations": {
      "siem_enabled": false,
      "webhook_url": null
    }
  }
}
```

---

### Update Configuration

```http
PUT /api/v1/config
```

**Request Body** (partial updates allowed):
```json
{
  "threat_intelligence": {
    "polling_interval": 7200
  },
  "alerting": {
    "notification_channels": ["email", "dashboard", "slack"]
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Configuration updated successfully"
}
```

---

## WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### New Alert
```javascript
socket.on('new_alert', (data) => {
  console.log('New alert:', data);
  // data structure: { id, title, severity, risk_score, ... }
});
```

#### Alert Updated
```javascript
socket.on('alert_updated', (data) => {
  console.log('Alert updated:', data);
  // data structure: { id, status, updated_at }
});
```

#### Threat Intelligence Update
```javascript
socket.on('threat_intelligence_update', (data) => {
  console.log('New threats:', data);
  // data structure: { count, threats: [...] }
});
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour per user
- **Unauthenticated requests**: 100 requests per hour per IP

**Response Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1708171200
```

---

## Pagination

All list endpoints support pagination:

```http
GET /api/v1/alerts?page=2&limit=50
```

**Response includes**:
```json
{
  "data": [...],
  "pagination": {
    "current_page": 2,
    "total_pages": 10,
    "total_items": 487,
    "items_per_page": 50,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## API Versioning

The API uses URL-based versioning:
- Current version: `/api/v1/`
- Future versions will use `/api/v2/`, etc.
- Old versions maintained for 6 months after new version release

---

**Version**: 1.0  
**Last Updated**: February 2025  
**Contact**: support@cyberguard.com
