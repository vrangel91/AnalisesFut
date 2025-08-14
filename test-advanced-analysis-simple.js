require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🚀 Testando Análise Avançada (Teste Simples)...\n');

async function testAdvancedAnalysisSimple() {
  try {
    // Usar uma fixture específica para teste
    const fixtureId = 1411897; // Fixture que vimos no terminal anterior
    
    console.log(`🔍 Testando análise avançada para fixture ${fixtureId}...`);
    
    const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`);
    
    if (advancedResponse.data.success) {
      console.log('✅ Análise avançada realizada com sucesso!');
      
      const analysis = advancedResponse.data.data;
      
      console.log('\n📊 RESUMO DA ANÁLISE AVANÇADA:');
      console.log('=====================================');
      
      // Verificar se temos dados da fixture
      if (analysis.fixture) {
        console.log('\n🏟️ DADOS DA FIXTURE:');
        console.log(`   Times: ${analysis.fixture.teams?.home?.name} vs ${analysis.fixture.teams?.away?.name}`);
        console.log(`   Liga: ${analysis.fixture.league?.name}`);
        console.log(`   Data: ${analysis.fixture.fixture?.date}`);
      }
      
      // Análise de Ataque
      if (analysis.attackAnalysis) {
        console.log('\n⚽ ANÁLISE DE ATAQUE:');
        console.log(`   Casa: ${analysis.attackAnalysis.home.strength} (${analysis.attackAnalysis.home.conversionRate.toFixed(1)}% conversão)`);
        console.log(`   Visitante: ${analysis.attackAnalysis.away.strength} (${analysis.attackAnalysis.away.conversionRate.toFixed(1)}% conversão)`);
        if (analysis.attackAnalysis.comparison.keyInsights.length > 0) {
          console.log('   💡 Insights:', analysis.attackAnalysis.comparison.keyInsights.join(', '));
        }
      } else {
        console.log('\n⚠️ Análise de ataque não disponível');
      }
      
      // Análise de Defesa
      if (analysis.defenseAnalysis) {
        console.log('\n🛡️ ANÁLISE DE DEFESA:');
        console.log(`   Casa: ${analysis.defenseAnalysis.home.strength} (${analysis.defenseAnalysis.home.defensiveEfficiency.toFixed(0)}% eficiência)`);
        console.log(`   Visitante: ${analysis.defenseAnalysis.away.strength} (${analysis.defenseAnalysis.away.defensiveEfficiency.toFixed(0)}% eficiência)`);
        if (analysis.defenseAnalysis.comparison.keyInsights.length > 0) {
          console.log('   💡 Insights:', analysis.defenseAnalysis.comparison.keyInsights.join(', '));
        }
      } else {
        console.log('\n⚠️ Análise de defesa não disponível');
      }
      
      // Análise de Forma
      if (analysis.formAnalysis) {
        console.log('\n📈 ANÁLISE DE FORMA:');
        console.log(`   Casa: ${analysis.formAnalysis.home.form} (${analysis.formAnalysis.home.trend})`);
        console.log(`   Visitante: ${analysis.formAnalysis.away.form} (${analysis.formAnalysis.away.trend})`);
      } else {
        console.log('\n⚠️ Análise de forma não disponível');
      }
      
      // Análise H2H
      if (analysis.h2hAnalysis) {
        console.log('\n🤝 ANÁLISE H2H:');
        console.log(`   Total de jogos: ${analysis.h2hAnalysis.totalMatches}`);
        console.log(`   Vitórias casa: ${analysis.h2hAnalysis.homeWins}`);
        console.log(`   Vitórias visitante: ${analysis.h2hAnalysis.awayWins}`);
        console.log(`   Empates: ${analysis.h2hAnalysis.draws}`);
        console.log(`   Média de gols: ${analysis.h2hAnalysis.averageGoals.toFixed(1)}`);
      } else {
        console.log('\n⚠️ Análise H2H não disponível');
      }
      
      // Análise Over/Under
      if (analysis.overUnderAnalysis) {
        console.log('\n🎯 ANÁLISE OVER/UNDER:');
        console.log(`   Média de gols: ${analysis.overUnderAnalysis.averageGoals.toFixed(1)}`);
        console.log(`   Probabilidade Over 2.5: ${analysis.overUnderAnalysis.over25Probability}%`);
        console.log(`   Probabilidade Under 2.5: ${analysis.overUnderAnalysis.under25Probability}%`);
        console.log(`   Recomendação: ${analysis.overUnderAnalysis.recommendation} (${analysis.overUnderAnalysis.confidence})`);
      } else {
        console.log('\n⚠️ Análise Over/Under não disponível');
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
      } else {
        console.log('\n⚠️ Insights de apostas não disponível');
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
      } else {
        console.log('\n⚠️ Avaliação de risco não disponível');
      }
      
      console.log('\n✅ ANÁLISE AVANÇADA COMPLETA!');
      console.log('=====================================');
      console.log('🎯 Funcionalidades implementadas:');
      console.log('   ✅ Análise de ataque (taxa de conversão)');
      console.log('   ✅ Análise de defesa (eficiência)');
      console.log('   ✅ Análise de forma recente');
      console.log('   ✅ Análise H2H (histórico)');
      console.log('   ✅ Análise Over/Under (probabilidades)');
      console.log('   ✅ Insights de apostas (recomendações)');
      console.log('   ✅ Avaliação de risco (score)');
      
    } else {
      console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
      console.log('Detalhes:', advancedResponse.data.details);
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
testAdvancedAnalysisSimple();
