import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, ShoppingCart, X, CreditCard, QrCode, Check, Copy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GiftItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  totalValue: number;
  totalContributed: number;
  progress: number;
}

interface CartItem {
  giftId: string;
  giftTitle: string;
  amount: number;
}

const mockGifts: GiftItem[] = [
  { id: '1', title: 'Lua de Mel em Paris', description: 'Nossa viagem dos sonhos para a cidade do amor', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', totalValue: 15000, totalContributed: 8750, progress: 58 },
  { id: '2', title: 'Jantar Romântico', description: 'Um jantar especial para celebrar nosso amor', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', totalValue: 500, totalContributed: 200, progress: 40 },
  { id: '3', title: 'Experiência Spa', description: 'Dia de relaxamento para o casal', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', totalValue: 800, totalContributed: 0, progress: 0 },
  { id: '4', title: 'Adega Premium', description: 'Vinhos especiais para nossa coleção', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80', totalValue: 2000, totalContributed: 1200, progress: 60 },
  { id: '5', title: 'Curso de Culinária', description: 'Aprender receitas novas juntos', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', totalValue: 600, totalContributed: 600, progress: 100 },
  { id: '6', title: 'Fotógrafo Profissional', description: 'Sessão de fotos para eternizar nossos momentos', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80', totalValue: 3000, totalContributed: 1500, progress: 50 },
];

export default function GiftList() {
  const [gifts] = useState<GiftItem[]>(mockGifts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerCPF, setPayerCPF] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    const savedCart = localStorage.getItem('weddingCart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('weddingCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (pixGenerated && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [pixGenerated, timeLeft]);

  const addToCart = (gift: GiftItem) => {
    const giftAmount = parseFloat(amount);
    if (!giftAmount || giftAmount < 50) {
      toast.error('O valor mínimo é R$ 50,00');
      return;
    }
    const existingItem = cart.find((item) => item.giftId === gift.id);
    if (existingItem) {
      setCart(cart.map((item) => item.giftId === gift.id ? { ...item, amount: item.amount + giftAmount } : item));
    } else {
      setCart([...cart, { giftId: gift.id, giftTitle: gift.title, amount: giftAmount }]);
    }
    toast.success(`${formatCurrency(giftAmount)} adicionado ao carrinho!`);
    setAmount('');
    setSelectedGift(null);
  };

  const removeFromCart = (giftId: string) => {
    setCart(cart.filter((item) => item.giftId !== giftId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handlePixPayment = async () => {
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setPixGenerated(true);
      setTimeLeft(1800);
      setIsLoading(false);
      toast.success('PIX gerado com sucesso!');
    }, 1500);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136email@exemplo.com52040000530398654061000.005802BR5913Maria e Joao6009SAO PAULO62140510ABC123DEF6304');
    toast.success('Código PIX copiado!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };

  return (
    <section id="presentes" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <Gift className="w-8 h-8 mx-auto text-[#D4AF37] mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4">Lista de Presentes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sua presença é o maior presente! Mas se quiser nos presentear, escolha algo especial da nossa lista.</p>
        </motion.div>
        <div className="flex justify-end mb-6">
          <button onClick={() => setShowCart(true)} className="flex items-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white px-6 py-3 rounded-full hover:shadow-lg transition-all">
            <ShoppingCart className="w-5 h-5" />
            <span>Carrinho ({cart.length})</span>
            {cartTotal > 0 && <span className="bg-white/20 px-2 py-1 rounded-full text-sm">{formatCurrency(cartTotal)}</span>}
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift, index) => (
            <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="gift-card">
              <div className="relative">
                <img src={gift.imageUrl} alt={gift.title} className="gift-card-image" />
                {gift.progress >= 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full font-medium">Concluído</span>
                  </div>
                )}
              </div>
              <div className="gift-card-content">
                <h3 className="gift-card-title">{gift.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{gift.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Arrecadado</span>
                    <span className="font-medium">{gift.progress}%</span>
                  </div>
                  <Progress value={gift.progress} className="h-2" />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#D4AF37] font-medium">{formatCurrency(gift.totalContributed)}</span>
                    <span className="text-gray-400">de {formatCurrency(gift.totalValue)}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedGift(gift)} disabled={gift.progress >= 100} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {gift.progress >= 100 ? 'Presente Concluído' : 'Contribuir'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{selectedGift?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedGift?.description}</p>
              <div>
                <Label>Valor da contribuição (mínimo R$ 50)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input type="number" min="50" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10" placeholder="100,00" />
                </div>
              </div>
              <div className="flex gap-2">
                {[50, 100, 200, 500].map((value) => (
                  <button key={value} onClick={() => setAmount(value.toString())} className="flex-1 py-2 px-3 rounded-lg border border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-sm">R$ {value}</button>
                ))}
              </div>
              <Button onClick={() => selectedGift && addToCart(selectedGift)} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6]">Adicionar ao Carrinho</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl flex items-center gap-2"><ShoppingCart className="w-6 h-6" />Seu Carrinho</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Seu carrinho está vazio</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.giftId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.giftTitle}</p>
                        <p className="text-[#D4AF37] font-semibold">{formatCurrency(item.amount)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.giftId)} className="text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-gradient">{formatCurrency(cartTotal)}</span>
                    </div>
                    <Button onClick={() => { setShowCart(false); setPaymentModalOpen(true); }} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white py-4">Finalizar Presente</Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Finalizar Presente</DialogTitle>
            </DialogHeader>
            {!pixGenerated ? (
              <Tabs defaultValue="pix" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pix" className="flex items-center gap-2"><QrCode className="w-4 h-4" />PIX</TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center gap-2"><CreditCard className="w-4 h-4" />Cartão</TabsTrigger>
                </TabsList>
                <TabsContent value="pix" className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" /><strong>10% de desconto</strong> pagando com PIX!</p>
                  </div>
                  <div className="space-y-4">
                    <div><Label>Nome completo</Label><Input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Seu nome" /></div>
                    <div><Label>Email</Label><Input type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="seu@email.com" /></div>
                    <div><Label>CPF</Label><Input value={payerCPF} onChange={(e) => setPayerCPF(formatCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} /></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked as boolean)} />
                      <Label htmlFor="anonymous" className="text-sm cursor-pointer">Presente anônimo</Label>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center"><span className="text-gray-600">Valor original:</span><span className="line-through">{formatCurrency(cartTotal)}</span></div>
                      <div className="flex justify-between items-center text-lg font-semibold"><span className="text-green-600">Com desconto PIX:</span><span className="text-green-600">{formatCurrency(cartTotal * 0.9)}</span></div>
                    </div>
                    <Button onClick={handlePixPayment} disabled={isLoading || !payerName || !payerEmail || payerCPF.length < 14} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white py-4">{isLoading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}</Button>
                  </div>
                </TabsContent>
                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-4">
                    <div><Label>Nome no cartão</Label><Input placeholder="Nome como está no cartão" /></div>
                    <div><Label>Número do cartão</Label><Input placeholder="0000 0000 0000 0000" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Validade</Label><Input placeholder="MM/AA" /></div>
                      <div><Label>CVV</Label><Input placeholder="123" /></div>
                    </div>
                    <div>
                      <Label>Parcelas</Label>
                      <Select value={installments} onValueChange={setInstallments}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n}x de {formatCurrency(cartTotal / n)} (sem juros)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white py-4">Pagar {formatCurrency(cartTotal)}</Button>
                    <p className="text-xs text-gray-500 text-center">Pagamento processado com segurança pelo Mercado Pago</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 flex items-center justify-center gap-2"><Check className="w-5 h-5" />PIX gerado com sucesso!</p>
                </div>
                <div className="qr-code-container inline-block">
                  <QRCodeSVG value="00020126580014BR.GOV.BCB.PIX0136email@exemplo.com52040000530398654061000.005802BR5913Maria e Joao6009SAO PAULO62140510ABC123DEF6304" size={256} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Escaneie o QR Code ou copie o código:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-3 rounded-lg text-xs break-all">00020126580014BR.GOV.BCB.PIX0136email@exemplo.com...</code>
                    <button onClick={copyPixCode} className="p-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C9A9A6] transition-colors"><Copy className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-sm text-gray-500">O QR Code expira em 30 minutos. Após o pagamento, você receberá um email de confirmação.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
