import React, { useState } from 'react';
import { 
  Plus, 
  Type, 
  User, 
  Image, 
  Square, 
  HelpCircle, 
  MousePointer, 
  Sparkles, 
  Lock,
  ChevronDown
} from 'lucide-react';
import { ElementType, CanvasElement } from '../types';

interface ElementQuickCreatorProps {
  onAddElement: (type: ElementType, customProps?: Partial<CanvasElement>) => void;
}

export const ElementQuickCreator: React.FC<ElementQuickCreatorProps> = ({ onAddElement }) => {
  const [isOpen, setIsOpen] = useState(true);

  const creators = [
    {
      type: 'text' as ElementType,
      name: 'Caixa de Texto',
      icon: Type,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'Adiciona um título, legenda ou corpo de texto customizado.'
    },
    {
      type: 'avatar' as ElementType,
      name: 'Foto de Perfil',
      icon: User,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      description: 'Foto de avatar circular com bordas e indicador online.'
    },
    {
      type: 'image' as ElementType,
      name: 'Mídia / Imagem',
      icon: Image,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Inserir foto ilustrativa no post ou background.'
    },
    {
      type: 'button' as ElementType,
      name: 'Botão de Ação',
      icon: MousePointer,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'Botão com texto configurável (ex: "Saiba Mais" ou "Comprar").'
    },
    {
      type: 'icon' as ElementType,
      name: 'Ícone Interativo',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'Inserir ícones de curtidas, bookmarks, comentários ou redes.'
    },
    {
      type: 'container' as ElementType,
      name: 'Container de Fundo',
      icon: Square,
      color: 'bg-slate-50 text-slate-600 border-slate-200',
      description: 'Cartão de fundo sólido ou com borda para agrupar elementos.'
    },
    {
      type: 'blur-cover' as ElementType,
      name: 'Efeito Blur (Ler Mais)',
      icon: Lock,
      color: 'bg-pink-50 text-pink-600 border-pink-100',
      description: 'Efeito de desfoque interativo que instiga o usuário a ler mais do post.'
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-display font-bold text-slate-800 hover:bg-slate-50 text-sm transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          Adicionar Elementos ao Post
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 space-y-2.5 max-h-[400px] overflow-y-auto">
          {creators.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.type}
                onClick={() => onAddElement(c.type)}
                className="w-full flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all text-left group"
              >
                <div className={`p-2 rounded-xl ${c.color} border shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 font-display group-hover:text-indigo-600 transition-colors">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {c.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
