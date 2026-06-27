import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '15mb' }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * AI Endpoint to analyze uploaded images/mockups
 * It dismantles the image into draggable/customizable elements (profile picture, title, body, icons etc.)
 */
app.post("/api/dismantle", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Faltando dados da imagem para desconstrução." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY não configurada no servidor. Por favor, adicione sua chave nas Secrets para ativar a inteligência de desmonte." 
      });
    }

    // Set up Prompt to ask Gemini to identify UI elements
    const prompt = `Analise detalhadamente a imagem de interface/post fornecida e desmonte-a em elementos individuais que compõem este layout.
Para cada elemento que você identificar (por exemplo: foto de perfil/avatar, nome de usuário, handle/arroba, texto de título, texto de conteúdo, botões, ícones, badges ou cartões de fundo/containers), determine suas propriedades visuais aproximadas.

Retorne uma lista estruturada de elementos contendo coordenadas normalizadas de 0 a 100 referentes ao tamanho da tela (x, y, largura/width, altura/height) e todas as suas estilizações associadas para recriarmos em nosso editor interativo interativo.

Mapeie os elementos de volta com muito critério e atenção:
1. Um container de fundo principal que engloba tudo (tipo 'container').
2. Foto de perfil se houver (tipo 'avatar' com imagem genérica ou detectada).
3. Textos individuais (tipo 'text') com 'text' correspondente ao que está escrito, tamanho da fonte aproximado ('fontSize' de 10 a 32), alinhamento, peso, etc.
4. Ícones se houver (tipo 'icon') fornecendo o nome correto de um ícone do Lucide React (exemplo: 'Heart', 'MessageCircle', 'Share2', 'Bookmark', 'MoreVertical', 'BookOpen', 'MoreHorizontal', 'ThumbsUp', 'MessageSquare', 'ExternalLink', 'ChevronRight', 'Settings').
5. Badges/marcadores (tipo 'badge') se houver cores ou pontos indicadores.
6. Botões se houver (tipo 'button') com o texto rotulado.

Mantenha as coordenadas x, y, width, height proporcionais e em porcentagem (0-100) para cobrir o canvas de forma elegante. Evite sobrepor elementos de forma desordenada. Organize os zIndex para que o container fique por baixo (zIndex: 1) e os textos/avatares fiquem por cima (zIndex: 2, 3, etc).`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: imageBase64
      }
    };

    const textPart = {
      text: prompt
    };

    // Use gemini-2.5-flash as default for image processing and structural JSON extraction
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["canvas", "elements"],
          properties: {
            canvas: {
              type: Type.OBJECT,
              required: ["width", "height", "backgroundColor"],
              properties: {
                width: { type: Type.INTEGER, description: "Largura ideal sugerida para o canvas (ex: 800)" },
                height: { type: Type.INTEGER, description: "Altura ideal sugerida para o canvas (ex: 350)" },
                backgroundColor: { type: Type.STRING, description: "Cor de fundo aproximada do post/imagem (hex)" },
                borderRadius: { type: Type.INTEGER, description: "Borda arredondada do canvas (ex: 16)" }
              }
            },
            elements: {
              type: Type.ARRAY,
              description: "Lista de elementos visuais detectados no post",
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "name", "x", "y", "width", "height", "zIndex"],
                properties: {
                  id: { type: Type.STRING, description: "Um ID único do elemento (ex: user-name, main-bg)" },
                  type: { 
                    type: Type.STRING, 
                    description: "Tipo do elemento",
                    enum: ["avatar", "text", "image", "button", "icon", "container", "badge"] 
                  },
                  name: { type: Type.STRING, description: "Nome amigável legível (ex: Foto de Perfil, Texto do Título)" },
                  x: { type: Type.NUMBER, description: "Posição X normalizada (0-100)" },
                  y: { type: Type.NUMBER, description: "Posição Y normalizada (0-100)" },
                  width: { type: Type.NUMBER, description: "Largura normalizada (0-100)" },
                  height: { type: Type.NUMBER, description: "Altura normalizada (0-100)" },
                  rotation: { type: Type.NUMBER, description: "Graus de rotação sugeridos (padrão 0)" },
                  opacity: { type: Type.NUMBER, description: "Opacidade do elemento (0 a 1)" },
                  zIndex: { type: Type.INTEGER, description: "Nível de empilhamento vertical" },
                  
                  // Text fields
                  text: { type: Type.STRING, description: "Conteúdo textual extraído exatamente do elemento" },
                  fontSize: { type: Type.INTEGER, description: "Tamanho do texto sugerido em px (ex: 14)" },
                  fontWeight: { type: Type.STRING, enum: ["normal", "medium", "semibold", "bold"] },
                  fontFamily: { type: Type.STRING, enum: ["Inter", "Space Grotesk", "JetBrains Mono", "Playfair Display"] },
                  fontColor: { type: Type.STRING, description: "Cor do texto em hex (ex: #1e293b)" },
                  textAlign: { type: Type.STRING, enum: ["left", "center", "right"] },
                  
                  // Style fields
                  backgroundColor: { type: Type.STRING, description: "Cor de fundo do elemento em hex, se aplicável (ex: #ffffff)" },
                  borderRadius: { type: Type.INTEGER, description: "Raio da borda em px, se aplicável (ex: 8)" },
                  borderColor: { type: Type.STRING, description: "Cor da borda em hex, se aplicável" },
                  borderWidth: { type: Type.INTEGER, description: "Espessura de borda" },
                  
                  // Custom sources
                  imageUrl: { type: Type.STRING, description: "URL de imagem fictícia ou aproximada para preenchimento" },
                  iconName: { type: Type.STRING, description: "Nome válido correspondente no Lucide Icon (ex: Heart, Share2, MessageCircle)" }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta vazia da IA.");
    }

    const dismantledData = JSON.parse(resultText);
    res.json(dismantledData);

  } catch (error: any) {
    console.error("Erro no desmonte da imagem:", error);
    res.status(500).json({ 
      error: "Falha ao desmontar imagem com Gemini AI", 
      details: error.message || error 
    });
  }
});

/**
 * AI Endpoint to split a specific composite element (e.g. combined text block) into fine-grained sub-elements.
 * This is extremely useful when the automated dismantle grouped too many things together.
 */
app.post("/api/split-element", async (req, res) => {
  try {
    const { element } = req.body;

    if (!element) {
      return res.status(400).json({ error: "Nenhum elemento fornecido para desmembrar." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY não configurada no servidor." 
      });
    }

    const prompt = `Você é um assistente especialista em UI/UX e front-end. O usuário forneceu um único elemento de layout que não foi completamente desmontado (por exemplo, um único bloco de texto que contém vários elementos agrupados como nome de usuário, handle/arroba, data e texto do post, ou um título misturado com subtítulo).
    
Sua tarefa é desmembrar este elemento em partes menores e mais precisas (sub-elementos individuais).

Elemento original a ser dividido:
ID: "${element.id}"
Tipo: "${element.type}"
Nome original: "${element.name}"
Texto/Conteúdo: "${element.text || ''}"
X: ${element.x} (porcentagem do canvas)
Y: ${element.y} (porcentagem do canvas)
Largura: ${element.width} (porcentagem do canvas)
Altura: ${element.height} (porcentagem do canvas)

Instruções para a divisão:
1. Divida o texto ou a estrutura em partes semânticas e lógicas. Por exemplo, se o texto tiver quebras de linha ou padrões como "@username" ou números de curtidas, isole-os em novos elementos de tipo 'text', 'badge' ou 'icon'.
2. Calcule novas coordenadas (x, y, width, height) para cada sub-elemento para que, juntos, fiquem posicionados exatamente na mesma região do elemento original.
3. Se houver quebras de linha no texto, divida cada parágrafo ou linha importante em um novo elemento com um 'y' progressivo para que eles fiquem empilhados perfeitamente de cima para baixo.
4. Mantenha os zIndex apropriados (comece do zIndex original: ${element.zIndex || 2} e incremente).
5. Retorne os novos elementos gerados no mesmo formato JSON estruturado.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["elements"],
          properties: {
            elements: {
              type: Type.ARRAY,
              description: "Lista de novos sub-elementos menores que devem substituir o elemento original",
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "name", "x", "y", "width", "height", "zIndex"],
                properties: {
                  id: { type: Type.STRING },
                  type: { 
                    type: Type.STRING, 
                    enum: ["avatar", "text", "image", "button", "icon", "container", "badge"] 
                  },
                  name: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER },
                  zIndex: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  fontSize: { type: Type.INTEGER },
                  fontWeight: { type: Type.STRING, enum: ["normal", "medium", "semibold", "bold"] },
                  fontFamily: { type: Type.STRING, enum: ["Inter", "Space Grotesk", "JetBrains Mono", "Playfair Display"] },
                  fontColor: { type: Type.STRING },
                  textAlign: { type: Type.STRING, enum: ["left", "center", "right"] },
                  backgroundColor: { type: Type.STRING },
                  borderRadius: { type: Type.INTEGER },
                  borderColor: { type: Type.STRING },
                  borderWidth: { type: Type.INTEGER },
                  imageUrl: { type: Type.STRING },
                  iconName: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta de desmembramento vazia.");
    }

    const parsed = JSON.parse(resultText);
    res.json(parsed);

  } catch (error: any) {
    console.error("Erro ao dividir elemento:", error);
    res.status(500).json({ 
      error: "Falha ao desmembrar o elemento selecionado.", 
      details: error.message || error 
    });
  }
});

// Serve frontend build static files or connect Vite in development mode
async function startAppServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PostMorph Server running on port ${PORT}`);
  });
}

startAppServer().catch(err => {
  console.error("Failed to start server:", err);
});
