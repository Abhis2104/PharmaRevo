/*
PharmaRevo Landing Page (single-file React component)
Tech: React + TailwindCSS + Framer Motion + Lucide React
Place this file in: frontend/src/pages/LandingPage.jsx

Dependencies to install in your frontend folder:
  npm install framer-motion lucide-react

How to use:
  - Import and add route in App.jsx: { path: '/', element: <LandingPage /> }
  - Ensure Tailwind is configured and index.css contains the @tailwind lines.
  - Optional: add images or replace inline SVGs with your assets.

This component is mobile-first and responsive. Animations are created with Framer Motion.
*/

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  Pill,
  Truck,
  HomeHeart,
  Users,
  CheckCircle,
  Mail,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Features', id: 'features' },
  { name: 'How It Works', id: 'how' },
  { name: 'Impact', id: 'impact' },
  { name: 'Contact', id: 'contact' }
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 72; // offset for navbar
  window.scrollTo({ top, behavior: 'smooth' });
}

function useCount(to, duration = 1500) {
  const [num, setNum] = useState(0);
  useEffect(() => {
    let start = 0;
    const diff = to - start;
    if (diff <= 0) return;
    const stepTime = Math.abs(Math.floor(duration / diff));
    const timer = setInterval(() => {
      start += 1;
      setNum(start);
      if (start >= to) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [to, duration]);
  return num;
}

const Stat = ({ label, to }) => {
  const v = useCount(to, 1400);
  return (
    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 shadow-md text-center">
      <div className="text-3xl md:text-4xl font-bold text-blue-600">{v}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div id="home" className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      {/* NAVBAR */}
      <header className="fixed w-full z-40 top-0 left-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-teal-400 to-blue-500 p-2 shadow-md inline-flex">
                  <HomeHeart className="w-6 h-6 text-white" />
                </span>
                <span className="text-xl font-semibold text-slate-800">Pharma<span className="text-teal-600">Revo</span></span>
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-6">
              {navLinks.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id)} className="text-gray-700 hover:text-sky-600 transition">
                  {l.name}
                </button>
              ))}
              <button onClick={() => scrollToId('donate')} className="ml-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow">
                Donate Now
              </button>
            </div>

            {/* mobile menu placeholder */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-20">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                  Bridging <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">Medicine Waste</span> to
                  <br /> Life‑Saving Care
                </h1>
                <p className="mt-6 text-gray-600 max-w-xl">
                  PharmaRevo connects donors, pharmacies, and NGOs to make healthcare accessible for all. Reduce waste, increase impact, and bring medicine to
                  those who need it most.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <motion.button whileHover={{ scale: 1.03 }} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg shadow">Get Started</motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={() => scrollToId('about')} className="border border-slate-200 px-5 py-3 rounded-lg text-slate-800">Learn More</motion.button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-3 shadow">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Verified</div>
                      <div className="text-sm text-gray-500">Pharmacist & AI checks</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-3 shadow">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Fast Delivery</div>
                      <div className="text-sm text-gray-500">Smart partner assignment</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex justify-center md:justify-end">
                <div className="relative w-full max-w-md">
                  <div className="rounded-2xl bg-gradient-to-br from-white/80 to-sky-50 shadow-2xl p-6">
                    <img src="https://images.unsplash.com/photo-1584036561584-b03c19da874c?auto=format&fit=crop&w=800&q=60" alt="meds" className="rounded-xl w-full h-64 object-cover" />
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">Verified Donation</div>
                      <div className="text-lg font-semibold text-slate-800">Paracetamol 500mg - 50 tablets</div>
                    </div>
                  </div>

                  {/* floating icons */}
                  <motion.div initial={{ y: -10 }} animate={{ y: 6 }} transition={{ yoyo: Infinity, duration: 3 }} className="absolute -left-6 -top-6">
                    <div className="bg-white p-3 rounded-2xl shadow-md">
                      <Pill className="w-6 h-6 text-teal-600" />
                    </div>
                  </motion.div>

                  <motion.div initial={{ y: 10 }} animate={{ y: -6 }} transition={{ yoyo: Infinity, duration: 4 }} className="absolute -right-6 bottom-10">
                    <div className="bg-white p-3 rounded-2xl shadow-md">
                      <HeartPulse className="w-6 h-6 text-pink-500" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-slate-900">Our Mission</h3>
                <p className="mt-4 text-gray-600">PharmaRevo reduces medicine wastage by enabling safe donation and redistribution. We verify, track and deliver medicines to those in need through trusted partners.</p>
                <ul className="mt-6 space-y-3 text-gray-600">
                  <li>• Safe verification by pharmacists and AI checks</li>
                  <li>• Transparent tracking and CSR reporting</li>
                  <li>• Local pickups and smart delivery routing</li>
                </ul>
              </div>

              <div>
                <img src="https://images.unsplash.com/photo-1580281657529-9d8c7b8f5b1b?auto=format&fit=crop&w=800&q=60" alt="mission" className="rounded-2xl shadow-lg w-full object-cover h-72" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-slate-900">Key Features</motion.h3>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard icon={<Pill className="w-6 h-6 text-teal-600" />} title="Medicine Donation" desc="Donate unused medicines easily." />
              <FeatureCard icon={<Users className="w-6 h-6 text-blue-600" />} title="Pharmacy & Company Integration" desc="Manage surplus stock securely." />
              <FeatureCard icon={<Truck className="w-6 h-6 text-sky-600" />} title="Smart Delivery Link System" desc="Delivery partners receive instant links without login." />
              <FeatureCard icon={<HeartPulse className="w-6 h-6 text-pink-500" />} title="NGO & Hospital Requests" desc="Verified NGOs can request essential medicines." />
              <FeatureCard icon={<CheckCircle className="w-6 h-6 text-emerald-500" />} title="Admin Control Panel" desc="Manage verifications, approvals, and delivery flow." />
              <FeatureCard icon={<Mail className="w-6 h-6 text-indigo-500" />} title="Transparency & Tracking" desc="Real-time tracking for all activities." />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-slate-900">How It Works</motion.h3>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
              <StepCard step={1} title="Donate or Request" desc="Donors add medicines or NGOs request them." icon={<Pill className='w-6 h-6 text-teal-600' />} />
              <StepCard step={2} title="Verification & Approval" desc="Pharmacists & AI verify the items." icon={<CheckCircle className='w-6 h-6 text-emerald-500' />} />
              <StepCard step={3} title="Delivery Assignment" desc="Smart partner assignment and tracking." icon={<Truck className='w-6 h-6 text-sky-600' />} />
              <StepCard step={4} title="Successful Handover" desc="Recipient confirms and record is stored." icon={<HeartPulse className='w-6 h-6 text-pink-500' />} />
            </div>
          </div>
        </section>

        {/* IMPACT / STATS */}
        <section id="impact" className="py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-slate-900">Our Impact</motion.h3>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Stat label="Medicines Donated" to={1287} />
              <Stat label="Verified NGOs" to={234} />
              <Stat label="Successful Deliveries" to={1050} />
              <Stat label="Active Donors" to={689} />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-slate-900">What Our Partners Say</motion.h3>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Testimonial author="Sanjay - NGO" role="Coordinator">PharmaRevo helped us get critical medicines for remote camps quickly and safely.</Testimonial>
              <Testimonial author="Priya - Donor" role="Individual">The donation flow was simple and the team verified everything professionally.</Testimonial>
              <Testimonial author="Ramesh - Pharmacy" role="Manager">Integrating surplus stock was seamless and reduced our waste dramatically.</Testimonial>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center text-slate-900">Contact Us</motion.h3>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow">
                <form onSubmit={(e) => { e.preventDefault(); alert('Message sent (demo)'); }} className="space-y-4">
                  <input required className="w-full p-3 border rounded-lg" placeholder="Your name" />
                  <input required type="email" className="w-full p-3 border rounded-lg" placeholder="Email address" />
                  <textarea required className="w-full p-3 border rounded-lg" rows={5} placeholder="Message"></textarea>
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg">Send Message</button>
                </form>
              </div>

              <div className="p-6">
                <div className="text-gray-700">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm">support@pharmarevo.org</div>
                </div>

                <div className="mt-6 text-gray-700">
                  <div className="font-semibold">Follow Us</div>
                  <div className="flex gap-3 mt-3">
                    <a href="#" className="p-2 rounded-lg bg-white shadow"><Twitter className="w-5 h-5 text-sky-500" /></a>
                    <a href="#" className="p-2 rounded-lg bg-white shadow"><Linkedin className="w-5 h-5 text-sky-700" /></a>
                    <a href="#" className="p-2 rounded-lg bg-white shadow"><Github className="w-5 h-5 text-gray-800" /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© {new Date().getFullYear()} PharmaRevo — Developed by Team PharmaRevo</div>
            <div className="flex gap-4 text-sm">
              <a href="#" onClick={() => scrollToId('about')}>About</a>
              <a href="#" onClick={() => scrollToId('contact')}>Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ---------------------- Subcomponents ---------------------- */

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ translateY: -6 }} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
      <div className="flex items-center gap-4 mb-3">{icon}<div className="text-lg font-semibold">{title}</div></div>
      <div className="text-sm text-gray-600">{desc}</div>
    </motion.div>
  );
}

function StepCard({ step, title, desc, icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-6 rounded-2xl shadow text-center">
      <div className="w-12 h-12 rounded-full bg-teal-50 mx-auto flex items-center justify-center text-teal-600 font-bold">{step}</div>
      <div className="mt-4 font-semibold">{title}</div>
      <div className="text-sm text-gray-600 mt-2">{desc}</div>
      <div className="mt-4 flex justify-center">{icon}</div>
    </motion.div>
  );
}

function Testimonial({ children, author, role }) {
  return (
    <motion.blockquote initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow">
      <div className="text-gray-700 italic">“{children}”</div>
      <div className="mt-4 font-semibold">{author}</div>
      <div className="text-sm text-gray-500">{role}</div>
    </motion.blockquote>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="p-2 bg-white rounded-md shadow" onClick={() => setOpen(!open)}>Menu</button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => { scrollToId(l.id); setOpen(false); }} className="text-left">{l.name}</button>
            ))}
            <button onClick={() => { scrollToId('donate'); setOpen(false); }} className="mt-2 bg-teal-600 text-white px-3 py-2 rounded">Donate</button>
          </div>
        </div>
      )}
    </div>
  );
}
