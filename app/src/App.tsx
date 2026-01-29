import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Gift, Calendar, Camera, Mail, Music } from 'lucide-react';
import Hero from './sections/Hero';
import OurStory from './sections/OurStory';
import EventInfo from './sections/EventInfo';
import Gallery from './sections/Gallery';
import GiftList from './sections/GiftList';
import RSVP from './sections/RSVP';
import Footer from './sections/Footer';
import FallingPetals from './components/FallingPetals';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    const musicChoice = localStorage.getItem('weddingMusicChoice');
    if (musicChoice === null) {
      setShowMusicPrompt(true);
    } else {
      setMusicEnabled(musicChoice === 'enabled');
    }
  }, []);

  const handleMusicChoice = (enabled: boolean) => {
    setMusicEnabled(enabled);
    localStorage.setItem('weddingMusicChoice', enabled ? 'enabled' : 'disabled');
    setShowMusicPrompt(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] overflow-x-hidden">
      <FallingPetals />
      <MusicPlayer enabled={musicEnabled} />
      
      {showMusicPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <Music className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
            <h3 className="text-2xl font-serif font-semibold mb-3">Deseja ativar a música?</h3>
            <p className="text-gray-600 mb-6">Temos uma trilha sonora especial para acompanhar sua visita.</p>
            <div className="flex gap-4">
              <button onClick={() => handleMusicChoice(false)} className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Não, obrigado</button>
              <button onClick={() => handleMusicChoice(true)} className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white font-medium hover:shadow-lg transition-all">Sim, tocar!</button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
              <span className="font-serif text-lg font-semibold text-[#2C2C2C]">Maria & João</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {[{ id: 'historia', label: 'Nossa História', icon: Heart }, { id: 'evento', label: 'Evento', icon: Calendar }, { id: 'galeria', label: 'Galeria', icon: Camera }, { id: 'presentes', label: 'Presentes', icon: Gift }, { id: 'rsvp', label: 'RSVP', icon: Mail }].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-16">
        <Hero />
        <OurStory />
        <EventInfo />
        <Gallery />
        <GiftList />
        <RSVP />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
