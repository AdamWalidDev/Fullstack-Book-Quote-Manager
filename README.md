
# Fullstack Book & Quote Manager

Formerly known as "RedRiverTest.Api"

This project is a fullstack application for managing books and quotes. It features user authentication, book management, citation/quote management, and a modern Angular frontend.

## Features
- User registration and login
- Add, edit, and delete books
- Manage and organize quotes/citations
- Responsive UI with Angular

## Live Demo
- [Vercel Deployment](<your-vercel-link>)
- [Render Deployment](<your-render-link>)

## Repository
- [GitHub Repository](https://github.com/AdamWalid-hustler/Fullstack-Book-Quote-Manager)

---

Feel free to update the links above with your actual deployment and repository URLs.

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
RedRiverTest.Api/               # .NET 9 Web API
├── Controllers/
│   ├── AuthController.cs       # Register & login endpoints
│   ├── BooksController.cs      # Book CRUD (all users)
│   └── CitationsController.cs  # Citation CRUD (per user)
├── Models/
│   ├── Book.cs
│   └── Citation.cs
├── Auth/                       # JWT options, token service, user store
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
| `Jwt__Issuer`       | `RedRiverTest`                    |
| `Jwt__Audience`     | `RedRiverTest`                    |
| `AllowedOrigins__0` | Your frontend URL                 |
