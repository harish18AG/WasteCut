import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingDown,
  ShieldCheck,
  Award,
  Users,
  Utensils,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  Globe,
  Leaf
} from 'lucide-react';

export const Home: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Monitor scroll for nav transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '45,280 kg', label: 'Surplus Food Rescued', icon: Utensils },
    { value: '113,200 kg', label: 'CO₂ Emissions Prevented', icon: Leaf },
    { value: '184+', label: 'Partner Restaurants & Stores', icon: Award },
    { value: '72', label: 'Active NGOs Joined', icon: Users },
  ];

  const features = [
    {
      title: 'Food Donors',
      desc: 'Quickly upload food details, image, categories, and expiry times. Receive alerts when an NGO claims your donation.',
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      title: 'Non-Profit Organizations (NGOs)',
      desc: 'Browse food listings in your area via interactive filters. Schedule pickups and update status transparently.',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      title: 'Recipients & Shelters',
      desc: 'Check available donations nearby, submit requests for distribution, and track claim approvals.',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
    },
    {
      title: 'System Administrators',
      desc: 'Access charts covering daily donations, food saved, user growth, carbon savings, and manage database entities.',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
  ];

  const testimonials = [
    {
      quote: "WasteCut has completely transformed how we manage buffet leftovers. Instead of tossing out untouched dishes, we feed over 50 people every day.",
      author: "Chef Marco, Green Olive Bistro",
      role: "Donor Partner"
    },
    {
      quote: "With coordinates and real-time pickup updates, our collection trucks save hours. We can pick up bread and warm meals before they expire.",
      author: "Sarah Jenkins, Hope Shelter NGO",
      role: "NGO Logistics"
    }
  ];

  const faqs = [
    {
      q: "How does the system ensure food safety?",
      a: "Donors are required to specify the preparation time and an expiry limit for each food listing. NGOs verify visual freshness and package integrity during pickup."
    },
    {
      q: "Who can join as a food donor?",
      a: "Supermarkets, hotels, corporate halls, bakeries, restaurants, and individual caterers can sign up and list surplus food."
    },
    {
      q: "How is the environmental carbon saving calculated?",
      a: "According to UN FAO standards, avoiding 1 kg of food waste avoids approximately 2.5 kg of CO₂ equivalent emissions. Our analytics dashboard maps this metric in real-time."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-350 ${scrolled ? 'bg-white shadow-soft py-3' : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              🌱 WasteCut
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-primary transition-all">About</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-all">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-all">How it Works</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-primary transition-all">FAQs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburguer */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="absolute top-full inset-x-0 bg-white border-b border-gray-100 shadow-premium p-6 flex flex-col gap-4 md:hidden">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-600">About</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-600">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-600">How it Works</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-600">FAQs</a>
            <div className="h-px bg-gray-100 my-2" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm font-medium text-gray-700">Sign In</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 text-sm font-medium text-white bg-primary rounded-xl">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="animated-bg pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-xs font-semibold text-primary mb-6">
              <Leaf size={14} /> Smart Food Waste Reduction
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Bridging the Gap Between <span className="text-primary">Surplus Food</span> and Those in Need
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Eliminate restaurant, supermarket, and catering waste. Using Object-Oriented Analysis and Design, we connect surplus food donors directly with local shelters and NGOs.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-premium hover:shadow-none transition-all flex items-center gap-2"
              >
                Start Rescuing Food <ArrowRight size={18} />
              </Link>
              <a
                href="#about"
                className="px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Visual element representing waste reduction */}
            <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-premium">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                alt="Donated fresh grocery items"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-8">
                <div className="glass-panel p-6 rounded-2xl w-full flex items-center justify-between shadow-soft">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Springfield Campaign</h4>
                    <p className="text-[11px] text-gray-500 mt-1">Goal: 50,000 kg Rescued</p>
                  </div>
                  <span className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-full">
                    90% Completed
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Statistics */}
      <section className="py-16 bg-gray-50 border-y border-gray-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center p-6 bg-white rounded-2xl shadow-soft">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-2">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">The Mission</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Reducing Food Waste to Mitigate Climate Change
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Roughly one-third of all food produced globally goes to waste. By capturing surplus dishes from commercial halls, cafes, and hotels, and redistributing them instantly through structured user relationships, we save perfectly good meals and prevent massive methane release in landfills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="p-8 border border-gray-100 rounded-2xl hover:border-primary/20 transition-all bg-white">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                <Heart size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Social Impact</h4>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Directly feeds homeless shelters, refugee houses, and impoverished communities using safe distribution lines.
              </p>
            </div>
            <div className="p-8 border border-gray-100 rounded-2xl hover:border-primary/20 transition-all bg-white">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Environmental Footprint</h4>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Rescuing food prevents organic decomposition gases, actively cutting down greenhouse footprints.
              </p>
            </div>
            <div className="p-8 border border-gray-100 rounded-2xl hover:border-primary/20 transition-all bg-white">
              <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingDown size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Economic Savings</h4>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Allows corporate halls and caterers to optimize inventory, decrease trash overheads, and claim tax deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Tailored Experience for Every Role</h2>
            <p className="text-sm text-gray-500 mt-4">
              Our system operates as a state-machine ensuring complete traceability from kitchen surplus prep to ngo delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl shadow-soft hover:shadow-premium transition-all flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${f.bg} ${f.text} mb-6`}>
                    {f.title}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Integrated Role</span>
                  <ShieldCheck size={16} className={f.text} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Seamless Redistribution Path</h2>
            <p className="text-sm text-gray-500 mt-4">
              Three simple steps coordinates donors, transport, and beneficiaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 hidden md:block z-0" />

            <div className="relative z-10 flex flex-col items-center text-center bg-white p-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center shadow-premium">
                1
              </div>
              <h4 className="font-bold text-gray-900 text-lg mt-6">Donate Surplus Food</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-xs">
                Restaurants list food quantity, food images, dietary type, and expiry window.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center bg-white p-6">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-premium">
                2
              </div>
              <h4 className="font-bold text-gray-900 text-lg mt-6">NGO Claim & Pickup</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-xs">
                NGO drives to pickup spot coordinates, loading food packages within the timeframe.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center bg-white p-6">
              <div className="w-16 h-16 rounded-full bg-orange-500 text-white font-extrabold text-xl flex items-center justify-center shadow-premium">
                3
              </div>
              <h4 className="font-bold text-gray-900 text-lg mt-6">Distribute & Eat</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-xs">
                Warm surplus food is distributed at community kitchens. System logs the carbon offset stats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories & Testimonials */}
      <section className="py-24 bg-gray-50 border-t border-gray-100 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-16">Stories of Local Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl shadow-soft border border-gray-50 flex flex-col justify-between">
                <p className="italic text-gray-600 leading-relaxed text-sm">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-800">{t.author}</h5>
                    <span className="text-[10px] text-gray-400 font-medium">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-premium">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Get in Touch</h3>
          <p className="text-xs text-gray-500 text-center mb-8">
            Interested in partner integrations or scheduling demo calls? Send us a message.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for your interest! We'll reply soon."); }} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                placeholder="Sarah Jenkins"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                placeholder="sarah@hope.org"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Message</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="We want to register 5 restaurants..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition-all"
            >
              Submit Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 bg-gray-50 border-t border-gray-100 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-sm text-gray-800">{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 border-t border-gray-50">
                      <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/10 pb-8">
          <div>
            <h4 className="text-lg font-bold">🌱 WasteCut</h4>
            <p className="text-xs text-gray-400 mt-2 max-w-xs">
              Smart surplus food management leveraging OOP design models for clean, transparent redistribution.
            </p>
          </div>
          <div className="flex gap-8 justify-start md:justify-center">
            <a href="#about" className="text-xs text-gray-400 hover:text-white">About</a>
            <a href="#features" className="text-xs text-gray-400 hover:text-white">Features</a>
            <a href="#faq" className="text-xs text-gray-400 hover:text-white">FAQs</a>
          </div>
          <div className="flex gap-4 justify-start md:justify-end text-xs text-gray-400">
            <div className="flex items-center gap-1"><Mail size={25} /> harishanbazhagan2005@gmail.com</div>
            <div className="flex items-center gap-1"><Phone size={25} /> +91 9150478209</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} WasteCut Project (OOAD Capstone). All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;
