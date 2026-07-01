const requiredViteEnvVars = [
  'VITE_BACKEND_URL',
  'VITE_GOOGLE_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_VAPID_PUBLIC_KEY'
];

const missingVars = [];

for (const key of requiredViteEnvVars) {
  if (!import.meta.env[key]) {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.error(
    `[ENV CONFIG ERROR] The following required environment variables are missing: ${missingVars.join(
      ', '
    )}.`
  );
  console.warn(
    'Please ensure these are set in your deployment environment or local .env file. Some features will be disabled.'
  );
}

export default true;
