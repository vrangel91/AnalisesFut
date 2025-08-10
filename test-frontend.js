// Teste específico para identificar erro de 'result'
const axios = require('axios');

async function testFrontendData() {
  console.log('🧪 Testando dados do frontend...\n');

  try {
    // Buscar dados reais da API
    const [fixturesResponse, predictionsResponse] = await Promise.all([
      axios.get('http://localhost:3001/api/fixtures/today'),
      axios.get('http://localhost:3001/api/predictions/today')
    ]);

    console.log('📊 Fixtures data sample:');
    if (fixturesResponse.data.data && fixturesResponse.data.data.length > 0) {
      const fixture = fixturesResponse.data.data[0];
      console.log('🔍 Fixture structure:', {
        hasFixture: !!fixture.fixture,
        hasTeams: !!fixture.teams,
        hasLeague: !!fixture.league,
        hasGoals: !!fixture.goals,
        fixtureKeys: Object.keys(fixture),
        teamsKeys: fixture.teams ? Object.keys(fixture.teams) : [],
        leagueKeys: fixture.league ? Object.keys(fixture.league) : []
      });
    }

    console.log('\n📊 Predictions data sample:');
    if (predictionsResponse.data.data && predictionsResponse.data.data.length > 0) {
      const prediction = predictionsResponse.data.data[0];
      console.log('🔍 Prediction structure:', {
        hasFixture: !!prediction.fixture,
        hasPrediction: !!prediction.prediction,
        hasConfidence: !!prediction.confidence,
        hasRecommendation: !!prediction.recommendation,
        predictionKeys: Object.keys(prediction),
        fixtureKeys: prediction.fixture ? Object.keys(prediction.fixture) : [],
        predictionDataKeys: prediction.prediction ? Object.keys(prediction.prediction) : []
      });

      // Verificar se há propriedade 'result' em algum lugar
      console.log('\n🔍 Procurando por propriedade "result":');
      const searchForResult = (obj, path = '') => {
        if (obj && typeof obj === 'object') {
          for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            if (key === 'result') {
              console.log(`❌ Encontrado "result" em: ${currentPath} =`, obj[key]);
            }
            if (obj[key] && typeof obj[key] === 'object') {
              searchForResult(obj[key], currentPath);
            }
          }
        }
      };

      searchForResult(prediction);
    }

    // Simular o que o Dashboard faz
    console.log('\n🧪 Simulando processamento do Dashboard:');
    
    const todayFixtures = fixturesResponse.data.data || [];
    const predictions = predictionsResponse.data.data || [];

    console.log('📊 Processando fixtures:', todayFixtures.length);
    todayFixtures.slice(0, 3).forEach((fixture, index) => {
      try {
        // Simular renderFixtureCard
        if (!fixture || !fixture.teams || !fixture.league || !fixture.fixture) {
          console.log(`❌ Fixture ${index} inválido`);
          return;
        }
        console.log(`✅ Fixture ${index} válido:`, fixture.teams.home.name, 'vs', fixture.teams.away.name);
      } catch (error) {
        console.log(`❌ Erro no fixture ${index}:`, error.message);
      }
    });

    console.log('\n📊 Processando predictions:', predictions.length);
    predictions.slice(0, 3).forEach((prediction, index) => {
      try {
        // Simular renderPredictionCard
        if (!prediction || !prediction.fixture) {
          console.log(`❌ Prediction ${index} inválido`);
          return;
        }
        const { fixture, prediction: predData, confidence } = prediction;
        console.log(`✅ Prediction ${index} válido:`, {
          teams: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
          confidence,
          hasPredictionData: !!predData
        });
      } catch (error) {
        console.log(`❌ Erro na prediction ${index}:`, error.message);
      }
    });

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar teste
testFrontendData();
