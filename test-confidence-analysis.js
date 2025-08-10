const axios = require('axios');

async function testConfidenceAnalysis() {
  console.log('🔍 ANALISANDO DADOS DE CONFIANÇA DAS PREDIÇÕES\n');

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
    let confidenceStats = { alta: 0, média: 0, baixa: 0 };
    let percentStats = { home: [], away: [], draw: [] };
    let formStats = { home: [], away: [] };
    let totalStats = { home: [], away: [] };

    predictions.forEach((pred, index) => {
      console.log(`\n--- PREDIÇÃO ${index + 1} ---`);
      
      const fixture = pred.fixture;
      const prediction = pred.prediction;
      const confidence = pred.confidence;
      
      console.log(`Jogo: ${fixture.teams?.home?.name || 'N/A'} vs ${fixture.teams?.away?.name || 'N/A'}`);
      console.log(`Confiança: ${confidence}`);
      
      // Contar confianças
      confidenceStats[confidence]++;
      
      // Analisar porcentagens
      if (prediction?.predictions?.percent) {
        const percent = prediction.predictions.percent;
        console.log(`Porcentagens: Casa ${percent.home}%, Empate ${percent.draw}%, Fora ${percent.away}%`);
        
        percentStats.home.push(parseInt(percent.home) || 0);
        percentStats.away.push(parseInt(percent.away) || 0);
        percentStats.draw.push(parseInt(percent.draw) || 0);
      }
      
      // Analisar comparação
      if (prediction?.predictions?.comparison) {
        const comparison = prediction.predictions.comparison;
        console.log(`Comparação: Forma Casa ${comparison.form?.home || 'N/A'}, Fora ${comparison.form?.away || 'N/A'}`);
        console.log(`Total: Casa ${comparison.total?.home || 'N/A'}, Fora ${comparison.total?.away || 'N/A'}`);
        
        formStats.home.push(parseInt(comparison.form?.home) || 0);
        formStats.away.push(parseInt(comparison.form?.away) || 0);
        totalStats.home.push(parseFloat(comparison.total?.home) || 0);
        totalStats.away.push(parseFloat(comparison.total?.away) || 0);
      }
      
      // Analisar H2H se disponível
      if (pred.h2h && !pred.h2h.error) {
        console.log(`H2H Confiança: ${pred.h2h.confidence}`);
        console.log(`H2H Insights: ${pred.h2h.insights?.join(', ') || 'N/A'}`);
      }
    });

    // Estatísticas gerais
    console.log('\n📈 ESTATÍSTICAS GERAIS');
    console.log('========================');
    console.log(`Confiança Alta: ${confidenceStats.alta} (${((confidenceStats.alta/predictions.length)*100).toFixed(1)}%)`);
    console.log(`Confiança Média: ${confidenceStats.média} (${((confidenceStats.média/predictions.length)*100).toFixed(1)}%)`);
    console.log(`Confiança Baixa: ${confidenceStats.baixa} (${((confidenceStats.baixa/predictions.length)*100).toFixed(1)}%)`);
    
    if (percentStats.home.length > 0) {
      const avgHome = percentStats.home.reduce((a, b) => a + b, 0) / percentStats.home.length;
      const avgAway = percentStats.away.reduce((a, b) => a + b, 0) / percentStats.away.length;
      const avgDraw = percentStats.draw.reduce((a, b) => a + b, 0) / percentStats.draw.length;
      
      console.log('\n📊 MÉDIAS DE PORCENTAGEM');
      console.log(`Casa: ${avgHome.toFixed(1)}%`);
      console.log(`Empate: ${avgDraw.toFixed(1)}%`);
      console.log(`Fora: ${avgAway.toFixed(1)}%`);
      
      // Análise de distribuição
      const highConfidence = percentStats.home.filter(p => p >= 70).length + percentStats.away.filter(p => p >= 70).length;
      const mediumConfidence = percentStats.home.filter(p => p >= 60 && p < 70).length + percentStats.away.filter(p => p >= 60 && p < 70).length;
      
      console.log(`\n🎯 ANÁLISE DE DISTRIBUIÇÃO`);
      console.log(`Porcentagens >= 70%: ${highConfidence}`);
      console.log(`Porcentagens 60-69%: ${mediumConfidence}`);
    }

    // Sugestões de melhoria
    console.log('\n💡 SUGESTÕES DE MELHORIA');
    console.log('==========================');
    
    if (confidenceStats.baixa > confidenceStats.alta + confidenceStats.média) {
      console.log('❌ PROBLEMA: Muitas predições com confiança baixa');
      console.log('🔧 SOLUÇÕES:');
      console.log('   1. Reduzir threshold de porcentagem para confiança média (de 60% para 55%)');
      console.log('   2. Considerar diferença de forma como fator de confiança');
      console.log('   3. Melhorar análise H2H para aumentar confiança');
      console.log('   4. Adicionar análise de lesões e escalações');
    }

  } catch (error) {
    console.error('❌ Erro ao analisar predições:', error.message);
  }
}

testConfidenceAnalysis();
