import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Users, Utensils, Music, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RSVPFormData {
  name: string;
  email: string;
  phone: string;
  guestCount: number;
  dietaryRestrictions: string;
  suggestedSong: string;
}

export default function RSVP() {
  const [formData, setFormData] = useState<RSVPFormData>({ name: '', email: '', phone: '', guestCount: 1, dietaryRestrictions: '', suggestedSong: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrCodeToken, setQrCodeToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setQrCodeToken(token);
      setShowSuccessModal(true);
      toast.success('Presença confirmada com sucesso!');
      setFormData({ name: '', email: '', phone: '', guestCount: 1, dietaryRestrictions: '', suggestedSong: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <section id="rsvp" className="section-padding bg-gradient-to-b from-[#FAF9F6] to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <Mail className="w-8 h-8 mx-auto text-[#D4AF37] mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4">Confirme sua Presença</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sua presença é muito importante para nós! Por favor, confirme até o dia 01/06/2025.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="card-elegant p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#D4AF37]" />Nome Completo *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome completo" required className="input-elegant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#D4AF37]" />Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" required className="input-elegant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D4AF37]" />Telefone (WhatsApp)</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="(00) 00000-0000" maxLength={15} className="input-elegant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestCount" className="flex items-center gap-2"><Users className="w-4 h-4 text-[#D4AF37]" />Quantidade de Acompanhantes *</Label>
                <select id="guestCount" value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })} className="input-elegant" required>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'pessoa' : 'pessoas'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions" className="flex items-center gap-2"><Utensils className="w-4 h-4 text-[#D4AF37]" />Restrições Alimentares</Label>
              <Input id="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })} placeholder="Vegetariano, vegano, alergias, etc." className="input-elegant" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suggestedSong" className="flex items-center gap-2"><Music className="w-4 h-4 text-[#D4AF37]" />Sugestão de Música</Label>
              <Input id="suggestedSong" value={formData.suggestedSong} onChange={(e) => setFormData({ ...formData, suggestedSong: e.target.value })} placeholder="Qual música não pode faltar na festa?" className="input-elegant" />
            </div>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.email} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white py-6 text-lg font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {isSubmitting ? 'Confirmando...' : 'Confirmar Presença'}
            </Button>
            <p className="text-center text-sm text-gray-500">Ao confirmar, você receberá um email com seu QR Code de entrada.</p>
          </form>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-12 h-12 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4"><Mail className="w-6 h-6 text-[#D4AF37]" /></div>
            <h4 className="font-serif font-semibold mb-2">Confirmação por Email</h4>
            <p className="text-sm text-gray-600">Você receberá um email com seu QR Code de entrada.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-12 h-12 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4"><Users className="w-6 h-6 text-[#D4AF37]" /></div>
            <h4 className="font-serif font-semibold mb-2">Acompanhantes</h4>
            <p className="text-sm text-gray-600">Informe quantas pessoas irão com você.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-12 h-12 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4"><Utensils className="w-6 h-6 text-[#D4AF37]" /></div>
            <h4 className="font-serif font-semibold mb-2">Cardápio Especial</h4>
            <p className="text-sm text-gray-600">Informe suas restrições alimentares.</p>
          </div>
        </motion.div>
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center justify-center gap-2"><Check className="w-8 h-8 text-green-500" />Presença Confirmada!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-gray-600">Estamos muito felizes em confirmar sua presença! Um email foi enviado com todos os detalhes.</p>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Seu QR Code de entrada:</p>
              <code className="block bg-white p-4 rounded-lg font-mono text-lg break-all border-2 border-dashed border-[#D4AF37]">{qrCodeToken}</code>
            </div>
            <p className="text-sm text-gray-500">Apresente este código na entrada do evento ou o email de confirmação.</p>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6]">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
