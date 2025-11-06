export const theaterConfig = {
  "Filmoteca de Catalunya": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-purple-600",
    bgColor: "#9333ea",
    active: true
  },
  "Cinesa Diagonal": {
    type: "api",
    endpoint: "https://api.example.com/cinesa",
    hasGoogleIntegration: false,
    color: "bg-blue-600",
    bgColor: "#2563eb",
    active: false
  },
  "Zumzeig": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-green-600",
    bgColor: "#16a34a",
    active: true
  },
  "Renoir Floridablanca": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-orange-600",
    bgColor: "#ea580c",
    active: true
  },
  "Verdi Barcelona": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-red-600",
    bgColor: "#dc2626",
    active: true
  },
  "Mooby Aribau": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-yellow-600",
    bgColor: "#ca8a04",
    active: true
  },
  "Mooby Balmes": {
    type: "api",
    endpoint: "/api/movies",
    hasGoogleIntegration: false,
    color: "bg-cyan-600",
    bgColor: "#0891b2",
    active: true
  }
};

/**
 * Generate a theater-branded fallback image
 * @param {string} theaterName - Name of the theater
 * @returns {string} Data URL for SVG image
 */
export const getTheaterFallbackImage = (theaterName) => {
  const theater = theaterConfig[theaterName];
  const bgColor = theater?.bgColor || '#6b7280';
  const shortName = theaterName.split(' ')[0]; // Get first word (Filmoteca, Zumzeig, etc.)

  const svg = `
    <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="300" fill="${bgColor}"/>
      <text x="100" y="130" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.3">
        🎬
      </text>
      <text x="100" y="180" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        ${shortName}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
