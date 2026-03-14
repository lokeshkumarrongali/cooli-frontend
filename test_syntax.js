const fs = require('fs');
const babel = require('@babel/core');

const files = [
  'src/components/JobCard.jsx',
  'src/components/WorkerCard.jsx',
  'src/components/NotificationDropdown.jsx',
  'src/components/NotificationBell.jsx',
  'src/pages/employer/Workers.jsx',
  'src/pages/worker/SavedJobs.jsx',
  'src/components/Navbar.jsx',
  'src/App.jsx'
];

files.forEach(f => {
  try {
    const code = fs.readFileSync(f, 'utf8');
    babel.transformSync(code, { presets: ['@babel/preset-react'] });
    console.log('OK: ' + f);
  } catch (e) {
    console.error('ERROR in ' + f + ': ' + e.message);
  }
});
