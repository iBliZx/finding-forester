# Finding Forester

**Finding Forester** is an AI-powered environmental impact assessment tool developed for **Hack PSU 2026**. It allows users to select specific forest regions on an interactive map and generates professional-grade ecological reports detailing the consequences of deforestation and localized conservation recovery plans.

---

## Key Features

* **Interactive Area Selection:** Draw polygons on a global map to select specific forested regions.
* **Geospatial Intelligence:** Automatically detects coordinates, calculates area in hectares, and identifies if the selection is over land, water, or near urban centers.
* **AI-Driven Ecology Reports:** Utilizes **Gemini 2.5 Flash** to provide deep-dive assessments:
    * **Environmental Changes:** Quantified impacts on biodiversity, water systems, and soil.
    * **Flora & Fauna Analysis:** Identification of native species (scientific names) and specific survival risks.
    * **Human Health Impact:** Analysis of how local populations depend on the forest for water, medicine, and food.
    * **Climate Future:** 10-50 year outlooks on regional climate resilience.
* **Actionable Conservation Plans:** Step-by-step restoration guides with localized tree species and estimated costs.
* **Data Persistence:** Uses a mix of `localStorage` and Cookies to save assessments and map selections across sessions.

---

## Tech Stack

* **Frontend:** React, Next.js, Tailwind CSS
* **Animation:** Framer Motion, Lucide React (Icons)
* **AI/LLM:** Google Generative AI SDK (Gemini 2.5 Flash)
* **Maps & Geocoding:** Leaflet, OpenStreetMap Nominatim API, BigDataCloud API
* **UI Components:** Radix UI / Shadcn UI

---

## Setting Up Your Gemini API Key

To run this project, you must provide your own API key from Google AI Studio.

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Create a new API Key.
3.  **Local Setup:** For development, you can replace the `GEMINI_API_KEY` string in `src/pages/Home.js`:

    ```javascript
    const GEMINI_API_KEY = "INSERT_KEY_HERE";
    ```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/finding-forester.git](https://github.com/your-username/finding-forester.git)
    cd finding-forester
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the app:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---
