// Keep the standalone Nextra docs build isolated from the root app's
// Tailwind/PostCSS pipeline. The docs do not use Tailwind directly.
const config = {
  plugins: {},
};

export default config;
