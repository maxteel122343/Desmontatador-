import React from 'react';
import { 
  Palette, 
  Settings, 
  Grid, 
  Sparkles, 
  Maximize, 
  RotateCw,
  Image as ImageIcon
} from 'lucide-react';
import { CanvasSettings } from '../types';

interface CanvasSettingsPanelProps {
  settings: CanvasSettings;
  onUpdateSettings: (settings: CanvasSettings) => void;
}

export const CanvasSettingsPanel: React.FC<CanvasSettingsPanelProps> = ({
  settings,
  onUpdateSettings
}) => {
  const handlePropChange = (key: keyof CanvasSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  const shadowPresets = [
    { value: 'none', label: 'Sem Sombra' },
    { value: 'sm', label: 'Sombra Suave (sm)' },
    { value: 'md', label: 'Média (md)' },
    { value: 'lg', label: 'Grande (lg)' },
    { value: 'xl', label: 'Robusta (xl)' },
    { value: '2xl', label: 'Máxima (2xl)' }
  ];

  const sizePresets = [
    { width: 800, height: 320, label: 'Post Retangular Pequeno (800x320)' },
    { width: 800, height: 450, label: 'Post Retangular Padrão (800x450)' },
    { width: 600, height: 600, label: 'Post Quadrado (600x600)' },
    { width: 380, height: 680, label: 'Mockup Mobile (380x680)' }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          Configurações da Tela Geral
        </h3>
        <p className="text-[10px] text-slate-400">Ajuste o tamanho, cor e sombras do quadro do post</p>
      </div>

      <div className="space-y-3">
        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Largura (px)</label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) => handlePropChange('width', Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              min="200"
              max="1200"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Altura (px)</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) => handlePropChange('height', Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              min="200"
              max="1000"
            />
          </div>
        </div>

        {/* Quick Size Preset Selector */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Sugestões de Tamanho</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const [w, h] = e.target.value.split('x').map(Number);
                onUpdateSettings({ ...settings, width: w, height: h });
              }
            }}
            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 bg-white"
            defaultValue=""
          >
            <option value="" disabled>Selecione um preset...</option>
            {sizePresets.map((p, idx) => (
              <option key={idx} value={`${p.width}x${p.height}`}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Colors & Backdrops */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Fundo da Tela</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.backgroundColor.startsWith('#') ? settings.backgroundColor : '#ffffff'}
                onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-slate-200 shrink-0"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                className="w-full text-[10px] uppercase font-mono px-1 py-1.5 border border-slate-200 rounded focus:outline-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">Canto Redondo (px)</label>
            <input
              type="number"
              value={settings.borderRadius}
              onChange={(e) => handlePropChange('borderRadius', Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500"
              min="0"
              max="60"
            />
          </div>
        </div>

        {/* Shadow Presets */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Sombra do Card</label>
          <div className="grid grid-cols-3 gap-1">
            {shadowPresets.slice(0, 3).map((sp) => (
              <button
                key={sp.value}
                type="button"
                onClick={() => handlePropChange('boxShadow', sp.value)}
                className={`text-[10px] py-1 border rounded transition-colors ${
                  settings.boxShadow === sp.value 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {sp.label.split(' ')[0]}
              </button>
            ))}
            {shadowPresets.slice(3).map((sp) => (
              <button
                key={sp.value}
                type="button"
                onClick={() => handlePropChange('boxShadow', sp.value)}
                className={`text-[10px] py-1 border rounded transition-colors ${
                  settings.boxShadow === sp.value 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {sp.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Optional decorative background image */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-[11px] font-medium text-slate-500 block mb-1 flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-slate-400" /> Imagem de Fundo (URL)
          </label>
          <input
            type="text"
            value={settings.backgroundImage || ''}
            onChange={(e) => handlePropChange('backgroundImage', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-indigo-500 font-mono text-[10px]"
            placeholder="Link opcional de imagem..."
          />
          {settings.backgroundImage && (
            <div className="mt-2">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Desfoque do Fundo</span>
                <span>{settings.backgroundBlur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={settings.backgroundBlur || 0}
                onChange={(e) => handlePropChange('backgroundBlur', Number(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
