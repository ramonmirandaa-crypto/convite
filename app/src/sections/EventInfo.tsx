import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Shirt, Cloud, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventInfo() {
  const weddingDate = new Date('2025-06-22T16:00:00');
  const eventDetails = [
    { icon: Calendar, title: 'Data', content: format(weddingDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }), subContent: 'Cerimônia às 16:00' },
    { icon: MapPin, title: 'Local', content: 'Espaço Garden Eventos', subContent: 'Rua das Flores, 123 - São Paulo, SP' },
    { icon: Clock, title: 'Horário', content: '16:00 - Cerimônia', subContent: '17:30 - Recepção' },
    { icon: Shirt, title: 'Dress Code', content: 'Traje de Festa', subContent: 'Cores claras recomendadas' },
  ];

  return (
    <section id="evento" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <Calendar className="w-8 h-8 mx-auto text-[#D4AF37] mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4">Informações do Evento</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tudo o que você precisa saber para celebrar conosco neste dia tão especial.</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="grid sm:grid-cols-2 gap-6">
            {eventDetails.map((detail, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="card-elegant p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#C9A9A6]/20 flex items-center justify-center mb-4">
                  <detail.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#2C2C2C] mb-2">{detail.title}</h3>
                <p className="text-gray-800 font-medium">{detail.content}</p>
                <p className="text-gray-500 text-sm">{detail.subContent}</p>
              </motion.div>
            ))}
          </div>
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="card-elegant overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197588639916!2d-46.6523!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzknMDguMyJX!5e0!3m2!1spt-BR!2sbr!4v1609459200000!5m2!1spt-BR!2sbr" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="absolute inset-0" />
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-semibold text-[#2C2C2C]">Como Chegar</h4>
                    <p className="text-sm text-gray-500">Espaço Garden Eventos</p>
                  </div>
                  <a href="https://maps.google.com/?q=Espaço+Garden+Eventos+São+Paulo" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-[#D4AF37] hover:text-[#C9A9A6] transition-colors">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm font-medium">Abrir Maps</span>
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="card-elegant p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Cloud className="w-6 h-6 text-[#D4AF37]" />
                <h4 className="font-serif font-semibold text-[#2C2C2C]">Previsão do Tempo</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#2C2C2C]">24°C</p>
                  <p className="text-gray-500">Parcialmente nublado</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">São Paulo, SP</p>
                  <p className="text-sm text-gray-400">Previsão para 22/06</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600"><strong>Dica:</strong> O evento será em ambiente aberto e coberto. Recomendamos trazer um casa leve para a noite.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
