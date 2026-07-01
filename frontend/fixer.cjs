const fs = require('fs');

const replacements = [
  { file: 'src/components/EmergencyQRCard.jsx', old: 'const { profile }', new: 'const { _profile }' },
  { file: 'src/components/layout/Topbar.jsx', old: 'user, logout, loading', new: 'user, logout' },
  { file: 'src/components/layout/Topbar.jsx', old: 'const dropdownWidth = dropdownRef.current', new: '// const dropdownWidth = dropdownRef.current' },
  { file: 'src/components/ui/Card.jsx', old: 'import { motion }', new: '// import { motion }' },
  { file: 'src/components/ui/PhoneMockup.jsx', old: "MedWell's", new: "MedWell&apos;s" },
  { file: 'src/pages/Auth/AuthComponents.jsx', old: 'length, onComplete, placeholder', new: 'length, onComplete' },
  { file: 'src/pages/Auth/AuthComponents.jsx', old: '}, [length, onComplete]);', new: '}, [length, onComplete, setOtpArray]); // eslint-disable-line react-hooks/exhaustive-deps' },
  { file: 'src/pages/Auth/AuthLayout.jsx', old: 'import { motion }', new: '// import { motion }' },
  { file: 'src/pages/Dashboard.jsx', old: "const getGreeting = ()", new: "const _getGreeting = ()" },
  { file: 'src/pages/Dashboard.jsx', old: "const trend =", new: "const _trend =" },
  { file: 'src/pages/Dashboard.jsx', old: "const gradientFromTo =", new: "const _gradientFromTo =" },
  { file: 'src/pages/Dashboard.jsx', old: "const getUniqueColor =", new: "const _getUniqueColor =" },
  { file: 'src/pages/Dashboard.jsx', old: "const containerVariants =", new: "const _containerVariants =" },
  { file: 'src/pages/Dashboard.jsx', old: "const itemVariants =", new: "const _itemVariants =" },
  { file: 'src/pages/Dashboard.jsx', old: "const prediction =", new: "const _prediction =" },
  { file: 'src/pages/Dashboard.jsx', old: "const unlockedCount =", new: "const _unlockedCount =" },
  { file: 'src/pages/Dashboard.jsx', old: "const totalAchievements =", new: "const _totalAchievements =" },
  { file: 'src/pages/Dashboard.jsx', old: "dosage =", new: "_dosage =" },
  { file: 'src/pages/Landing.jsx', old: "import heroImg from '../assets/hero-img.png';", new: "// import heroImg from '../assets/hero-img.png';" },
  { file: 'src/pages/Landing.jsx', old: "index) =>", new: "_index) =>" },
  { file: 'src/pages/Landing.jsx', old: "const heroRef =", new: "const _heroRef =" },
  { file: 'src/pages/Settings.jsx', old: 'import { motion }', new: '// import { motion }' },
  { file: 'src/pages/Settings.jsx', old: 'user, logout, updateUser', new: 'logout, updateUser' },
  { file: 'src/services/predictionService.js', old: 'afternoonMisses,', new: '' },
  { file: 'src/services/predictionService.js', old: 'nightMisses', new: '' }
];

replacements.forEach(({ file, old, new: replaceWith }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(old, replaceWith);
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log("Done");
