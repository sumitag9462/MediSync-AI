import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Clock,
  BookOpen,
  BarChart2,
  ChevronsRight,
  Calendar,
  User,
  Award,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../Components/cards/FeatureCard';
import heroImg from '../assets/hero-img.png';

// 🧍‍♂️ Local profile images (add them in src/assets/)
import divyamPic from '../assets/divyam.jpg.jpeg';
import sumitPic from '../assets/sumit.jpg.jpeg';
import divyanshPic from '../assets/divyansh.jpg.jpeg';

// ✉️ Contact Form Component
const ContactForm = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xyznwbbr', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setStatus('Thanks for your message! We will get back to you soon.');
        form.reset();
      } else {
        setStatus('Oops! There was a problem submitting your form.');
      }
    } catch (error) {
      setStatus('Oops! There was a problem submitting your form.');
    } finally {
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <div className="panel-glass p-10 rounded-3xl shadow-xl max-w-2xl mx-auto backdrop-blur-md border border-gray-700">
      <h3 className="text-3xl md:text-4xl font-bold mb-3 text-white text-center">Get in Touch</h3>
      <p className="text-gray-400 mb-8 text-center">
        Have a question? Fill out the form below and we'll get back to you.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {['name', 'email', 'phone', 'place'].map((field) => (
          <div key={field}>
            <label className="text-sm font-semibold text-gray-300 block mb-2 capitalize">
              {field === 'place' ? 'Location' : field}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder={
                field === 'name'
                  ? 'Alex Doe'
                  : field === 'email'
                  ? 'you@example.com'
                  : field === 'phone'
                  ? '+91 XXXXX XXXXX'
                  : 'New Delhi, India'
              }
              required
            />
          </div>
        ))}
        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Your Query</label>
          <textarea
            name="message"
            rows="4"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="How can we help you today?"
            required
          ></textarea>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-all"
          >
            Send Message
          </button>
        </div>
        {status && <p className="text-center text-sm text-gray-300 mt-4">{status}</p>}
      </form>
    </div>
  );
};

// 🏠 Landing Page
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen scroll-smooth">
        {/* Header */}
        <header className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Pill size={28} className="text-purple-400" />
            <h1 className="text-2xl font-bold">MedWell</h1>
          </div>
          <nav className="space-x-6 flex items-center">
            <a href="#features" className="hover:text-purple-400 transition">
              Features
            </a>
            <a href="#about" className="hover:text-purple-400 transition">
              About Us
            </a>
            <a href="#contact" className="hover:text-purple-400 transition">
              Contact Us
            </a>
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              Login / Sign Up
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between py-20 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Your Personal{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Wellness
              </span>{' '}
              Companion
            </h2>
            <p className="mt-4 text-gray-400 text-lg max-w-xl">
              Never miss a dose again. Track your medications, monitor your health, and achieve your wellness goals
              with MedWell.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-all"
            >
              Get Started for Free
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex justify-center"
          >
            <motion.img
              src={heroImg}
              alt="MedWell Illustration"
              className="w-full max-w-md mx-auto drop-shadow-[0_0_25px_rgba(168,85,247,0.3)] rounded-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </main>

        {/* Features Section */}
        <section id="features" className="py-20 container mx-auto px-6">
          <h3 className="text-4xl font-bold mb-12 text-center">Why You'll Love MedWell</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard index={0} icon={<Clock size={32} />} title="Powerful Reminders">
              Customizable alerts for every dose, ensuring you stay on track with your schedule.
            </FeatureCard>
            <FeatureCard index={1} icon={<BookOpen size={32} />} title="Simple Logging">
              Log doses with a single tap. Keep a detailed history of taken and missed medications.
            </FeatureCard>
            <FeatureCard index={2} icon={<BarChart2 size={32} />} title="Wellness Dashboard">
              Visualize your progress with insightful charts and track your health journey over time.
            </FeatureCard>
            <FeatureCard index={3} icon={<ChevronsRight size={32} />} title="AI Predictions">
              Our smart system predicts potential adherence issues and helps you stay consistent.
            </FeatureCard>
            <FeatureCard index={4} icon={<Calendar size={32} />} title="Calendar Sync">
              Integrate your medication schedule with your personal calendar for seamless planning.
            </FeatureCard>
            <FeatureCard index={5} icon={<User size={32} />} title="Natural Language Assistant">
              Ask our AI chatbot anything about your schedule, just like talking to a real person.
            </FeatureCard>
            <FeatureCard index={6} icon={<Award size={32} />} title="Gamification">
              Earn streaks and achievements as you consistently follow your medication schedule.
            </FeatureCard>
            <FeatureCard index={7} icon={<Activity size={32} />} title="Device Integration">
              Sync your wellness data with Google Fit or smartwatch for smarter insights.
            </FeatureCard>
          </div>
        </section>

        {/* 🌟 About Us Section */}
        <section id="about" className="py-20 bg-gray-950/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 blur-3xl opacity-70 pointer-events-none"></div>

          <h3 className="text-4xl font-bold text-center mb-12 relative z-10">Meet the Team</h3>

          <div className="flex flex-wrap justify-center gap-10 px-6 relative z-10">
            {/* Member 1 */}
            <TeamCard
              img={divyamPic}
              name="Divyam Pancholi"
              role="Lead Developer"
              email="divyam.20234061@mnnit.ac.in"
              phone="+91 9306583122"
              linkedin="https://www.linkedin.com/in/divyam-pancholi-23a5b9331/"
              github="https://github.com/ValarCode"
              borderColor="purple"
            />

            {/* Member 2 */}
            <TeamCard
              img={sumitPic}
              name="Sumit Agrawal"
              role="UI/UX Designer"
              email="sumit.20234165@mnnit.ac.in"
              phone="+91 7902016000"
              linkedin="https://www.linkedin.com/in/sumit-agrawal-3611a1285/"
              github="https://github.com/sumitag9462"
              borderColor="pink"
            />

            {/* Member 3 */}
            <TeamCard
              img={divyanshPic}
              name="Divyansh Meena"
              role="Backend Engineer"
              email="divyansh.20234062@mnnit.ac.in"
              phone="+91 6397161731"
              linkedin="https://www.linkedin.com/in/divyansh-meena-497508300/"
              github="https://github.com/de13vil"
              borderColor="blue"
            />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <ContactForm />
        </section>
      </div>

      {/* Footer */}
      <footer className="relative w-full bg-gradient-to-r from-purple-900/40 via-gray-900/70 to-pink-900/40 bg-opacity-70 backdrop-blur-md py-10 px-4 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-r from-purple-500/30 via-pink-400/20 to-purple-500/30 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
        <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-2xl font-bold text-purple-200 mb-2">Support Us</h4>
            <p className="text-gray-300 max-w-md text-center md:text-left">
              If you love MedWell and want to help us grow, consider sharing with friends, giving us feedback, or
              supporting us below!
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => navigate('/buy-coffee')}
              whileHover={{ scale: 1.07, boxShadow: '0 0 24px 2px #a78bfa55' }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-purple-500/80 to-pink-400/80 text-white font-bold py-3 px-8 rounded-full shadow text-lg mb-2 transition-all flex items-center gap-2"
            >
              <span role="img" aria-label="coffee">
                ☕
              </span>{' '}
              Buy us a Coffee
            </motion.button>
           
             
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} MedWell. All rights reserved.
        </div>
      </footer>
    </>
  );
};

// 💁‍♂️ Team Card component
const TeamCard = ({ img, name, role, email, phone, linkedin, github, borderColor }) => {
  const colorMap = {
    purple: 'from-purple-400 to-pink-500',
    pink: 'from-pink-400 to-purple-400',
    blue: 'from-blue-400 to-pink-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gray-900/60 border border-${borderColor}-600/30 rounded-3xl shadow-lg w-80 p-6 text-center backdrop-blur-md transition-all hover:shadow-${borderColor}-500/40 hover:border-${borderColor}-400/60`}
    >
      <div className="relative w-32 h-32 mx-auto mb-5">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorMap[borderColor]} blur-md animate-pulse`}></div>
        <img
          src={img}
          alt={name}
          className={`w-32 h-32 rounded-full mx-auto border-4 border-transparent bg-gradient-to-r ${colorMap[borderColor]} p-[2px] object-cover relative z-10`}
        />
      </div>
      <h4 className="text-xl font-semibold text-white">{name}</h4>
      <p className="text-gray-400 text-sm mt-1">{role}</p>
      <p className="text-gray-400 mt-3 flex items-center justify-center gap-2 whitespace-nowrap">
        <span role="img" aria-label="email">📧</span> {email}
      </p>
      <p className="text-gray-400 flex items-center justify-center gap-2 whitespace-nowrap">
        <span role="img" aria-label="phone">📱</span> {phone}
      </p>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-pink-400 mt-2 inline-block">
        LinkedIn
      </a>
      <br />
      <a href={github} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-pink-400 mt-2 inline-block">
        GitHub Profile
      </a>
    </motion.div>
  );
};

export default LandingPage;
