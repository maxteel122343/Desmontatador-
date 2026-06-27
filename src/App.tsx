import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  Trash2, 
  Maximize2, 
  Play, 
  BookOpen, 
  Layers, 
  Palette,
  FileText,
  MousePointer,
  Sparkle
} from 'lucide-react';
import { CanvasElement, CanvasSettings } from './types';
import { PRESET_TEMPLATES } from './presets';
import { MorphCanvas } from './components/MorphCanvas';
import { ElementSidebarControls } from './components/ElementSidebarControls';
import { ElementQuickCreator } from './components/ElementQuickCreator';
import { CanvasSettingsPanel } from './components/CanvasSettingsPanel';
import { ImageUploader } from './components/ImageUploader';

export default function App() {
  const [settings, setSettings] = useState<CanvasSettings>(PRESET_TEMPLATES[0].settings);
  const [elements, setElements] = useState<CanvasElement[]>(PRESET_TEMPLATES[0].elements);
  const [selectedId, setSelectedId] = useState<string | null>("post-title"); // Start with a preselected element
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Trigger brief alert feedback toasts
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedId(id);
  };

  const handleHoverElement = (id: string | null) => {
    setHoveredId(id);
  };

  // Drag modification update
  const handleUpdateElementPosition = (id: string, x: number, y: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el));
  };

  // Resize modification update
  const handleUpdateElementSize = (id: string, width: number, height: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, width, height } : el));
  };

  // Sidebar detailed modification update
  const handleUpdateElement = (updated: CanvasElement) => {
    setElements(prev => prev.map(el => el.id === updated.id ? updated : el));
  };

  // Delete elements
  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    triggerToast("Elemento removido.");
  };

  // Duplicate element helper
  const handleDuplicateElement = (element: CanvasElement) => {
    const newId = `${element.type}-${Date.now()}`;
    const duplicated: CanvasElement = {
      ...element,
      id: newId,
      name: `${element.name} (Cópia)`,
      x: Math.min(90, element.x + 4), // offset slightly
      y: Math.min(90, element.y + 4),
      zIndex: (elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0)) + 1
    };
    setElements(prev => [...prev, duplicated]);
    setSelectedId(newId);
    triggerToast("Elemento duplicado!");
  };

  // Add new elements dynamically to the canvas with initial default properties
  const handleAddElement = (type: any, customProps?: Partial<CanvasElement>) => {
    const newId = `${type}-${Date.now()}`;
    
    // Auto increment zIndex to put new element on top
    const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);

    let defaultElement: CanvasElement = {
      id: newId,
      type,
      name: `Novo ${type === 'blur-cover' ? 'Blur' : type}`,
      x: 35,
      y: 35,
      width: type === 'container' ? 40 : 25,
      height: type === 'container' ? 30 : 10,
      rotation: 0,
      opacity: 1,
      zIndex: maxZ + 1,
    };

    // Specific type initialization adjustments
    if (type === 'text') {
      defaultElement = {
        ...defaultElement,
        name: 'Novo Texto',
        text: 'Dê duplo clique para editar este texto ou digite na barra lateral.',
        fontSize: 14,
        fontWeight: 'normal',
        fontFamily: 'Inter',
        fontColor: '#334155',
        textAlign: 'left',
        width: 45,
        height: 12
      };
    } else if (type === 'avatar') {
      defaultElement = {
        ...defaultElement,
        name: 'Avatar de Perfil',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        borderRadius: 999,
        width: 8,
        height: 18,
        borderColor: '#6366f1',
        borderWidth: 2
      };
    } else if (type === 'image') {
      defaultElement = {
        ...defaultElement,
        name: 'Imagem Mídia',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        borderRadius: 12,
        width: 35,
        height: 25
      };
    } else if (type === 'button') {
      defaultElement = {
        ...defaultElement,
        name: 'Botão de Ação',
        text: 'Saiba Mais',
        backgroundColor: '#6366f1',
        fontColor: '#ffffff',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Space Grotesk',
        textAlign: 'center',
        width: 25,
        height: 7
      };
    } else if (type === 'icon') {
      defaultElement = {
        ...defaultElement,
        name: 'Ícone Lucide',
        iconName: 'Heart',
        fontColor: '#e11d48',
        width: 4,
        height: 6
      };
    } else if (type === 'container') {
      defaultElement = {
        ...defaultElement,
        name: 'Fundo do Card',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        width: 60,
        height: 40,
        zIndex: 1 // Put containers on bottom usually
      };
    } else if (type === 'blur-cover') {
      defaultElement = {
        ...defaultElement,
        name: 'Bloqueio de Leitura (Blur)',
        blur: 12,
        width: 50,
        height: 25,
        x: 25,
        y: 45,
        zIndex: 20
      };
    }

    if (customProps) {
      defaultElement = { ...defaultElement, ...customProps };
    }

    setElements(prev => [...prev, defaultElement]);
    setSelectedId(newId);
    triggerToast("Elemento adicionado!");
  };

  // Bring to front
  const handleBringToFront = (id: string) => {
    const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el));
    triggerToast("Trazer para frente");
  };

  // Send to back
  const handleSendToBack = (id: string) => {
    const minZ = elements.reduce((min, el) => Math.min(min, el.zIndex || 0), 0);
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: Math.max(0, minZ - 1) } : el));
    triggerToast("Enviar para trás");
  };

  // Load sample template from presets
  const handleLoadPreset = (idx: number) => {
    const preset = PRESET_TEMPLATES[idx];
    if (preset) {
      setSettings(preset.settings);
      setElements(preset.elements);
      setSelectedId(preset.elements[0]?.id || null);
      triggerToast(`Carregado: ${preset.name}`);
    }
  };

  // Call Express backend to dismantle the image using Gemini Flash model
  const handleDismantleImage = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/dismantle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64, mimeType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Falha ao processar desmonte.');
      }

      const data = await response.json();

      if (data && data.elements) {
        // Overwrite canvas settings and loaded elements
        if (data.canvas) {
          setSettings({
            width: data.canvas.width || 800,
            height: data.canvas.height || 350,
            backgroundColor: data.canvas.backgroundColor || '#ffffff',
            borderRadius: data.canvas.borderRadius || 16,
            boxShadow: 'xl'
          });
        }
        setElements(data.elements);
        setSelectedId(data.elements[0]?.id || null);
        triggerToast("Imagem desmontada com sucesso pela IA!");
      }

    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetCanvas = () => {
    if (window.confirm("Deseja mesmo redefinir o canvas atual? Você perderá suas alterações.")) {
      setSettings(PRESET_TEMPLATES[0].settings);
      setElements(PRESET_TEMPLATES[0].elements);
      setSelectedId("post-title");
      triggerToast("Canvas redefinido");
    }
  };

  // Split a composite element into fine-grained sub-elements using Gemini
  const handleSplitWithAI = async (element: CanvasElement) => {
    setIsSplitting(true);
    triggerToast("Iniciando desmembramento inteligente com IA...");
    try {
      const response = await fetch('/api/split-element', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ element })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Falha ao desmembrar elemento.');
      }

      const data = await response.json();

      if (data && data.elements && data.elements.length > 0) {
        // Remove the original element and insert the new ones
        setElements(prev => {
          const filtered = prev.filter(el => el.id !== element.id);
          return [...filtered, ...data.elements];
        });
        setSelectedId(data.elements[0].id);
        triggerToast(`Elemento desmembrado em ${data.elements.length} partes! ✨`);
      } else {
        triggerToast("A IA não identificou múltiplas partes neste elemento.");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(`Erro ao desmembrar: ${err.message || err}`);
    } finally {
      setIsSplitting(false);
    }
  };

  // Split multi-line text into separate text elements locally (instant feedback)
  const handleSplitByLines = (element: CanvasElement) => {
    if (element.type !== 'text' || !element.text) {
      triggerToast("Apenas elementos de texto podem ser separados por linhas.");
      return;
    }

    const lines = element.text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      triggerToast("O texto precisa ter mais de uma linha para ser separado.");
      return;
    }

    // Distribute y-positions proportionally
    const startY = element.y;
    const totalHeight = element.height;
    const lineSpacing = totalHeight / lines.length;

    const newElements: CanvasElement[] = lines.map((line, idx) => ({
      id: `split-text-${Date.now()}-${idx}`,
      type: 'text',
      name: `${element.name} - Parte ${idx + 1}`,
      x: element.x,
      y: startY + (idx * lineSpacing),
      width: element.width,
      height: Math.max(4, lineSpacing * 0.8),
      zIndex: (element.zIndex || 5) + idx,
      rotation: element.rotation || 0,
      text: line,
      fontSize: element.fontSize || 14,
      fontWeight: element.fontWeight || 'normal',
      fontFamily: element.fontFamily || 'Inter',
      fontColor: element.fontColor || '#334155',
      textAlign: element.textAlign || 'left',
      opacity: element.opacity || 1
    }));

    setElements(prev => {
      const filtered = prev.filter(el => el.id !== element.id);
      return [...filtered, ...newElements];
    });
    setSelectedId(newElements[0].id);
    triggerToast(`Separado em ${newElements.length} linhas! 📝`);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 flex flex-col antialiased">
      
      {/* Dynamic Toast Feedback Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkle className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
          {showToast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-display font-black tracking-tight text-slate-900 flex items-center gap-2">
                  PostMorph <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold uppercase">AI Dismantle</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Suba imagens ou utilize presets para desmontar elementos, redimensionar, rotacionar, adicionar "Ler Mais" e aplicar blur.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetCanvas}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Redefinir tudo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Canvas
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Exportar Design
            </button>
          </div>
        </div>
      </header>

      {/* Primary Layout Grid */}
      <main className="max-w-[1450px] mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Column: Creator Tools (Upload + Element Creator) - 3 Columns */}
        <section className="lg:col-span-3 space-y-6 flex flex-col">
          
          {/* Dismantle Uploader Widget */}
          <ImageUploader 
            onDismantleRequested={handleDismantleImage}
            isAnalyzing={isAnalyzing}
            onLoadPreset={handleLoadPreset}
            presets={PRESET_TEMPLATES}
          />

          {/* Quick elements creator box */}
          <ElementQuickCreator onAddElement={handleAddElement} />

        </section>

        {/* Center Column: Interactive Playground Canvas - 6 Columns */}
        <section className="lg:col-span-6 space-y-6 flex flex-col min-w-0">
          
          {/* Main Visual interactive Board */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tela Interativa
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {settings.width}x{settings.height}px | {elements.length} elementos
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex-1 flex items-center justify-center min-h-[420px]">
              <MorphCanvas
                settings={settings}
                elements={elements}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelectElement={handleSelectElement}
                onHoverElement={handleHoverElement}
                onUpdateElementPosition={handleUpdateElementPosition}
                onUpdateElementSize={handleUpdateElementSize}
                onUpdateElement={handleUpdateElement}
                onSplitWithAI={handleSplitWithAI}
                onSplitByLines={handleSplitByLines}
                isSplitting={isSplitting}
              />
            </div>
            
            <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>💡 Dica: Arraste o centro para mover. Passe o mouse em qualquer borda ou canto e arraste para redimensionar!</span>
              <span className="font-semibold text-indigo-600">PostMorph Engine v1.1</span>
            </div>
          </div>

        </section>

        {/* Right Column: Inspector Panel (Selected Element Controls OR Canvas Settings) - 3 Columns */}
        <section className="lg:col-span-3 space-y-6 flex flex-col">
          
          {selectedElement ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Inspecionar Elemento</span>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Ver Configs Canvas
                </button>
              </div>
              <ElementSidebarControls
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                onSplitWithAI={handleSplitWithAI}
                onSplitByLines={handleSplitByLines}
                isSplitting={isSplitting}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="mb-4 pb-2 border-b border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Inspecionar Canvas</span>
                <p className="text-[10px] text-slate-400">Nenhum elemento selecionado. Editando configurações do canvas global.</p>
              </div>
              <CanvasSettingsPanel settings={settings} onUpdateSettings={setSettings} />
            </div>
          )}

        </section>

      </main>

      {/* Export modal dialog info popup */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Exportar Dados do Design
              </h3>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Fechar
              </button>
            </div>
            
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 leading-normal">
                Copie o JSON estruturado do seu post e de seus elementos desmontados para importar em outros sistemas ou utilizar como estrutura no seu banco de dados.
              </p>
              
              <div className="bg-slate-900 text-slate-100 text-xs font-mono p-4 rounded-xl max-h-[300px] overflow-auto select-all">
                <pre>{JSON.stringify({ settings, elements }, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({ settings, elements }, null, 2));
                  triggerToast("Copiado para a área de transferência!");
                  setExportModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Copiar Código JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credits line */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          PostMorph — Desmonte e manipulação inteligente de posts com Gemini AI e React.
        </div>
      </footer>

    </div>
  );
}
