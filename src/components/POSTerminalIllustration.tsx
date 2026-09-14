'use client';
import React from 'react';

/**
 * Ilustração em SVG de alta fidelidade do Terminal de Pagamento Multicaixa Express / POS
 * com cartão contactless e talão de recibo, correspondendo perfeitamente à Imagem 9.
 */
export function POSTerminalIllustration({ className = 'w-full max-w-[280px] h-auto' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <defs>
          {/* Gradiente do Corpo da Maquininha POS */}
          <linearGradient id="posBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2E39" />
            <stop offset="40%" stopColor="#1C1F26" />
            <stop offset="100%" stopColor="#0F1115" />
          </linearGradient>

          {/* Gradiente da Tela POS */}
          <linearGradient id="posScreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDE6ED" />
            <stop offset="100%" stopColor="#B0C4DE" />
          </linearGradient>

          {/* Gradiente do Cartão Dourado Visa Contactless */}
          <linearGradient id="goldCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2BA73" />
            <stop offset="50%" stopColor="#C89B51" />
            <stop offset="100%" stopColor="#A77A34" />
          </linearGradient>

          {/* Sombra suave */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Sombra base da maquininha */}
        <ellipse cx="210" cy="275" rx="130" ry="24" fill="#000000" fillOpacity="0.12" />

        {/* ================= TALÃO DE PAPEL (RECIBO) SAINDO DA MAQUININHA ================= */}
        <g id="receipt-paper">
          {/* Dobra traseira do rolo de papel */}
          <path
            d="M210 50 C240 40, 270 55, 275 80 C278 95, 260 115, 240 125 L190 85 Z"
            fill="#E2E8F0"
            opacity="0.9"
          />
          {/* Folha principal do recibo */}
          <path
            d="M175 60 L235 45 C250 80, 240 120, 220 145 L165 95 Z"
            fill="#FFFFFF"
            filter="url(#softShadow)"
          />
          {/* Linhas impressas do comprovativo */}
          <line x1="185" y1="68" x2="215" y2="60" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="183" y1="76" x2="218" y2="67" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="180" y1="84" x2="210" y2="76" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="178" y1="92" x2="202" y2="85" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ================= CORPO DO TERMINAL POS (PERSPECTIVA ISOMÉTRICA) ================= */}
        <g id="pos-terminal" filter="url(#softShadow)">
          {/* Base / Lateral do terminal */}
          <path
            d="M150 125 L245 75 C265 65, 285 75, 290 95 L260 250 C255 265, 240 275, 225 280 L140 255 C125 250, 115 235, 120 220 L135 140 C138 130, 142 128, 150 125 Z"
            fill="#12151B"
          />

          {/* Painel Frontal Superior (Inclinado) */}
          <path
            d="M155 125 L245 78 C255 72, 270 78, 273 90 L248 245 C246 255, 235 262, 225 265 L145 238 C135 235, 130 225, 132 215 L145 135 C147 128, 150 126, 155 125 Z"
            fill="url(#posBody)"
            stroke="#3F4654"
            strokeWidth="2"
          />

          {/* Borda superior de encaixe do papel */}
          <path
            d="M185 80 L245 48 C250 45, 258 48, 260 55 L265 80 L205 110 Z"
            fill="#232731"
          />

          {/* TELA DIGITAL LCD */}
          <rect
            x="170"
            y="105"
            width="80"
            height="50"
            rx="8"
            transform="rotate(-15 170 105)"
            fill="url(#posScreen)"
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* Detalhes da Tela */}
          <text
            x="172"
            y="130"
            transform="rotate(-15 172 130)"
            fill="#0F172A"
            fontSize="7"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            MULTICAIXA
          </text>
          <text
            x="174"
            y="142"
            transform="rotate(-15 174 142)"
            fill="#059669"
            fontSize="8"
            fontWeight="900"
          >
            APROXIME O CARTÃO
          </text>

          {/* TECLADO FÍSICO DO POS (BOTÕES NUMÉRICOS & COLORIDOS) */}
          {/* Fila 1 */}
          <rect x="165" y="168" width="16" height="8" rx="2" transform="rotate(-15 165 168)" fill="#2F3542" />
          <rect x="187" y="162" width="16" height="8" rx="2" transform="rotate(-15 187 162)" fill="#2F3542" />
          <rect x="209" y="156" width="16" height="8" rx="2" transform="rotate(-15 209 156)" fill="#EF4444" /> {/* Botão Cancelar Vermelho */}

          {/* Fila 2 */}
          <rect x="160" y="184" width="16" height="8" rx="2" transform="rotate(-15 160 184)" fill="#2F3542" />
          <rect x="182" y="178" width="16" height="8" rx="2" transform="rotate(-15 182 178)" fill="#2F3542" />
          <rect x="204" y="172" width="16" height="8" rx="2" transform="rotate(-15 204 172)" fill="#F59E0B" /> {/* Botão Corrigir Amarelo */}

          {/* Fila 3 */}
          <rect x="155" y="200" width="16" height="8" rx="2" transform="rotate(-15 155 200)" fill="#2F3542" />
          <rect x="177" y="194" width="16" height="8" rx="2" transform="rotate(-15 177 194)" fill="#2F3542" />
          <rect x="199" y="188" width="16" height="8" rx="2" transform="rotate(-15 199 188)" fill="#10B981" /> {/* Botão OK/Enter Verde */}

          {/* Fila 4 */}
          <rect x="150" y="216" width="16" height="8" rx="2" transform="rotate(-15 150 216)" fill="#2F3542" />
          <rect x="172" y="210" width="16" height="8" rx="2" transform="rotate(-15 172 210)" fill="#2F3542" />
          <rect x="194" y="204" width="16" height="8" rx="2" transform="rotate(-15 194 204)" fill="#2F3542" />
        </g>

        {/* ================= CARTÃO DE CRÉDITO / DÉBITO DOURADO VISA CONTACTLESS ================= */}
        <g id="contactless-card" filter="url(#softShadow)" className="animate-pulse">
          {/* Cartão retangular rotacionado sobrevoando a máquina */}
          <rect
            x="140"
            y="40"
            width="110"
            height="68"
            rx="8"
            transform="rotate(-22 140 40)"
            fill="url(#goldCard)"
            stroke="#FDE047"
            strokeWidth="1.5"
          />

          {/* Logo VISA estilizado em branco no cartão */}
          <text
            x="200"
            y="85"
            transform="rotate(-22 200 85)"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="900"
            fontStyle="italic"
            letterSpacing="1"
          >
            VISA
          </text>

          {/* Ondas Contactless no cartão */}
          <path
            d="M170 58 C173 60, 173 65, 170 67"
            transform="rotate(-22 170 58)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M174 55 C179 59, 179 67, 174 71"
            transform="rotate(-22 174 55)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M178 52 C185 58, 185 70, 178 75"
            transform="rotate(-22 178 52)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
