import { motion } from 'framer-motion';
import { Heart, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2C2C2C] text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
              <span className="font-serif text-2xl font-semibold">Maria & João</span>
            </div>
            <p className="text-gray-400 mb-4">22 de Junho de 2025<br />São Paulo, SP</p>
            <p className="text-gray-500 text-sm">"O amor é paciente, o amor é bondoso."</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center">
            <h4 className="font-serif text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {[{ label: 'Nossa História', href: '#historia' }, { label: 'Informações do Evento', href: '#evento' }, { label: 'Galeria', href: '#galeria' }, { label: 'Lista de Presentes', href: '#presentes' }, { label: 'Confirmar Presença', href: '#rsvp' }].map((link) => (
                <li key={link.href}><a href={link.href} className="text-gray-400 hover:text-[#D4AF37] transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center md:text-right">
            <h4 className="font-serif text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a href="mailto:casamento@mariajoao.com" className="flex items-center justify-center md:justify-end space-x-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Mail className="w-4 h-4" /><span>casamento@mariajoao.com</span>
              </a>
              <a href="tel:+5511999999999" className="flex items-center justify-center md:justify-end space-x-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Phone className="w-4 h-4" /><span>(11) 99999-9999</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-end space-x-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Instagram className="w-4 h-4" /><span>@mariajoao2025</span>
              </a>
            </div>
          </motion.div>
        </div>
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">© {currentYear} Maria & João. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Feito com</span><Heart className="w-4 h-4 text-[#D4AF37] fill-current" /><span>para o nosso grande dia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
