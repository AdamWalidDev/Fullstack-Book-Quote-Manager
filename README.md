# Quotebook

**A fullstack book & quote manager** built with **.NET 9 Web API** and **Angular 20**.

Browse a shared book library and keep a personal collection of your favourite quotes. Includes JWT authentication, protected routes, per-user data, and a light/dark theme.

> Originally built as an internship technical assignment, later extended and rebranded with persistent users, hashed passwords, a one-click demo account, and UI polish.

## Live Demo

- **App:** https://bok-citathantering.vercel.app
- **API:** https://redriver-test-assignment.onrender.com

Click **Try the demo** on the login page — no sign-up needed (demo account: `demo` / `demo1234`).

> [!NOTE]
> The API runs on Render's free tier, so the first request after inactivity can take ~30 seconds while the server wakes up.

## Features

- User registration and login with **JWT** authentication
- Passwords hashed with ASP.NET Core `PasswordHasher` (PBKDF2 + salt)
- Shared book library: add, edit, and delete books
- Personal quote collection with inline editing (each user sees only their own)
- One-click demo account, seeded automatically on startup
- Route guards + HTTP interceptor for protected pages
- Responsive Bootstrap UI with light/dark theme

## Tech Stack

| Layer    | Technologies                                                   |
| -------- | -------------------------------------------------------------- |
| Backend  | .NET 9, ASP.NET Core Web API, EF Core, SQLite, JWT Bearer, Scalar |
| Frontend | Angular 20 (standalone components, signals), Bootstrap, Font Awesome |
| DevOps   | Docker, Render                                                 |

## Repository

- [GitHub Repository](https://github.com/AdamWalid-hustler/Fullstack-Book-Quote-Manager)

## Getting Started

### 1. Run the API

```bash
cd RedRiverTest.Api
dotnet run
```

The API starts on `http://localhost:5268`. In development, the Scalar API docs are available at `http://localhost:5268/scalar`.

### 2. Run the Angular client

```bash
cd client
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Project Structure

```
RedRiverTest.Api/               # .NET 9 Web API (folder name kept from the original assignment)
├── Controllers/
│   ├── AuthController.cs       # Register & login endpoints
│   ├── BooksController.cs      # Book CRUD (all users)
│   └── CitationsController.cs  # Quote CRUD (per user)
├── Models/
│   ├── Book.cs
│   ├── Citation.cs
│   └── User.cs
├── Auth/                       # JWT options, token service, DB user store (hashed passwords)
├── Data/
│   └── AppDbContext.cs         # EF Core context (SQLite)
├── Program.cs                  # App configuration & middleware
└── appsettings.json

client/                         # Angular 20 SPA
├── src/app/
│   ├── app.routes.ts           # Lazy-loaded route definitions
│   ├── guards/auth.guard.ts    # Route guard for protected pages
│   ├── interceptors/           # JWT HTTP interceptor
│   ├── services/               # Auth, book, citation, theme services
│   ├── home/                   # Book list page
│   ├── book-form/              # Add / edit book
│   ├── my-citations/           # Citation list with inline editing
│   ├── login/                  # Login page
│   └── register/               # Registration page
└── package.json
```

## Configuration

JWT settings are in `appsettings.Development.json` for local development. For production, set these as environment variables:

| Variable             | Description                       |
| -------------------- | --------------------------------- |
| `Jwt__SigningKey`    | A strong random 32+ character key |
| `Jwt__Issuer`       | `Quotebook`                       |
| `Jwt__Audience`     | `Quotebook`                       |
| `AllowedOrigins__0` | Your frontend URL                 |

For the deployed frontend, set `AllowedOrigins__0` to `https://bok-citathantering.vercel.app`
(without a path or trailing slash). In the Render dashboard, save environment changes with
**Save and deploy** so the running API uses them. The same origin is included in
`render.yaml` and the API's default configuration; localhost remains allowed for development.
