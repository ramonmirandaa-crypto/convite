'use client'

import React from 'react';

// Rosa vermelha central do buquê
export const RedRose = ({ className = '', size = 120 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
    <defs>
      <radialGradient id="roseCenter" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8B1538" />
        <stop offset="40%" stopColor="#B8333C" />
        <stop offset="100%" stopColor="#C41E3A" />
      </radialGradient>
      <radialGradient id="rosePetal" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#D4653C" />
        <stop offset="50%" stopColor="#B8333C" />
        <stop offset="100%" stopColor="#8B1538" />
      </radialGradient>
    </defs>
    {/* Pétalas externas */}
    <ellipse cx="60" cy="85" rx="35" ry="25" fill="url(#rosePetal)" transform="rotate(-15 60 85)" />
    <ellipse cx="60" cy="85" rx="35" ry="25" fill="url(#rosePetal)" transform="rotate(15 60 85)" />
    <ellipse cx="35" cy="60" rx="25" ry="30" fill="url(#rosePetal)" transform="rotate(-30 35 60)" />
    <ellipse cx="85" cy="60" rx="25" ry="30" fill="url(#rosePetal)" transform="rotate(30 85 60)" />
    {/* Pétalas intermediárias */}
    <ellipse cx="50" cy="50" rx="22" ry="28" fill="url(#rosePetal)" transform="rotate(-20 50 50)" />
    <ellipse cx="70" cy="50" rx="22" ry="28" fill="url(#rosePetal)" transform="rotate(20 70 50)" />
    <ellipse cx="60" cy="70" rx="28" ry="22" fill="url(#rosePetal)" />
    {/* Pétalas internas */}
    <ellipse cx="55" cy="45" rx="15" ry="20" fill="url(#roseCenter)" transform="rotate(-10 55 45)" />
    <ellipse cx="65" cy="45" rx="15" ry="20" fill="url(#roseCenter)" transform="rotate(10 65 45)" />
    {/* Centro da rosa */}
    <ellipse cx="60" cy="40" rx="10" ry="12" fill="#8B1538" />
    <path d="M60 35 Q65 40 60 50 Q55 40 60 35" fill="#6B1030" />
  </svg>
);

// Flor laranja/terracota
export const OrangeFlower = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className={className}>
    <defs>
      <radialGradient id="orangePetal" cx="50%" cy="80%" r="80%">
        <stop offset="0%" stopColor="#F4A460" />
        <stop offset="40%" stopColor="#E07B39" />
        <stop offset="100%" stopColor="#D4653C" />
      </radialGradient>
    </defs>
    {/* Pétalas - 8 pétalas radiais */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <ellipse
        key={i}
        cx="40"
        cy="20"
        rx="10"
        ry="22"
        fill="url(#orangePetal)"
        transform={`rotate(${angle} 40 40)`}
      />
    ))}
    {/* Centro */}
    <circle cx="40" cy="40" r="12" fill="#8B6914" />
    <circle cx="40" cy="40" r="8" fill="#D4653C" />
    {/* Pontos no centro */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <circle
        key={i}
        cx={40 + 5 * Math.cos((angle * Math.PI) / 180)}
        cy={40 + 5 * Math.sin((angle * Math.PI) / 180)}
        r="2"
        fill="#F4D76B"
      />
    ))}
  </svg>
);

// Flor amarela/dourada
export const YellowFlower = ({ className = '', size = 70 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" className={className}>
    <defs>
      <radialGradient id="yellowPetal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F4D76B" />
        <stop offset="50%" stopColor="#E8B84A" />
        <stop offset="100%" stopColor="#D4A03A" />
      </radialGradient>
    </defs>
    {/* Pétalas amarelas */}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={i}
        cx="35"
        cy="12"
        rx="6"
        ry="18"
        fill="url(#yellowPetal)"
        transform={`rotate(${i * 30} 35 35)`}
      />
    ))}
    {/* Centro marrom */}
    <circle cx="35" cy="35" r="10" fill="#8B6914" />
    <circle cx="35" cy="35" r="7" fill="#B8860B" />
  </svg>
);

// Flor estilo cravo/dália rosa
export const PinkDahlia = ({ className = '', size = 90 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" className={className}>
    <defs>
      <radialGradient id="pinkDahlia" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#E89B6C" />
        <stop offset="50%" stopColor="#D4653C" />
        <stop offset="100%" stopColor="#B85A3C" />
      </radialGradient>
    </defs>
    {/* Camadas de pétalas */}
    {Array.from({ length: 16 }).map((_, i) => (
      <ellipse
        key={`outer-${i}`}
        cx="45"
        cy="18"
        rx="8"
        ry="20"
        fill="url(#pinkDahlia)"
        transform={`rotate(${i * 22.5} 45 45)`}
      />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={`inner-${i}`}
        cx="45"
        cy="25"
        rx="6"
        ry="14"
        fill="#E89B6C"
        transform={`rotate(${i * 30 + 15} 45 45)`}
      />
    ))}
    {/* Centro */}
    <circle cx="45" cy="45" r="8" fill="#8B6914" />
  </svg>
);

// Folha verde
export const GreenLeaf = ({ className = '', size = 60, flipped = false }: { className?: string; size?: number; flipped?: boolean }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 60 60" 
    className={className}
    style={{ transform: flipped ? 'scaleX(-1)' : undefined }}
  >
    <defs>
      <linearGradient id="leafGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4A5D3D" />
        <stop offset="50%" stopColor="#5B7248" />
        <stop offset="100%" stopColor="#8FA678" />
      </linearGradient>
    </defs>
    <path
      d="M30 55 Q10 35 5 15 Q25 10 30 5 Q35 10 55 15 Q50 35 30 55 Z"
      fill="url(#leafGradient)"
    />
    <path
      d="M30 55 Q30 30 30 5"
      stroke="#3D4A33"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M30 45 Q20 35 15 25 M30 40 Q40 30 45 20 M30 35 Q25 25 22 18 M30 30 Q35 22 38 16"
      stroke="#6B7A5A"
      strokeWidth="0.5"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

// Eucalipto/folhagem seca
export const Eucalyptus = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className={className}>
    <defs>
      <linearGradient id="eucalyptusGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6B7A5A" />
        <stop offset="100%" stopColor="#8FA678" />
      </linearGradient>
    </defs>
    {/* Ramo principal */}
    <path d="M40 75 Q40 50 40 25" stroke="#7A6B4A" strokeWidth="2" fill="none" />
    {/* Folhas redondas de eucalipto */}
    <circle cx="40" cy="25" r="8" fill="url(#eucalyptusGrad)" />
    <circle cx="30" cy="35" r="7" fill="url(#eucalyptusGrad)" />
    <circle cx="50" cy="32" r="7" fill="url(#eucalyptusGrad)" />
    <circle cx="35" cy="45" r="8" fill="url(#eucalyptusGrad)" />
    <circle cx="48" cy="42" r="6" fill="url(#eucalyptusGrad)" />
    <circle cx="40" cy="55" r="9" fill="url(#eucalyptusGrad)" />
    <circle cx="32" cy="62" r="6" fill="url(#eucalyptusGrad)" />
    <circle cx="50" cy="58" r="7" fill="url(#eucalyptusGrad)" />
  </svg>
);

// Flor seca/erva da pampas estilizada
export const DriedPampas = ({ className = '', size = 100 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="pampasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5E6C8" />
        <stop offset="100%" stopColor="#E5D4A1" />
      </linearGradient>
    </defs>
    {/* Hastes finas */}
    <path d="M50 90 Q48 60 45 30" stroke="#C4B896" strokeWidth="1" fill="none" />
    <path d="M50 90 Q52 55 58 25" stroke="#C4B896" strokeWidth="1" fill="none" />
    <path d="M50 90 Q46 50 35 35" stroke="#C4B896" strokeWidth="1" fill="none" />
    <path d="M50 90 Q54 52 65 38" stroke="#C4B896" strokeWidth="1" fill="none" />
    {/* Plumas */}
    <ellipse cx="45" cy="28" rx="12" ry="4" fill="url(#pampasGrad)" transform="rotate(-20 45 28)" />
    <ellipse cx="58" cy="24" rx="14" ry="5" fill="url(#pampasGrad)" transform="rotate(15 58 24)" />
    <ellipse cx="35" cy="33" rx="10" ry="4" fill="url(#pampasGrad)" transform="rotate(-30 35 33)" />
    <ellipse cx="65" cy="36" rx="11" ry="4" fill="url(#pampasGrad)" transform="rotate(25 65 36)" />
  </svg>
);

// Elemento decorativo - círculo floral
export const FloralCircle = ({ className = '', size = 200 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
    <defs>
      <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4653C" />
        <stop offset="50%" stopColor="#E8B84A" />
        <stop offset="100%" stopColor="#B8333C" />
      </linearGradient>
    </defs>
    {/* Círculo base */}
    <circle cx="100" cy="100" r="90" fill="none" stroke="url(#circleGrad)" strokeWidth="1" opacity="0.3" />
    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#circleGrad)" strokeWidth="0.5" opacity="0.2" strokeDasharray="5,5" />
    {/* Flores decorativas ao redor */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 100 + 75 * Math.cos(rad);
      const y = 100 + 75 * Math.sin(rad);
      return (
        <g key={i} transform={`translate(${x - 15}, ${y - 15})`}>
          <circle cx="15" cy="15" r="8" fill="#E8B84A" opacity="0.6" />
          <circle cx="15" cy="15" r="4" fill="#D4653C" />
        </g>
      );
    })}
    {/* Folhas decorativas */}
    {[30, 90, 150, 210, 270, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 100 + 82 * Math.cos(rad);
      const y = 100 + 82 * Math.sin(rad);
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="6"
          ry="12"
          fill="#5B7248"
          opacity="0.5"
          transform={`rotate(${angle + 90} ${x} ${y})`}
        />
      );
    })}
  </svg>
);

// Buquê completo (composição)
export const BouquetDecoration = ({ className = '', size = 300 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 300 300" className={className}>
    <g transform="translate(150, 180)">
      {/* Folhagem de fundo */}
      <g transform="translate(-80, -60)">
        <GreenLeaf size={80} />
      </g>
      <g transform="translate(40, -70) rotate(30)">
        <GreenLeaf size={70} flipped />
      </g>
      <g transform="translate(-60, 20) rotate(-20)">
        <GreenLeaf size={60} />
      </g>
      
      {/* Flores secas/gramíneas */}
      <g transform="translate(-90, -80) rotate(-15)">
        <DriedPampas size={100} />
      </g>
      <g transform="translate(50, -90) rotate(20)">
        <DriedPampas size={90} />
      </g>
      
      {/* Flores laranja */}
      <g transform="translate(-50, -80)">
        <OrangeFlower size={70} />
      </g>
      <g transform="translate(30, -90)">
        <OrangeFlower size={65} />
      </g>
      
      {/* Flores amarelas */}
      <g transform="translate(-70, -40)">
        <YellowFlower size={55} />
      </g>
      <g transform="translate(50, -50)">
        <YellowFlower size={50} />
      </g>
      
      {/* Rosas laterais */}
      <g transform="translate(-30, -70) rotate(-10)">
        <PinkDahlia size={75} />
      </g>
      <g transform="translate(20, -75) rotate(10)">
        <PinkDahlia size={70} />
      </g>
      
      {/* Rosa central vermelha */}
      <g transform="translate(0, -100)">
        <RedRose size={120} />
      </g>
      
      {/* Folhas da rosa */}
      <g transform="translate(-40, -20) rotate(-45)">
        <GreenLeaf size={50} />
      </g>
      <g transform="translate(30, -25) rotate(45)">
        <GreenLeaf size={45} flipped />
      </g>
      
      {/* Eucalipto */}
      <g transform="translate(-100, -30) rotate(-30)">
        <Eucalyptus size={70} />
      </g>
      <g transform="translate(70, -40) rotate(25)">
        <Eucalyptus size={65} />
      </g>
    </g>
  </svg>
);

// Elemento divisor floral horizontal
export const FloralDivider = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4653C] to-transparent opacity-40" />
    <div className="flex items-center gap-1">
      <YellowFlower size={24} />
      <OrangeFlower size={28} />
      <RedRose size={32} />
      <OrangeFlower size={28} className="scale-x-[-1]" />
      <YellowFlower size={24} className="scale-x-[-1]" />
    </div>
    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4653C] to-transparent opacity-40" />
  </div>
);

// Cantos decorativos florais
export const FloralCorner = ({ className = '', position = 'top-left' }: { className?: string; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const rotations = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270,
  };
  
  return (
    <svg 
      width="120" 
      height="120" 
      viewBox="0 0 120 120" 
      className={className}
      style={{ transform: `rotate(${rotations[position]}deg)` }}
    >
      <defs>
        <linearGradient id="cornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4653C" />
          <stop offset="100%" stopColor="#E8B84A" />
        </linearGradient>
      </defs>
      {/* Curva principal */}
      <path
        d="M10 60 Q10 10 60 10"
        fill="none"
        stroke="url(#cornerGrad)"
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M20 60 Q20 20 60 20"
        fill="none"
        stroke="url(#cornerGrad)"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Flores pequenas */}
      <circle cx="60" cy="12" r="6" fill="#B8333C" opacity="0.8" />
      <circle cx="60" cy="12" r="3" fill="#D4653C" />
      <circle cx="12" cy="60" r="5" fill="#E8B84A" opacity="0.8" />
      <circle cx="12" cy="60" r="2.5" fill="#F4D76B" />
      <circle cx="35" cy="35" r="4" fill="#5B7248" opacity="0.6" />
    </svg>
  );
};

// Fundo com padrão sutil de flores
export const FloralPattern = ({ className = '' }: { className?: string }) => (
  <svg 
    width="100%" 
    height="100%" 
    className={`absolute inset-0 opacity-5 pointer-events-none ${className}`}
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="floralPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="8" fill="#D4653C" opacity="0.3" />
        <circle cx="20" cy="20" r="3" fill="#B8333C" />
        <circle cx="70" cy="60" r="6" fill="#E8B84A" opacity="0.3" />
        <circle cx="70" cy="60" r="2" fill="#D4653C" />
        <ellipse cx="50" cy="80" rx="4" ry="8" fill="#5B7248" opacity="0.2" transform="rotate(45 50 80)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#floralPattern)" />
  </svg>
);

export default {
  RedRose,
  OrangeFlower,
  YellowFlower,
  PinkDahlia,
  GreenLeaf,
  Eucalyptus,
  DriedPampas,
  FloralCircle,
  BouquetDecoration,
  FloralDivider,
  FloralCorner,
  FloralPattern,
};
