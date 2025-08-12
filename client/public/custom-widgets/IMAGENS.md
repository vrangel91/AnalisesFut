# 🖼️ Imagens para Customização dos Widgets

## 📁 Arquivos de Imagem Necessários

### **soccer_fields.png**
- **Descrição**: Imagem dos campos de futebol para estatísticas visuais
- **Uso**: Mostrar posicionamento dos jogadores e estatísticas do campo
- **Formato**: PNG com transparência
- **Tamanho**: Recomendado 800x600px ou similar

### **sprite.svg**
- **Descrição**: Sprite SVG com ícones customizados
- **Uso**: Elementos visuais como cartões, gols, substituições
- **Formato**: SVG com múltiplos ícones
- **Estrutura**: Ícones organizados em grid para uso com CSS

## 🎨 Como Usar

### **1. Colocar os arquivos nesta pasta:**
```
client/public/custom-widgets/
├── api-football.css
├── soccer_fields.png
├── sprite.svg
└── README.md
```

### **2. Referenciar no CSS:**
```css
/* Exemplo de uso das imagens */
.statistics-field {
  background-image: url('/custom-widgets/soccer_fields.png');
  background-size: cover;
  background-position: center;
}

.icon-goal {
  background-image: url('/custom-widgets/sprite.svg#goal');
  background-size: 24px 24px;
}
```

### **3. Widget carrega automaticamente:**
- ✅ **CSS customizado** aplicado via parâmetro `custom-css`
- ✅ **Imagens locais** carregadas do servidor
- ✅ **Estilo consistente** com o resto da aplicação

## 🔧 Configuração

As imagens são automaticamente disponibilizadas em:
- **URL**: `http://localhost:3000/custom-widgets/`
- **Acesso**: Via iframe do widget
- **Cache**: Gerenciado pelo navegador

## 📱 Responsividade

- **Desktop**: Imagens em tamanho completo
- **Tablet**: Escaladas proporcionalmente
- **Mobile**: Otimizadas para telas pequenas

## 🎯 Resultado

Com as imagens configuradas, o widget terá:
- ✅ **Visual profissional** e consistente
- ✅ **Ícones customizados** para melhor UX
- ✅ **Estatísticas visuais** com campos de futebol
- ✅ **Design unificado** com o Dashboard
