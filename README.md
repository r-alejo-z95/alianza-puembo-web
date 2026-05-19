[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/r-alejo-z95/alianza-puembo-web)

# 📘 Project: Alianza Puembo Web

This is the official website of *Alianza Puembo*, a church committed to community engagement. The platform provides centralized access to church information, ministries, events, devotionals, donations, prayer requests, and contact forms.

---

## 🚀 Key Technologies

This project is built using the following tools and technologies:

- **Framework**: Next.js (v15.x, App Router)
- **UI Library**: React (v19.x)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Calendar Integration**: FullCalendar
- **Animations**: Framer Motion
- **Schema Validation**: Zod
- **SSR Helpers**: `@supabase/ssr`
- **Email Handling**: Resend (for contact form submissions)
- **YouTube API**: For livestreams
- **Google Maps API**: For location display

---

## ✨ Main Features

- **Informational Pages**: About Us (Team, Beliefs), News
- **Ministries**: Small Groups, Youth, MAT, Misión Dignidad, Puembo Kids
- **Events**: Interactive calendar, upcoming events
- **Devotionals**: LoM (Read, Pray, and Meditate)
- **User Interaction**: Contact and prayer request forms
- **Donations**: Info on how to support the church
- **Admin Panel**: Protected routes for managing events, LoM posts, and prayer requests

---

## 🛠️ Setup & Development

### Requirements

- Node.js (v18.x or newer)
- npm (or yarn/pnpm)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/r-alejo-z95/alianza-puembo-web.git
   cd alianza-puembo-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAP_ID=your_google_maps_map_id
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
CRON_SECRET=your_cron_secret
```

### Scheduled Jobs

Payment reminder emails are triggered by Vercel Cron through:

```http
GET /api/cron/payment-reminders
```

The project config in `vercel.json` runs this job every day at `13:00 UTC`
(`08:00` in Ecuador). The endpoint requires:

```http
Authorization: Bearer <CRON_SECRET>
```

Vercel sends that header automatically when `CRON_SECRET` is configured in the
project environment.

### Run the project locally

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Additional Commands

- Build for production:
  ```bash
  npm run build
  ```
- Start the production server:
  ```bash
  npm run start
  ```
- Run the linter:
  ```bash
  npm run lint
  ```

---

## 🔐 Authentication

Supabase Auth is used to handle user authentication. The `/admin` route and all its sub-routes are protected and require authentication. Unauthenticated users are redirected to the login page (`/login`).

---

## 📂 Project Structure

```
alianza-puembo-web/
├── app/                 # Application routes and pages (App Router)
├── components/          # Reusable UI components
├── lib/                 # Utilities, Supabase client, hooks, schema validators
├── public/              # Static assets (images, icons, etc.)
├── .gitignore           # Git ignored files
├── components.json      # UI component registry
├── eslint.config.mjs    # ESLint configuration
├── jsconfig.json        # JS project configuration
├── middleware.ts        # Next.js middleware for route protection
├── next.config.mjs      # Next.js configuration
├── package.json         # Project metadata and scripts
├── package-lock.json    # Dependency lock file
├── postcss.config.mjs   # PostCSS configuration
├── README.md            # Project documentation
├── tsconfig.json        # TypeScript configuration
```

---

## 🤝 Contributing

This is a **public project** intended to demonstrate professional-level web development. If you'd like to suggest improvements or contribute, feel free to open an issue or pull request.

---

## 📄 License

This project is developed and maintained by **Ramon Zambrano** for **Iglesia Alianza Puembo**. Code is open for review but not for commercial reuse without permission. All rights reserved.
