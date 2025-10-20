Of course. Here is a small, well-structured README file for your project in Markdown format.

-----

# Chain of Light 🪔

A global, interactive map for Diwali where users can light a virtual diya, share a heartfelt message, and create a glowing chain of connections with friends and family around the world.

## ✨ Features

  * [cite\_start]**Geolocation-Based Diya Placement**: Automatically light a diya at your current location[cite: 717, 718].
  * [cite\_start]**Real-Time Updates**: The map updates live for all users as new diyas are lit, powered by Supabase Realtime[cite: 137, 138, 748].
  * [cite\_start]**Marker Clustering**: Crowded areas are handled gracefully with smooth marker clustering[cite: 124, 130].
  * [cite\_start]**Viral Sharing**: Generate a unique link to share with friends and create a visual connection on the map[cite: 152].
  * [cite\_start]**Connection Lines**: See a beautiful, glowing line connect you to the friend who invited you[cite: 144, 145].
  * [cite\_start]**Anti-Spam**: A device fingerprinting system is in place to ensure one diya per user, maintaining the integrity of the experience[cite: 98, 106, 697].

## 🛠️ Tech Stack

  * [cite\_start]**Frontend**: Vite + React (TypeScript) [cite: 36, 49, 50]
  * [cite\_start]**Backend & Database**: Supabase (PostgreSQL with Realtime) [cite: 98, 654, 739]
  * [cite\_start]**Mapping**: Leaflet.js, React-Leaflet, and `leaflet.markercluster` [cite: 35, 124]
  * [cite\_start]**Styling**: Tailwind CSS & shadcn/ui [cite: 38, 62]
  * [cite\_start]**Server State**: TanStack Query (React Query) [cite: 58]

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

  * Node.js (v18 or higher)
  * An account on [Supabase](https://supabase.com)

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone <YOUR_GIT_URL>
    cd chain-of-light
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up Supabase:**

      * Create a new project on Supabase.
      * Go to the **SQL Editor** in your Supabase project dashboard.
      * [cite\_start]Click **"New query"** and paste the entire content from `supabase/migrations/20251020044842_....sql` into the editor[cite: 740, 741, 742, 743, 744, 745, 746, 747, 748].
      * Click **"RUN"** to create the tables and policies.

4.  **Configure Environment Variables:**

      * Create a file named `.env` in the root of the project.
      * Go to your Supabase project's **Settings \> API**.
      * Copy your **Project URL** and **`anon` (public) key**.
      * Add them to your `.env` file like this:
        ```env
        VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
        VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_ANON_KEY"
        ```

5.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application should now be running on `http://localhost:5173`.

## 🚢 Deployment

You can easily deploy this project to platforms like **Vercel** or **Netlify**.

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Import the repository into your Vercel or Netlify account.
3.  The build settings will be automatically detected (Build command: `npm run build`, Publish directory: `dist`).
4.  **Crucially**, you must add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables in your deployment provider's project settings.
5.  Deploy\!

## Made By

  * [**@bitwise**](https://linktr.ee/bitwise72)