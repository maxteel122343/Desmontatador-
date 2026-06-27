import React, { useRef, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { CanvasElement, CanvasSettings } from '../types';

interface MorphCanvasProps {
  settings: CanvasSettings;
  elements: CanvasElement[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelectElement: (id: string | null) => void;
  onHoverElement: (id: string | null) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateElementSize: (id: string, width: number, height: number) => void;
  onUpdateElement?: (updated: CanvasElement) => void;
  onSplitWithAI?: (element: CanvasElement) => void;
  onSplitByLines?: (element: CanvasElement) => void;
  isSplitting?: boolean;
}

export const MorphCanvas: React.FC<MorphCanvasProps> = ({
  settings,
  elements,
  selectedId,
  hoveredId,
  onSelectElement,
  onHoverElement,
  onUpdateElementPosition,
  onUpdateElementSize,
  onUpdateElement,
  onSplitWithAI,
  onSplitByLines,
  isSplitting,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    isDragging: boolean;
  } | null>(null);

  const resizeRef = useRef<{
    id: string;
    direction: 'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'ne' | 'sw';
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    startWidth: number;
    startHeight: number;
    isResizing: boolean;
  } | null>(null);

  // Sorting elements by zIndex to render properly
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Dynamic Lucide icon helper
  const RenderLucideIcon = ({ name, color, className, size }: { name: string; color?: string; className?: string; size?: number }) => {
    // Falls back to generic HelpCircle if not found
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <IconComponent className={className} style={{ color }} size={size || 18} />;
  };

  // Convert client coordinates to percentages relative to container
  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'drag' | 'resize',
    direction: 'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'ne' | 'sw' = 'se'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Select the element clicked
    onSelectElement(id);

    const canvasGeo = canvasRef.current?.getBoundingClientRect();
    if (!canvasGeo) return;

    const element = elements.find(el => el.id === id);
    if (!element) return;

    if (type === 'drag') {
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        startElemX: element.x,
        startElemY: element.y,
        isDragging: true
      };
    } else {
      resizeRef.current = {
        id,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startElemX: element.x,
        startElemY: element.y,
        startWidth: element.width,
        startHeight: element.height,
        isResizing: true
      };
    }

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    const canvasGeo = canvasRef.current?.getBoundingClientRect();
    if (!canvasGeo) return;

    if (dragRef.current && dragRef.current.isDragging) {
      const { id, startX, startY, startElemX, startElemY } = dragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Convert pixel delta back to percentage units (0 to 100)
      const deltaPercentX = (deltaX / canvasGeo.width) * 100;
      const deltaPercentY = (deltaY / canvasGeo.height) * 100;

      // Ensure elements don't get completely dragged off the canvas boundaries
      const newX = Math.min(105, Math.max(-15, startElemX + deltaPercentX));
      const newY = Math.min(105, Math.max(-15, startElemY + deltaPercentY));

      onUpdateElementPosition(id, newX, newY);
    } else if (resizeRef.current && resizeRef.current.isResizing) {
      const { id, direction, startX, startY, startElemX, startElemY, startWidth, startHeight } = resizeRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Convert pixel delta to percentage units
      const deltaPercentW = (deltaX / canvasGeo.width) * 100;
      const deltaPercentH = (deltaY / canvasGeo.height) * 100;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startElemX;
      let newY = startElemY;

      if (direction.includes('e')) {
        newWidth = Math.min(100, Math.max(1, startWidth + deltaPercentW));
      }
      if (direction.includes('s')) {
        newHeight = Math.min(100, Math.max(1, startHeight + deltaPercentH));
      }
      if (direction.includes('w')) {
        const potentialWidth = startWidth - deltaPercentW;
        if (potentialWidth >= 1) {
          newWidth = Math.min(100, potentialWidth);
          newX = startElemX + deltaPercentW;
        }
      }
      if (direction.includes('n')) {
        const potentialHeight = startHeight - deltaPercentH;
        if (potentialHeight >= 1) {
          newHeight = Math.min(100, potentialHeight);
          newY = startElemY + deltaPercentH;
        }
      }

      onUpdateElementSize(id, newWidth, newHeight);
      if (newX !== startElemX || newY !== startElemY) {
        onUpdateElementPosition(id, newX, newY);
      }
    }
  };

  const handleGlobalMouseUp = () => {
    dragRef.current = null;
    resizeRef.current = null;
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const renderElementContent = (el: CanvasElement) => {
    switch (el.type) {
      case 'avatar':
        return (
          <img
            src={el.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
            alt={el.name}
            referrerPolicy="no-referrer"
            style={{ borderRadius: el.borderRadius ? `${el.borderRadius}px` : '999px' }}
            className="w-full h-full object-cover pointer-events-none"
          />
        );
      case 'image':
        return (
          <img
            src={el.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"}
            alt={el.name}
            referrerPolicy="no-referrer"
            style={{ borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px' }}
            className="w-full h-full object-cover pointer-events-none"
          />
        );
      case 'text':
        return (
          <div className="w-full break-words select-none leading-relaxed pointer-events-none p-1">
            {el.text}
          </div>
        );
      case 'button':
        return (
          <button 
            style={{ borderRadius: el.borderRadius ? `${el.borderRadius}px` : '8px' }}
            className="w-full h-full text-center truncate font-semibold pointer-events-none px-4"
          >
            {el.text || 'Botão'}
          </button>
        );
      case 'icon':
        return el.iconName ? (
          <div className="flex items-center justify-center w-full h-full pointer-events-none">
            <RenderLucideIcon name={el.iconName} color={el.fontColor} size={Math.min(el.width * 4, 32)} />
          </div>
        ) : null;
      case 'container':
        return <div className="w-full h-full absolute inset-0 pointer-events-none" />;
      case 'badge':
        return <div className="w-full h-full pointer-events-none rounded-full flex items-center justify-center" />;
      case 'blur-cover':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/20 text-indigo-900 border border-white/40 overflow-hidden text-center rounded-xl pointer-events-none p-3 shadow-md">
            <LucideIcons.Lock className="w-6 h-6 mb-1 text-indigo-700 animate-pulse" />
            <span className="text-xs font-bold font-display uppercase tracking-wider">Clique para Ler Mais</span>
            <span className="text-[9px] opacity-70">Desbloqueie todo o conteúdo</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center p-6 bg-slate-100 border border-slate-200/60 rounded-2xl overflow-auto min-h-[450px]">
      {/* Canvas container with configured constraints */}
      <div
        id="morph-capture-canvas"
        ref={canvasRef}
        onClick={() => onSelectElement(null)}
        style={{
          width: `${settings.width}px`,
          height: `${settings.height}px`,
          backgroundColor: settings.backgroundColor,
          borderRadius: `${settings.borderRadius}px`,
          backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: settings.backgroundBlur ? `blur(${settings.backgroundBlur}px)` : undefined,
          transition: 'background-color 0.2s ease, border-radius 0.2s ease'
        }}
        className={`relative overflow-hidden select-none transition-shadow duration-300 ${
          settings.boxShadow === 'sm' ? 'shadow-sm' :
          settings.boxShadow === 'md' ? 'shadow-md' :
          settings.boxShadow === 'lg' ? 'shadow-lg' :
          settings.boxShadow === 'xl' ? 'shadow-xl' :
          settings.boxShadow === '2xl' ? 'shadow-2xl' : 'shadow-none'
        }`}
      >
        {sortedElements.map((el) => {
          const isSelected = selectedId === el.id;
          const isHovered = hoveredId === el.id;

          const isPartialBlur = el.blur && (el.blurType === 'top' || el.blurType === 'bottom');

          // Determine specific style attributes
          const elementStyles: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: `${el.height}%`,
            transform: `rotate(${el.rotation || 0}deg)`,
            opacity: el.opacity ?? 1,
            zIndex: el.zIndex,
            backgroundColor: el.backgroundColor,
            borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
            borderColor: el.borderColor,
            borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
            borderStyle: el.borderWidth ? 'solid' : undefined,
            // Apply full blur ONLY if it is not a partial (top/bottom) blur
            filter: (el.blur && !isPartialBlur) ? `blur(${el.blur}px)` : undefined,
            backdropFilter: el.type === 'blur-cover' && el.blur ? `blur(${el.blur}px)` : undefined,
            color: el.fontColor,
            fontFamily: el.fontFamily ? `var(--font-${el.fontFamily.toLowerCase().replace(' ', '-')})` : 'inherit',
            fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
            fontWeight: el.fontWeight || 'normal',
            textAlign: el.textAlign || 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: el.type === 'button' ? 'center' : 'flex-start',
            cursor: 'grab',
            transition: 'outline 0.15s ease'
          };

          return (
            <div
              key={el.id}
              id={`el-${el.id}`}
              style={elementStyles}
              onMouseDown={(e) => handleMouseDown(e, el.id, 'drag')}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(el.id);
              }}
              onMouseEnter={() => onHoverElement(el.id)}
              onMouseLeave={() => onHoverElement(null)}
              className={`group select-none ${
                isSelected ? 'interactive-element-selected' : isHovered ? 'interactive-element-hover' : ''
              }`}
            >
              {/* Dynamic content inside depending on Type */}
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                
                {/* Layer 1: Normal sharp content (visible as a fallback underneath or fade-out target) */}
                <div 
                  style={isPartialBlur ? {
                    position: 'absolute',
                    inset: 0,
                    WebkitMaskImage: el.blurType === 'top' 
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)',
                    maskImage: el.blurType === 'top' 
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)'
                      : 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)',
                  } : undefined}
                  className="w-full h-full flex items-center justify-center"
                >
                  {renderElementContent(el)}
                </div>

                {/* Layer 2: Blurred overlaid content (only for partial blur: top or bottom) */}
                {isPartialBlur && (
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      filter: `blur(${el.blur}px)`,
                      WebkitMaskImage: el.blurType === 'top' 
                        ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                        : 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                      maskImage: el.blurType === 'top' 
                        ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                        : 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                      pointerEvents: 'none',
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {renderElementContent(el)}
                  </div>
                )}

              </div>

              {/* Custom border/edge resize overlays + corner handles shown when selected or hovered */}
              {(isSelected || isHovered) && el.type !== 'badge' && (
                <>
                  {/* Invisible/forgiving hover zones for edges */}
                  {/* Top Edge Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'n')}
                    className="absolute -top-1 left-0 right-0 h-2 cursor-n-resize hover:bg-indigo-500/25 z-[997]"
                    title="Arrastar borda superior para redimensionar"
                  />
                  {/* Bottom Edge Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 's')}
                    className="absolute -bottom-1 left-0 right-0 h-2 cursor-s-resize hover:bg-indigo-500/25 z-[997]"
                    title="Arrastar borda inferior para redimensionar"
                  />
                  {/* Left Edge Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'w')}
                    className="absolute top-0 bottom-0 -left-1 w-2 cursor-w-resize hover:bg-indigo-500/25 z-[997]"
                    title="Arrastar borda esquerda para redimensionar"
                  />
                  {/* Right Edge Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'e')}
                    className="absolute top-0 bottom-0 -right-1 w-2 cursor-e-resize hover:bg-indigo-500/25 z-[997]"
                    title="Arrastar borda direita para redimensionar"
                  />

                  {/* HIGHLY VISIBLE EDGE DRAG PILLS (with <---> and up/down arrows) */}
                  {/* Top center drag pill */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'n')}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-indigo-600 hover:bg-indigo-500 border border-white rounded-full flex items-center justify-center cursor-n-resize shadow-md hover:scale-110 active:scale-95 transition-all z-[999]"
                    title="Esticar / Encolher topo"
                  >
                    <LucideIcons.ChevronsUpDown className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Bottom center drag pill */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 's')}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-indigo-600 hover:bg-indigo-500 border border-white rounded-full flex items-center justify-center cursor-s-resize shadow-md hover:scale-110 active:scale-95 transition-all z-[999]"
                    title="Esticar / Encolher base"
                  >
                    <LucideIcons.ChevronsUpDown className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Left center drag pill */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'w')}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-600 hover:bg-indigo-500 border border-white rounded-full flex items-center justify-center cursor-w-resize shadow-md hover:scale-110 active:scale-95 transition-all z-[999]"
                    title="Esticar / Encolher esquerda"
                  >
                    <LucideIcons.ChevronsLeftRight className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Right center drag pill */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'e')}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-600 hover:bg-indigo-500 border border-white rounded-full flex items-center justify-center cursor-e-resize shadow-md hover:scale-110 active:scale-95 transition-all z-[999]"
                    title="Esticar / Encolher direita"
                  >
                    <LucideIcons.ChevronsLeftRight className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Corner Round Handles */}
                  {/* Top-Left Corner */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-nw-resize shadow-md z-[999] hover:scale-125 transition-transform"
                    title="Arrastar canto superior-esquerdo para redimensionar"
                  />
                  {/* Top-Right Corner */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-ne-resize shadow-md z-[999] hover:scale-125 transition-transform"
                    title="Arrastar canto superior-direito para redimensionar"
                  />
                  {/* Bottom-Left Corner */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-sw-resize shadow-md z-[999] hover:scale-125 transition-transform"
                    title="Arrastar canto inferior-esquerdo para redimensionar"
                  />
                  {/* Bottom-Right Corner */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 border-2 border-white rounded-full cursor-se-resize shadow-md z-[999] flex items-center justify-center hover:scale-125 transition-transform"
                    title="Arrastar canto inferior-direito para redimensionar"
                  >
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </>
              )}

              {/* Mini tag indicator */}
              {isSelected && (
                <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none whitespace-nowrap z-[999] font-mono">
                  {el.name} ({Math.round(el.width)}% x {Math.round(el.height)}%)
                </div>
              )}

              {/* Centered Premium Floating Control Bar with Split AND direct Blur level controllers */}
              {isSelected && (
                <div 
                  onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking buttons
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -top-[52px] left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-xl shadow-2xl z-[9999] whitespace-nowrap text-xs font-sans ring-2 ring-indigo-500/30"
                >
                  {/* Splitters section */}
                  <div className="flex items-center gap-1 border-r border-slate-800 pr-2.5">
                    <button
                      onClick={() => onSplitWithAI && onSplitWithAI(el)}
                      disabled={isSplitting}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg transition-colors cursor-pointer"
                      title="Desmembrar este bloco em partes menores com IA"
                    >
                      {isSplitting ? (
                        <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LucideIcons.Sparkles className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
                      )}
                      <span>Dismantle IA</span>
                    </button>

                    {el.type === 'text' && (
                      <button
                        onClick={() => onSplitByLines && onSplitByLines(el)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Separar linhas do texto"
                      >
                        <LucideIcons.Scissors className="w-3 h-3 text-amber-400" />
                        <span>Separar Linhas</span>
                      </button>
                    )}
                  </div>

                  {/* Direct blur level slider control! */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <LucideIcons.EyeOff className="w-3.5 h-3.5 text-slate-300" />
                      <span>Blur:</span>
                      <span className="font-mono text-indigo-400 font-bold w-6">{el.blur ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={el.blur ?? 0}
                      onChange={(e) => {
                        if (onUpdateElement) {
                          onUpdateElement({
                            ...el,
                            blur: Number(e.target.value)
                          });
                        }
                      }}
                      className="w-20 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />

                    {(el.blur ?? 0) > 0 && (
                      <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 ml-1">
                        <button
                          onClick={() => {
                            if (onUpdateElement) {
                              onUpdateElement({ ...el, blurType: 'full' });
                            }
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            (!el.blurType || el.blurType === 'full') 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Desfoque total"
                        >
                          Cheio
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateElement) {
                              onUpdateElement({ ...el, blurType: 'top' });
                            }
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            el.blurType === 'top' 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Desfoque na parte superior"
                        >
                          Topo
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateElement) {
                              onUpdateElement({ ...el, blurType: 'bottom' });
                            }
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            el.blurType === 'bottom' 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Desfoque na parte inferior"
                        >
                          Base
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
