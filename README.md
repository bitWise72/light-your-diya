
-----

# Chain of Light 🪔

A global, interactive map for Diwali where users can light a virtual diya, share a heartfelt message, and create a glowing chain of connections with friends and family around the world.

## ✨ Features

  * **Geolocation-Based Diya Placement**: Automatically light a diya at your current location.
  * **Real-Time Updates**: The map updates live for all users as new diyas are lit, powered by Supabase Realtime.
  * **Marker Clustering**: Crowded areas are handled gracefully with smooth marker clustering.
  * **Viral Sharing**: Generate a unique link to share with friends and create a visual connection on the map.
  * **Connection Lines**: See a beautiful, glowing line connect you to the friend who invited you.
  * **Anti-Spam**: A device fingerprinting system is in place to ensure one diya per user, maintaining the integrity of the experience.

## 🛠️ Tech Stack

  * **Frontend**: Vite + React (TypeScript)
  * **Backend & Database**: Supabase (PostgreSQL with Realtime) 
  * **Mapping**: Leaflet.js, React-Leaflet, and `leaflet.markercluster`
  * **Styling**: Tailwind CSS & shadcn/ui 
  * **Server State**: TanStack Query (React Query) 
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
      * Click **"New query"** and paste the entire content from `supabase/migrations/20251020044842_....sql` into the editor.
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



## Made By

  * [**@bitwise**](https://linktr.ee/bitwise72)
