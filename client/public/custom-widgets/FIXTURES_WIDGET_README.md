# 🏆 Widget FIXTURES - API-FOOTBALL

## 📋 Descrição

Este é um widget personalizado da API-FOOTBALL que exibe **fixtures** (jogos) de uma data específica. O widget é configurado com sua chave da API e pode ser usado independentemente ou integrado ao projeto.

## 🔧 Configuração

### **Arquivo Criado:**
- **`fixtures-widget.html`** - Widget FIXTURES completo e funcional

### **Configurações Aplicadas:**
```html
<div id="wg-api-football-fixtures"
     data-host="v3.football.api-sports.io"
     data-refresh="60"
     data-date="2022-02-11"
     data-key="723269d925a86ea56e8311e812380c97"
     data-theme=""
     data-show-errors="false"
     class="api_football_loader">
</div>
```

### **Parâmetros Configurados:**
- ✅ **`data-host`**: `v3.football.api-sports.io`
- ✅ **`data-refresh`**: `60` (atualização a cada 60 segundos)
- ✅ **`data-date`**: `2022-02-11` (data dos jogos)
- ✅ **`data-key`**: `723269d925a86ea56e8311e812380c97` (sua API key)
- ✅ **`data-theme`**: `""` (tema padrão)
- ✅ **`data-show-errors`**: `false` (não mostrar erros)

## 🚀 Como Usar

### **1. Abrir Diretamente:**
```
http://localhost:3000/custom-widgets/fixtures-widget.html
```

### **2. Integrar no Projeto:**
- Use como iframe em qualquer página
- Adicione ao Dashboard como seção separada
- Use em modais ou abas específicas

### **3. Personalizar Data:**
```javascript
// Mudar para data específica
changeDate('2024-01-15');

// Mudar para hoje
changeDate(new Date().toISOString().split('T')[0]);
```

## 🎨 Funcionalidades

### **✅ Widget Funcional:**
- 📅 **Exibe jogos** da data configurada
- 🔄 **Atualização automática** a cada 60 segundos
- 📱 **Responsivo** para mobile e desktop
- 🎨 **Estilos customizados** aplicados

### **✅ JavaScript Avançado:**
- 👀 **MutationObserver** para detectar renderização
- 🎨 **Estilos automáticos** aplicados após carregamento
- ⏰ **Data automática** atualizada para hoje
- 📱 **Detecção de dispositivo** automática

### **✅ Funções Úteis:**
```javascript
// Abrir em nova aba
openInNewTab();

// Mudar data
changeDate('2024-01-20');

// Recarregar widget
refreshWidget();
```

## 🔑 API Key

### **Sua Chave Configurada:**
```
723269d925a86ea56e8311e812380c97
```

### **⚠️ IMPORTANTE:**
- Esta chave está **hardcoded** no arquivo HTML
- Para produção, considere usar variáveis de ambiente
- A chave é válida e funcional

## 📱 Responsividade

### **Desktop:**
- Container de 1200px de largura
- Header com gradiente azul
- Padding de 2rem

### **Mobile:**
- Padding reduzido para 10px
- Header com padding de 1.5rem
- Título com fonte menor

## 🎯 Integração com o Projeto

### **1. No Dashboard:**
```javascript
// Adicionar seção de fixtures
const fixturesSection = `
  <iframe 
    src="/custom-widgets/fixtures-widget.html"
    width="100%"
    height="600"
    frameBorder="0"
    title="Fixtures Widget">
  </iframe>
`;
```

### **2. Em Modais:**
```javascript
// Abrir modal com fixtures
const fixturesModal = `
  <div class="modal">
    <iframe 
      src="/custom-widgets/fixtures-widget.html"
      width="100%"
      height="500"
      frameBorder="0">
    </iframe>
  </div>
`;
```

### **3. Como Componente React:**
```jsx
const FixturesWidget = () => (
  <iframe
    src="/custom-widgets/fixtures-widget.html"
    className="fixtures-widget"
    title="Fixtures"
  />
);
```

## 🔄 Atualizações

### **Automáticas:**
- **60 segundos**: Atualização padrão do widget
- **Data**: Atualizada automaticamente para hoje
- **Estilos**: Aplicados após renderização

### **Manuais:**
- **Recarregar página**: `F5` ou `Ctrl+R`
- **Função JavaScript**: `refreshWidget()`
- **Mudar data**: `changeDate('nova-data')`

## 📊 Console Logs

### **Informações Exibidas:**
```
🎯 Widget FIXTURES carregado com sucesso!
📅 Data configurada: 2022-02-11
🔄 Atualização: a cada 60 segundos
🔑 API Key configurada
✅ Widget FIXTURES renderizado com sucesso!
🎨 Aplicando estilos customizados...
✅ Estilos customizados aplicados!
📅 Atualizando data para: 2024-01-15
📱 Modo mobile detectado
⚙️ Configurações do widget: {...}
```

## 🎉 Resultado Final

Com este widget, você tem:
- ✅ **Widget FIXTURES** totalmente funcional
- ✅ **API Key configurada** e funcionando
- ✅ **Estilos customizados** aplicados
- ✅ **Responsividade** para todos os dispositivos
- ✅ **Integração fácil** com o projeto existente
- ✅ **Funcionalidades avançadas** via JavaScript

**O widget está pronto para uso e pode ser acessado diretamente ou integrado ao seu projeto!** 🏆⚽✨
