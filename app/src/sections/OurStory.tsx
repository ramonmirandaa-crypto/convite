import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Heart, Calendar, MapPin, Sparkles } from 'lucide-react';

const timelineEvents = [
  { date: '2018', title: 'Nosso Primeiro Encontro', description: 'Nos conhecemos em uma festa de amigos em comum. Foi amor à primeira vista!', icon: Sparkles },
  { date: '2019', title: 'Primeira Viagem Juntos', description: 'Viajamos para o litoral e descobrimos o quanto gostamos de aventuras juntos.', icon: MapPin },
  { date: '2021', title: 'Mudança Juntos', description: 'Decidimos morar juntos e começar nossa vida a dois de verdade.', icon: Heart },
  { date: '2024', title: 'O Pedido', description: 'Num pôr do sol inesquecível, ele fez o pedido mais importante da nossa vida.', icon: Calendar },
];

export default function OurStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="historia" className="section-padding bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <Heart className="w-8 h-8 mx-auto text-[#D4AF37] mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4">Nossa História</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Cada momento ao seu lado tem sido uma bênção. Essa é a história de como nossos caminhos se cruzaram.</p>
        </motion.div>
        <div ref={ref} className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#C9A9A6] rounded-full hidden md:block" />
          <div className="space-y-12 md:space-y-0">
            {timelineEvents.map((event, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.2 }} className={`relative md:flex md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="card-elegant p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] flex items-center justify-center">
                        <event.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-2xl font-serif font-bold text-gradient">{event.date}</span>
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-[#2C2C2C] mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
                <div className="hidden md:flex md:w-2/12 justify-center">
                  <motion.div initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }} className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] border-4 border-white shadow-lg z-10" />
                </div>
                <div className="md:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8 }} className="mt-16 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif italic text-[#2C2C2C] max-w-3xl mx-auto">"O amor não se vê, se sente. E eu sinto o seu amor em cada batida do meu coração."</blockquote>
          <p className="mt-4 text-[#D4AF37] font-medium">— Para sempre juntos</p>
        </motion.div>
      </div>
    </section>
  );
}
