// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // if you use other folders, add them here:
    // "./frontend/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // extend as needed
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // optional; used in ProjectCard
  ],
  // if you have a strict purge pipeline and want to be safe for arbitrary utilities
  safelist: [
    {
      pattern: /^(transition-\[width\]|duration-\d+|from-.*|to-.*|bg-gradient-to-r)$/,
    },
  ],
};
