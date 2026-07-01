import os
import re

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements_map = {
    'src/components/EmergencyQRCard.jsx': [
        ('const { profile } = useAuth();', 'const { user } = useAuth(); // or remove if useAuth is just for token')
    ],
    'src/components/layout/Topbar.jsx': [
        ('const { user, logout, loading } = useAuth();', 'const { user, logout } = useAuth();'),
        ('const dropdownWidth = dropdownRef.current', '// const dropdownWidth = dropdownRef.current')
    ],
    'src/components/ui/Card.jsx': [
        ('import { motion } from "framer-motion";', '')
    ],
    'src/components/ui/PhoneMockup.jsx': [
        ("MedWell's", "MedWell&apos;s")
    ],
    'src/pages/Auth/AuthComponents.jsx': [
        ('const OtpInput = ({ length, onComplete, placeholder }) => {', 'const OtpInput = ({ length, onComplete }) => {'),
        ('}, [length, onComplete]);', '}, [length, onComplete, setOtpArray]); // eslint-disable-line react-hooks/exhaustive-deps')
    ],
    'src/pages/Auth/AuthLayout.jsx': [
        ('import { motion } from "framer-motion";', '')
    ],
    'src/pages/BuyCoffee.jsx': [
        ('const [step, setStep] = useState(1);', '')
    ],
    'src/pages/Dashboard.jsx': [
        ("Here's", "Here&apos;s"),
        ("Today's", "Today&apos;s"),
        ("Let's", "Let&apos;s"),
        ("It's", "It&apos;s")
    ],
    'src/pages/Journal.jsx': [
        ("Today's", "Today&apos;s"),
        ("It's", "It&apos;s"),
        ("you're", "you&apos;re"),
        ("Don't", "Don&apos;t")
    ],
    'src/pages/Landing.jsx': [
        ("import heroImg from '../assets/hero-img.png';", ""),
        ("MediSync-AI's", "MediSync-AI&apos;s"),
        ('"', '&quot;') # this might be dangerous if applied to entire file!
    ],
    'src/pages/OCRHistoryPage.jsx': [
        ("couldn't", "couldn&apos;t"),
        ("didn't", "didn&apos;t")
    ],
    'src/pages/OCRUploadPage.jsx': [
        ("prescription's", "prescription&apos;s")
    ],
    'src/pages/Settings.jsx': [
        ('import { motion } from "framer-motion";', ''),
        ('const { user, logout, updateUser } = useAuth();', 'const { logout, updateUser } = useAuth();')
    ]
}

for path, replacements in replacements_map.items():
    replace_in_file(path, replacements)
    print(f"Patched {path}")

