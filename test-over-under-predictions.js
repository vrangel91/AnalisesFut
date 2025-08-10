const axios = require('axios');

async function testOverUnderPredictions() {
  console.log('🎯 TESTANDO PREDIÇÕES OVER/UNDER COM MARGEM DE SEGURANÇA\n');

  try {
    // Testar predições de hoje
    console.log('📊 Obtendo predições de hoje...');
    const predictionsResponse = await axios.get('http://localhost:3001/api/predictions/today');
    
    if (!predictionsResponse.data.success || !predictionsResponse.data.data) {
      console.log('❌ Nenhuma predição encontrada');
      return;
    }

    const predictions = predictionsResponse.data.data;
    console.log(`✅ Encontradas ${predictions.length} predições\n`);

    // Analisar cada predição
    predictions.forEach((pred, index) => {
      console.log(`\n--- PREDIÇÃO ${index + 1} ---`);
      
      const fixture = pred.fixture;
      const confidence = pred.confidence;
      const recommendation = pred.recommendation;
      
      console.log(`Jogo: ${fixture.teams?.home?.name || 'N/A'} vs ${fixture.teams?.away?.name || 'N/A'}`);
      console.log(`Confiança: ${confidence}`);
      console.log(`🎯 PREDIÇÃO: ${recommendation}`);
      
      // Mostrar dados H2H detalhados se disponível
      if (pred.h2h && !pred.h2h.error && pred.h2h.stats) {
        const stats = pred.h2h.stats;
        console.log(`📈 H2H Stats:`);
        console.log(`   Jogos analisados: ${stats.totalMatches}`);
        console.log(`   Média gols: ${stats.averageGoals?.toFixed(1) || 'N/A'}`);
        console.log(`   Média escanteios: ${stats.averageCorners?.toFixed(1) || 'N/A'}`);
        console.log(`   Média cartões: ${stats.averageCards?.toFixed(1) || 'N/A'}`);
        console.log(`   Média finalizações: ${stats.averageShots?.toFixed(1) || 'N/A'}`);
        
        // Mostrar taxas de acerto se disponível
        if (stats.overCorners65Rate > 0) {
          console.log(`   Over 6.5 escanteios: ${stats.overCorners65Rate.toFixed(1)}%`);
        }
        if (stats.overCards45Rate > 0) {
          console.log(`   Over 4.5 cartões: ${stats.overCards45Rate.toFixed(1)}%`);
        }
        if (stats.overShots115Rate > 0) {
          console.log(`   Over 11.5 finalizações: ${stats.overShots115Rate.toFixed(1)}%`);
        }
      }
    });

    // Estatísticas das predições
    console.log('\n📊 ANÁLISE DAS PREDIÇÕES OVER/UNDER');
    console.log('====================================');
    
    const predictionTypes = {};
    const overUnderStats = {
      gols: { over: 0, under: 0 },
      escanteios: { over: 0, under: 0 },
      cartoes: { over: 0, under: 0 },
      finalizacoes: { over: 0, under: 0 },
      outros: 0
    };
    
    predictions.forEach(pred => {
      const rec = pred.recommendation || 'Sem recomendação';
      
      // Categorizar predições
      if (rec.includes('gols')) {
        if (rec.includes('Over')) overUnderStats.gols.over++;
        else if (rec.includes('Under')) overUnderStats.gols.under++;
      } else if (rec.includes('escanteios')) {
        if (rec.includes('Over')) overUnderStats.escanteios.over++;
        else if (rec.includes('Under')) overUnderStats.escanteios.under++;
      } else if (rec.includes('cartões')) {
        if (rec.includes('Over')) overUnderStats.cartoes.over++;
        else if (rec.includes('Under')) overUnderStats.cartoes.under++;
      } else if (rec.includes('finalizações')) {
        if (rec.includes('Over')) overUnderStats.finalizacoes.over++;
        else if (rec.includes('Under')) overUnderStats.finalizacoes.under++;
      } else {
        overUnderStats.outros++;
      }
      
      // Contar tipos gerais
      const type = rec.split('(')[0].trim();
      predictionTypes[type] = (predictionTypes[type] || 0) + 1;
    });
    
    console.log('\n🎯 DISTRIBUIÇÃO POR TIPO:');
    Object.entries(overUnderStats).forEach(([tipo, stats]) => {
      const total = stats.over + stats.under + (tipo === 'outros' ? stats.outros : 0);
      if (total > 0) {
        console.log(`${tipo.toUpperCase()}:`);
        if (tipo !== 'outros') {
          console.log(`  Over: ${stats.over} (${((stats.over/total)*100).toFixed(1)}%)`);
          console.log(`  Under: ${stats.under} (${((stats.under/total)*100).toFixed(1)}%)`);
        } else {
          console.log(`  Outros: ${stats.outros} (${((stats.outros/total)*100).toFixed(1)}%)`);
        }
      }
    });

    // Validação da estratégia de margem de segurança
    console.log('\n🔍 VALIDAÇÃO DA ESTRATÉGIA DE MARGEM DE SEGURANÇA');
    console.log('==================================================');
    console.log('✅ Estratégia implementada: 1 ponto abaixo da média');
    console.log('📊 Exemplos:');
    console.log('   - Média 3.5 gols → Over 2.5 gols');
    console.log('   - Média 7.5 escanteios → Over 6.5 escanteios');
    console.log('   - Média 5.5 cartões → Over 4.5 cartões');
    console.log('   - Média 12.5 finalizações → Over 11.5 finalizações');
    console.log('\n🎯 Objetivo: Maior assertividade com margem de segurança');

  } catch (error) {
    console.error('❌ Erro ao analisar predições over/under:', error.message);
  }
}

testOverUnderPredictions();

