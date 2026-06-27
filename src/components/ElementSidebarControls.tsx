import React from 'react';
import { 
  Type, 
  Trash2, 
  Move, 
  RotateCw, 
  Palette, 
  Type as FontIcon, 
  Layers, 
  Sparkles, 
  Plus, 
  Eye, 
  EyeOff, 
  Maximize2,
  Minimize2,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { CanvasElement } from '../types';

interface ElementSidebarControlsProps {
  element: CanvasElement;
  onUpdateElement: (updated: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: CanvasElement) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onSplitWithAI?: (element: CanvasElement) => void;
  onSplitByLines?: (element: CanvasElement) => void;
  isSplitting?: boolean;
}

export const ElementSidebarControls: React.FC<ElementSidebarControlsProps> = ({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  onSplitWithAI,
  onSplitByLines,
  isSplitting = false
}) => {
  const handlePropChange = (key: keyof CanvasElement, value: any) => {
    onUpdateElement({
      ...element,
      [key]: value
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase">
            {element.type}
          </span>
          <h3 className="font-display font-bold text-slate-800 text-sm truncate max-w-[150px]">
            {element.name}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateElement(element)}
            title="Duplicar elemento"
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            title="Excluir elemento"
            className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dismantle specific actions */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-indigo-800">
          <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-200" />
          <h4 className="text-xs font-bold uppercase tracking-wider font-display">Ferramentas de Desmonte</h4>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          Se o post foi desmontado de forma incompleta (ex: todo o texto ficou em um único bloco), divida este elemento em partes menores.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => onSplitWithAI && onSplitWithAI(element)}
            disabled={isSplitting}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {isSplitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Desmembrando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200 fill-indigo-200" />
                Desmontar Parte com IA
              </>
            )}
          </button>

          {element.type === 'text' && (
            <button
              onClick={() => onSplitByLines && onSplitByLines(element)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              📝 Separar Linhas (Instantâneo)
            </button>
          )}
        </div>
      </div>

      {/* Geometry / Position Control */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" /> Posicionamento e Tamanho
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">X (Posição %)</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => handlePropChange('x', Number(e.target.value))}
              min="0"
              max="100"
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Y (Posição %)</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => handlePropChange('y', Number(e.target.value))}
              min="0"
              max="100"
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Largura (%)</label>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => handlePropChange('width', Math.max(1, Number(e.target.value)))}
              min="1"
              max="100"
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Altura (%)</label>
            <input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => handlePropChange('height', Math.max(1, Number(e.target.value)))}
              min="1"
              max="100"
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
            />
          </div>
        </div>

        {/* Quick Position Sliders */}
        <div className="space-y-2 mt-2">
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Posição Horizontal (X)</span>
              <span>{Math.round(element.x)}%</span>
            </div>
            <input
              type="range"
              min="-10"
              max="110"
              value={element.x}
              onChange={(e) => handlePropChange('x', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Posição Vertical (Y)</span>
              <span>{Math.round(element.y)}%</span>
            </div>
            <input
              type="range"
              min="-10"
              max="110"
              value={element.y}
              onChange={(e) => handlePropChange('y', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Escala / Largura</span>
              <span>{Math.round(element.width)}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={element.width}
              onChange={(e) => handlePropChange('width', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Rotation & Opacity Control */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5" /> Rotação e Efeitos
        </h4>
        
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Rotação</span>
            <span>{element.rotation || 0}°</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="360"
              value={element.rotation || 0}
              onChange={(e) => handlePropChange('rotation', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => handlePropChange('rotation', 0)}
              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Opacidade</span>
            <span>{Math.round((element.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={element.opacity ?? 1}
            onChange={(e) => handlePropChange('opacity', Number(e.target.value))}
            className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur control for Blur elements, buttons or general boxes */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span className="flex items-center gap-1">Efeito Blur / Desfoque</span>
            <span>{element.blur ?? 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={element.blur ?? 0}
            onChange={(e) => handlePropChange('blur', Number(e.target.value))}
            className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />

          {(element.blur ?? 0) > 0 && (
            <div className="mt-2.5 bg-slate-50 border border-slate-200/60 p-2 rounded-lg space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Tipo de Desfoque:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handlePropChange('blurType', 'full')}
                  className={`py-1 px-1.5 text-[9px] font-medium rounded-md border transition-all cursor-pointer text-center whitespace-nowrap ${
                    (!element.blurType || element.blurType === 'full')
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Completo
                </button>
                <button
                  type="button"
                  onClick={() => handlePropChange('blurType', 'top')}
                  className={`py-1 px-1.5 text-[9px] font-medium rounded-md border transition-all cursor-pointer text-center whitespace-nowrap ${
                    element.blurType === 'top'
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="O topo fica desfocado e esmaecido (efeito sumindo)"
                >
                  Parte de Cima
                </button>
                <button
                  type="button"
                  onClick={() => handlePropChange('blurType', 'bottom')}
                  className={`py-1 px-1.5 text-[9px] font-medium rounded-md border transition-all cursor-pointer text-center whitespace-nowrap ${
                    element.blurType === 'bottom'
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="A base fica desfocada e esmaecida"
                >
                  Parte de Baixo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layer Stack Level (Z-Index) */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Organização de Camadas
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => onBringToFront(element.id)}
            className="flex-1 text-center py-2 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Trazer para Frente
          </button>
          <button
            onClick={() => onSendToBack(element.id)}
            className="flex-1 text-center py-2 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Enviar para Trás
          </button>
        </div>
      </div>

      {/* Text Type Specific Styling */}
      {element.type === 'text' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FontIcon className="w-3.5 h-3.5" /> Configuração de Texto
          </h4>
          
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Conteúdo do Texto</label>
            <textarea
              value={element.text || ''}
              onChange={(e) => handlePropChange('text', e.target.value)}
              rows={3}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-indigo-500 font-sans"
              placeholder="Digite o texto do elemento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Família da Fonte</label>
              <select
                value={element.fontFamily || 'Inter'}
                onChange={(e) => handlePropChange('fontFamily', e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 bg-white"
              >
                <option value="Inter">Inter (Sans)</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Peso (Weight)</label>
              <select
                value={element.fontWeight || 'normal'}
                onChange={(e) => handlePropChange('fontWeight', e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="medium">Médio</option>
                <option value="semibold">Semi Bold</option>
                <option value="bold">Negrito</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Tamanho Fonte</label>
              <input
                type="number"
                value={element.fontSize || 14}
                onChange={(e) => handlePropChange('fontSize', Number(e.target.value))}
                min="8"
                max="72"
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Cor do Texto</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={element.fontColor || '#000000'}
                  onChange={(e) => handlePropChange('fontColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={element.fontColor || '#000000'}
                  onChange={(e) => handlePropChange('fontColor', e.target.value)}
                  className="w-full text-[10px] uppercase font-mono px-1 py-1.5 border border-slate-200 rounded focus:outline-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Alinhamento</label>
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => handlePropChange('textAlign', align)}
                  className={`flex-1 text-center py-1 rounded text-xs font-semibold capitalize transition-all ${
                    element.textAlign === align 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Button & Custom container backgrounds/borders */}
      {(element.type === 'button' || element.type === 'container' || element.type === 'badge') && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Cores e Bordas
          </h4>
          
          {element.type === 'button' && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Rótulo do Botão</label>
              <input
                type="text"
                value={element.text || 'Botão'}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Fundo (Background)</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={element.backgroundColor || '#ffffff'}
                  onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={element.backgroundColor || '#ffffff'}
                  onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                  className="w-full text-[10px] uppercase font-mono px-1 py-1.5 border border-slate-200 rounded focus:outline-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Canto Arredondado (px)</label>
              <input
                type="number"
                value={element.borderRadius || 0}
                onChange={(e) => handlePropChange('borderRadius', Number(e.target.value))}
                min="0"
                max="50"
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Borda (Cor)</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={element.borderColor || '#e2e8f0'}
                  onChange={(e) => handlePropChange('borderColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={element.borderColor || '#e2e8f0'}
                  onChange={(e) => handlePropChange('borderColor', e.target.value)}
                  className="w-full text-[10px] uppercase font-mono px-1 py-1.5 border border-slate-200 rounded focus:outline-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Espessura Borda (px)</label>
              <input
                type="number"
                value={element.borderWidth || 0}
                onChange={(e) => handlePropChange('borderWidth', Number(e.target.value))}
                min="0"
                max="10"
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Avatar/Image Type Specific Styling */}
      {(element.type === 'avatar' || element.type === 'image') && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" /> Endereço da Imagem
          </h4>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">URL da Imagem</label>
            <input
              type="text"
              value={element.imageUrl || ''}
              onChange={(e) => handlePropChange('imageUrl', e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 font-mono text-[10px]"
              placeholder="Cole o endereço https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Canto Arredondado</label>
              <input
                type="number"
                value={element.borderRadius || 0}
                onChange={(e) => handlePropChange('borderRadius', Number(e.target.value))}
                min="0"
                max="999"
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Espessura Borda</label>
              <input
                type="number"
                value={element.borderWidth || 0}
                onChange={(e) => handlePropChange('borderWidth', Number(e.target.value))}
                min="0"
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Cor da Borda</label>
            <input
              type="color"
              value={element.borderColor || '#e2e8f0'}
              onChange={(e) => handlePropChange('borderColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
        </div>
      )}

      {/* Icon configuration */}
      {element.type === 'icon' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Configuração do Ícone
          </h4>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Nome do Ícone Lucide</label>
            <select
              value={element.iconName || 'Heart'}
              onChange={(e) => handlePropChange('iconName', e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 bg-white"
            >
              <option value="Heart">Símbolo: Coração (Heart)</option>
              <option value="MessageCircle">Símbolo: Comentar (MessageCircle)</option>
              <option value="Share2">Símbolo: Compartilhar (Share2)</option>
              <option value="Bookmark">Símbolo: Salvar (Bookmark)</option>
              <option value="BookOpen">Símbolo: Ler Mais (BookOpen)</option>
              <option value="MoreVertical">Símbolo: 3 Pontos Vertical (MoreVertical)</option>
              <option value="MoreHorizontal">Símbolo: 3 Pontos Horizontal (MoreHorizontal)</option>
              <option value="ThumbsUp">Símbolo: Curtida Facebook (ThumbsUp)</option>
              <option value="Send">Símbolo: Enviar (Send)</option>
              <option value="Bell">Símbolo: Notificação (Bell)</option>
              <option value="Star">Símbolo: Estrela (Star)</option>
              <option value="HelpCircle">Símbolo: Dúvida (HelpCircle)</option>
              <option value="X">Símbolo: Fechar (X)</option>
              <option value="Eye">Símbolo: Olho (Eye)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Carrega dinamicamente a partir da biblioteca Lucide-react.</p>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Cor do Ícone</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={element.fontColor || '#64748b'}
                onChange={(e) => handlePropChange('fontColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={element.fontColor || '#64748b'}
                onChange={(e) => handlePropChange('fontColor', e.target.value)}
                className="w-full text-[10px] uppercase font-mono px-1 py-1.5 border border-slate-200 rounded focus:outline-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
