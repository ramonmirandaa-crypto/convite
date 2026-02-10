import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ChevronDown } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const weddingDate = new Date('2025-06-22T16:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: differenceInDays(weddingDate, now),
          hours: differenceInHours(weddingDate, now) % 24,
          minutes: differenceInMinutes(weddingDate, now) % 60,
          seconds: differenceInSeconds(weddingDate, now) % 60,
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToStory = () => {
    document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-lg md:text-xl font-light tracking-widest uppercase mb-4">Estamos nos casando</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6">Maria <span className="text-[#D4AF37]">&</span> João</motion.h1>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex items-center justify-center space-x-4 mb-8">
          <Heart className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <p className="text-xl md:text-2xl font-light">{format(weddingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          <Heart className="w-5 h-5 text-[#D4AF37] animate-pulse" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-12">
          <p className="text-sm uppercase tracking-widest mb-4 opacity-80">Falta pouco para o grande dia</p>
          <div className="flex justify-center items-center space-x-4 md:space-x-8">
            {[{ value: timeLeft.days, label: 'Dias' }, { value: timeLeft.hours, label: 'Horas' }, { value: timeLeft.minutes, label: 'Minutos' }, { value: timeLeft.seconds, label: 'Segundos' }].map((item, index) => (
              <div key={index} className="countdown-item">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[100px]">
                  <span className="countdown-value text-white">{String(item.value).padStart(2, '0')}</span>
                </div>
                <span className="countdown-label text-white/70 text-xs md:text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
          <button onClick={scrollToStory} className="btn-primary text-lg px-10 py-4">Nossa História</button>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="cursor-pointer" onClick={scrollToStory}>
          <ChevronDown className="w-8 h-8 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
