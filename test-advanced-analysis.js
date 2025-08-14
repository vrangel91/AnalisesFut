require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🚀 Testando Análise Avançada...\n');

async function testAdvancedAnalysis() {
  try {
    // Primeiro, buscar uma fixture válida
    console.log('📡 Buscando fixtures de hoje...');
    
    const fixturesResponse = await axios.get('http://localhost:3001/api/fixtures', {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'NS-LIVE-FT'
      }
    });

    if (!fixturesResponse.data.success || !fixturesResponse.data.data || fixturesResponse.data.data.length === 0) {
      console.log('❌ Nenhuma fixture encontrada para hoje');
      return;
    }

    const fixtureId = fixturesResponse.data.data[0].fixture.id;
    console.log(`✅ Fixture encontrada: ${fixtureId}`);
    console.log(`Times: ${fixturesResponse.data.data[0].teams.home.name} vs ${fixturesResponse.data.data[0].teams.away.name}`);

    // Testar análise avançada
    console.log('\n🔍 Testando análise avançada...');
    
    const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`);
    
    if (advancedResponse.data.success) {
      console.log('✅ Análise avançada realizada com sucesso!');
      
      const analysis = advancedResponse.data.data;
      
      console.log('\n📊 RESUMO DA ANÁLISE AVANÇADA:');
      console.log('=====================================');
      
      // Análise de Ataque
      if (analysis.attackAnalysis) {
        console.log('\n⚽ ANÁLISE DE ATAQUE:');
        console.log(`   Casa: ${analysis.attackAnalysis.home.strength} (${analysis.attackAnalysis.home.conversionRate.toFixed(1)}% conversão)`);
        console.log(`   Visitante: ${analysis.attackAnalysis.away.strength} (${analysis.attackAnalysis.away.conversionRate.toFixed(1)}% conversão)`);
        if (analysis.attackAnalysis.comparison.keyInsights.length > 0) {
          console.log('   💡 Insights:', analysis.attackAnalysis.comparison.keyInsights.join(', '));
        }
      }
      
      // Análise de Defesa
      if (analysis.defenseAnalysis) {
        console.log('\n🛡️ ANÁLISE DE DEFESA:');
        console.log(`   Casa: ${analysis.defenseAnalysis.home.strength} (${analysis.defenseAnalysis.home.defensiveEfficiency.toFixed(0)}% eficiência)`);
        console.log(`   Visitante: ${analysis.defenseAnalysis.away.strength} (${analysis.defenseAnalysis.away.defensiveEfficiency.toFixed(0)}% eficiência)`);
        if (analysis.defenseAnalysis.comparison.keyInsights.length > 0) {
          console.log('   💡 Insights:', analysis.defenseAnalysis.comparison.keyInsights.join(', '));
        }
      }
      
      // Análise de Bola Parada
      if (analysis.setPieceAnalysis) {
        console.log('\n⚽ ANÁLISE DE BOLA PARADA:');
        console.log(`   Casa: ${analysis.setPieceAnalysis.home.strength} (${analysis.setPieceAnalysis.home.setPieceEfficiency.toFixed(0)}% eficiência)`);
        console.log(`   Visitante: ${analysis.setPieceAnalysis.away.strength} (${analysis.setPieceAnalysis.away.setPieceEfficiency.toFixed(0)}% eficiência)`);
        if (analysis.setPieceAnalysis.comparison.keyInsights.length > 0) {
          console.log('   💡 Insights:', analysis.setPieceAnalysis.comparison.keyInsights.join(', '));
        }
      }
      
      // Análise de Timing
      if (analysis.timingAnalysis) {
        console.log('\n⏰ ANÁLISE DE TIMING:');
        console.log(`   Casa: ${analysis.timingAnalysis.home.timingPattern}`);
        console.log(`   Visitante: ${analysis.timingAnalysis.away.timingPattern}`);
        if (analysis.timingAnalysis.insights.length > 0) {
          console.log('   💡 Insights:', analysis.timingAnalysis.insights.join(', '));
        }
      }
      
      // Análise de Forma
      if (analysis.formAnalysis) {
        console.log('\n📈 ANÁLISE DE FORMA:');
        console.log(`   Casa: ${analysis.formAnalysis.home.form} (${analysis.formAnalysis.home.trend})`);
        console.log(`   Visitante: ${analysis.formAnalysis.away.form} (${analysis.formAnalysis.away.trend})`);
      }
      
      // Análise H2H
      if (analysis.h2hAnalysis) {
        console.log('\n🤝 ANÁLISE H2H:');
        console.log(`   Total de jogos: ${analysis.h2hAnalysis.totalMatches}`);
        console.log(`   Vitórias casa: ${analysis.h2hAnalysis.homeWins}`);
        console.log(`   Vitórias visitante: ${analysis.h2hAnalysis.awayWins}`);
        console.log(`   Empates: ${analysis.h2hAnalysis.draws}`);
        console.log(`   Média de gols: ${analysis.h2hAnalysis.averageGoals.toFixed(1)}`);
      }
      
      // Análise Over/Under
      if (analysis.overUnderAnalysis) {
        console.log('\n🎯 ANÁLISE OVER/UNDER:');
        console.log(`   Média de gols: ${analysis.overUnderAnalysis.averageGoals.toFixed(1)}`);
        console.log(`   Probabilidade Over 2.5: ${analysis.overUnderAnalysis.over25Probability}%`);
        console.log(`   Probabilidade Under 2.5: ${analysis.overUnderAnalysis.under25Probability}%`);
        console.log(`   Recomendação: ${analysis.overUnderAnalysis.recommendation} (${analysis.overUnderAnalysis.confidence})`);
      }
      
      // Insights de Apostas
      if (analysis.bettingInsights) {
        console.log('\n💰 INSIGHTS DE APOSTAS:');
        console.log(`   Nível de Risco: ${analysis.bettingInsights.riskLevel}`);
        console.log(`   Confiança: ${analysis.bettingInsights.confidence}`);
        if (analysis.bettingInsights.recommendedBets.length > 0) {
          console.log('   🎯 Apostas Recomendadas:', analysis.bettingInsights.recommendedBets.join(', '));
        }
        if (analysis.bettingInsights.keyFactors.length > 0) {
          console.log('   🔑 Fatores Chave:', analysis.bettingInsights.keyFactors.join(', '));
        }
        if (analysis.bettingInsights.avoidBets.length > 0) {
          console.log('   ⚠️ Evitar:', analysis.bettingInsights.avoidBets.join(', '));
        }
      }
      
      // Avaliação de Risco
      if (analysis.riskAssessment) {
        console.log('\n⚠️ AVALIAÇÃO DE RISCO:');
        console.log(`   Score: ${analysis.riskAssessment.score}/100`);
        console.log(`   Nível: ${analysis.riskAssessment.level}`);
        console.log(`   Recomendação: ${analysis.riskAssessment.recommendation}`);
        if (analysis.riskAssessment.factors.length > 0) {
          console.log('   🚨 Fatores de Risco:', analysis.riskAssessment.factors.join(', '));
        }
      }
      
      console.log('\n✅ ANÁLISE AVANÇADA COMPLETA!');
      console.log('=====================================');
      console.log('🎯 Esta análise inclui:');
      console.log('   ✅ Taxa de conversão de ataques');
      console.log('   ✅ Eficiência defensiva');
      console.log('   ✅ Análise de bola parada');
      console.log('   ✅ Padrões de timing');
      console.log('   ✅ Forma recente dos times');
      console.log('   ✅ Histórico H2H');
      console.log('   ✅ Probabilidades Over/Under');
      console.log('   ✅ Insights de apostas');
      console.log('   ✅ Avaliação de risco');
      
    } else {
      console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar análise avançada:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testAdvancedAnalysis();
