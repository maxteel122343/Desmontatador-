import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface ImageUploaderProps {
  onDismantleRequested: (base64: string, mimeType: string) => Promise<void>;
  isAnalyzing: boolean;
  onLoadPreset: (index: number) => void;
  presets: Array<{ name: string; description: string }>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onDismantleRequested,
  isAnalyzing,
  onLoadPreset,
  presets
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert image file to base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, envie um arquivo de imagem válido (PNG, JPEG, WebP).');
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Extract base64 representation and mimeType
        const base64Data = result.split(',')[1];
        const mimeType = file.type;
        try {
          await onDismantleRequested(base64Data, mimeType);
        } catch (err: any) {
          setError(err.message || 'Erro inesperado ao processar o desmonte com o Gemini AI.');
        }
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop Event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Input File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Subir Mockup de Post para Desmontar
        </h3>
        <p className="text-xs text-slate-400">
          Envie um print de tela ou design de post. A inteligência artificial irá analisar os componentes visuais e remontá-los como elementos arrastáveis.
        </p>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50/40' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
        }`}
        onClick={() => document.getElementById('image-file-input')?.click()}
      >
        <input
          id="image-file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />

        {isAnalyzing ? (
          <div className="space-y-3 py-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div>
              <p className="text-xs font-bold text-indigo-900 font-display">Desmontando UI com Gemini AI...</p>
              <p className="text-[10px] text-slate-400 mt-1">Identificando textos, avatares, ícones e organizando em camadas.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 rounded-full inline-flex text-indigo-600 mb-1">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Arrastar print ou clicar para selecionar</p>
              <p className="text-[10px] text-slate-400 mt-1">Suporta PNG, JPG, WEBP e capturas de tela</p>
            </div>
            {fileName && (
              <div className="mt-2 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-flex items-center gap-1">
                <FileText className="w-3 h-3" /> {fileName}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex gap-2 items-start text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Houve um imprevisto:</p>
            <p className="opacity-90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Preset templates selector fallback */}
      <div className="pt-3 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Ou carregue um preset de demonstração</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p, index) => (
            <button
              key={index}
              onClick={() => onLoadPreset(index)}
              className="text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all group"
            >
              <h4 className="text-xs font-bold text-slate-700 font-display group-hover:text-indigo-600 transition-colors">
                {p.name}
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
