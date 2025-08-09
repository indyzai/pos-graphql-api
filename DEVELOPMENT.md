# DEVELOPMENT.md

## Project Setup & Development Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- PostgreSQL database (or your configured DB)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) (installed via npm)

---

### 2. Environment Variables
- Copy `.env.example` to `.env` and fill in your database and secret values:
  - `DATABASE_URL=postgresql://user:password@host:port/dbname`
  - `JWT_SECRET=your_jwt_secret`
  - (Add any SMTP, SMS, or WhatsApp API keys as needed)

---

### 3. Install Dependencies
```sh
npm install
```

---

### 4. Database Setup & Prisma

#### a. Run Migrations
```sh
npx prisma migrate dev --name init
```
- This will apply all migrations and create the database schema.

#### b. Generate Prisma Client
```sh
npx prisma generate
```
- Run this after any schema change.

#### c. Open Prisma Studio (DB GUI)
```sh
npx prisma studio
```

#### d. Seed Data (if you have a seed script)
```sh
npm run seed
```

---

### 5. Running the Server

#### a. Development Mode (with hot reload)
```sh
npm run dev
```
- Uses `ts-node` to run `src/index.ts`.

#### b. Production Build
```sh
npm run build
npm start
```
- Compiles TypeScript to `dist/` and runs with Node.js.

---

### 6. Testing

#### a. Run Jest Tests
```sh
npm test
```

#### b. HTTP/GraphQL API Tests
- Use `src/tests/graphql.http` with VSCode REST Client or Thunder Client.
- Tokens are auto-captured and reused for authenticated requests.

---

### 7. Code Structure
- `src/modules/` – Modular domain logic (user, org, billing, etc.)
- `src/db/` – Prisma client
- `src/graphql/` – Schema composition, context, server
- `src/services/` – Notification/email/SMS integrations
- `src/auth/` – Auth logic
- `src/tests/` – Integration and HTTP tests
- `prisma/` – Schema and migrations

---

### 8. Common Development Tasks
- **Add a new model:**
  1. Update `prisma/schema.prisma`
  2. Run `npx prisma migrate dev --name add_model`
  3. Run `npx prisma generate`
- **Add a new module:**
  1. Create a folder in `src/modules/`
  2. Add schema, resolver, service, and types as needed
  3. Import and merge in `src/graphql/schema.ts`
- **Update environment variables:**
  1. Edit `.env`
  2. Restart the server if needed

---

### 9. Useful Commands
- **Format code:**
  ```sh
  npm run format
  ```
- **Lint code:**
  ```sh
  npm run lint
  ```
- **Check types:**
  ```sh
  npm run typecheck
  ```

---

### 10. Troubleshooting
- **Prisma errors:**
  - Ensure the database is running and `DATABASE_URL` is correct.
  - Run `npx prisma generate` after schema changes.
- **Token/auth errors:**
  - Ensure you’re using the correct JWT secret and tokens in requests.
- **Module import errors:**
  - Check for typos and correct relative paths.

---

### 11. Contributing
- Use feature branches and PRs for new features.
- Write tests for new modules and flows.
- Keep documentation up to date.

---

For any questions, contact the backend team or check the README for API usage examples. 