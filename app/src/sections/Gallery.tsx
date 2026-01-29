import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', alt: 'Casal feliz', caption: 'Nosso primeiro ensaio' },
  { id: 2, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Mãos dadas', caption: 'Juntos para sempre' },
  { id: 3, src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', alt: 'Anel de noivado', caption: 'O sim mais importante' },
  { id: 4, src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', alt: 'Pôr do sol', caption: 'Momentos inesquecíveis' },
  { id: 5, src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&q=80', alt: 'Casal sorrindo', caption: 'Nosso sorriso' },
  { id: 6, src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80', alt: 'Buquê de flores', caption: 'Detalhes que amamos' },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (image: typeof galleryImages[0], index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => setSelectedImage(null);

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  return (
    <section id="galeria" className="section-padding bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <Camera className="w-8 h-8 mx-auto text-[#D4AF37] mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4">Nossa Galeria</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Alguns dos momentos mais especiais da nossa história de amor.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group" onClick={() => openLightbox(image, index)}>
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium text-sm">{image.caption}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10">
              <X className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToPrevious(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10">
              <ChevronRight className="w-10 h-10" />
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-4xl max-h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <p className="text-white text-lg font-medium">{selectedImage.caption}</p>
                <p className="text-white/60 text-sm mt-1">{currentIndex + 1} de {galleryImages.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
