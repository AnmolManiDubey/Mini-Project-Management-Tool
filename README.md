
# Project Management System

A full-stack **Project & Task Management System** built with **Django + GraphQL + PostgreSQL** on the backend and **React + TypeScript + Apollo Client** on the frontend.

This application supports **organization-based multi-tenancy**, project tracking, task workflows, and team collaboration through comments.

---

## 🚀 Tech Stack

### Backend
- Python 3
- Django
- Graphene-Django (GraphQL)
- PostgreSQL
- django-cors-headers

### Frontend
- React (Vite)
- TypeScript
- Apollo Client
- React Router

---

## ✅ Core Features

### 🔹 Backend
- Organization-based multi-tenancy (`X-ORG-SLUG` header)
- Project, Task, and Comment models
- GraphQL API with queries & mutations
- Task status updates
- Automatic task completion tracking
- PostgreSQL database integration

### 🔹 Frontend
- Projects dashboard
- Project detail page with tasks & comments
- Create new projects
- Create tasks within projects
- Update task status (TODO → IN_PROGRESS → DONE)
- Add comments to tasks
- Responsive, production-style UI
- Accessibility & cross-browser support

---

## 🧠 Architecture

```

React + Apollo Client
↓
GraphQL API (Django)
↓
Django ORM
↓
PostgreSQL

````

- Single `/graphql/` endpoint
- Header-based organization isolation
- Clean separation of frontend & backend

---

## ⚙️ Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
````

GraphQL Playground:

```
http://localhost:8000/graphql/
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App:

```
http://localhost:5173
```

---

## 🔐 Multi-Tenant Header

All API requests use:

```
X-ORG-SLUG: Kav
```

---

## 👨‍💻 Author

**Anmol Mani Dubey**
Final Year Engineering Student | AI & Data Science | Full-Stack Developer
