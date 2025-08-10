const axios = require('axios');

async function testSimplifiedRecommendations() {
  console.log('🎯 TESTANDO RECOMENDAÇÕES SIMPLIFICADAS\n');

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
      const prediction = pred.prediction;
      const confidence = pred.confidence;
      const recommendation = pred.recommendation;
      
      console.log(`Jogo: ${fixture.teams?.home?.name || 'N/A'} vs ${fixture.teams?.away?.name || 'N/A'}`);
      console.log(`Confiança: ${confidence}`);
      console.log(`🎯 MELHOR OPORTUNIDADE: ${recommendation}`);
      
      // Mostrar dados de suporte se disponível
      if (prediction?.predictions?.percent) {
        const percent = prediction.predictions.percent;
        console.log(`📊 Suporte: Casa ${percent.home}%, Empate ${percent.draw}%, Fora ${percent.away}%`);
      }
      
      // Mostrar insights H2H se disponível
      if (pred.h2h && !pred.h2h.error && pred.h2h.stats) {
        const { totalMatches, averageGoals, bothTeamsScoredRate } = pred.h2h.stats;
        console.log(`📈 H2H: ${totalMatches} jogos, Média ${averageGoals.toFixed(1)} gols, Ambos marcam ${bothTeamsScoredRate.toFixed(1)}%`);
      }
    });

    // Estatísticas das recomendações
    console.log('\n📈 ANÁLISE DAS RECOMENDAÇÕES');
    console.log('=============================');
    
    const recommendationTypes = {};
    predictions.forEach(pred => {
      const rec = pred.recommendation || 'Sem recomendação';
      const type = rec.split('(')[0].trim();
      recommendationTypes[type] = (recommendationTypes[type] || 0) + 1;
    });
    
    Object.entries(recommendationTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count} (${((count/predictions.length)*100).toFixed(1)}%)`);
    });

  } catch (error) {
    console.error('❌ Erro ao analisar recomendações:', error.message);
  }
}

testSimplifiedRecommendations();
