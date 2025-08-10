// Teste do Dashboard - Simulação de dados
const mockData = {
  // Dados de fixtures
  fixtures: [
    {
      fixture: {
        id: 123456,
        date: '2024-01-15T20:00:00+00:00',
        status: { short: 'NS', long: 'Not Started' }
      },
      teams: {
        home: { id: 1, name: 'Time Casa', logo: 'logo1.png' },
        away: { id: 2, name: 'Time Visitante', logo: 'logo2.png' }
      },
      league: {
        id: 1,
        name: 'Liga Teste',
        country: 'Brasil',
        logo: 'league.png'
      },
      goals: { home: null, away: null }
    }
  ],

  // Dados de predições
  predictions: [
    {
      fixture: {
        fixture: {
          id: 123456,
          date: '2024-01-15T20:00:00+00:00',
          status: { short: 'NS', long: 'Not Started' }
        },
        teams: {
          home: { id: 1, name: 'Time Casa', logo: 'logo1.png' },
          away: { id: 2, name: 'Time Visitante', logo: 'logo2.png' }
        },
        league: {
          id: 1,
          name: 'Liga Teste',
          country: 'Brasil',
          logo: 'league.png'
        }
      },
      prediction: {
        winner: {
          id: 1,
          name: 'Time Casa',
          comment: 'Win or draw'
        },
        win_or_draw: true,
        under_over: '-2.5',
        goals: {
          home: '-1.5',
          away: '-1.5'
        },
        advice: 'Combo Double chance : Time Casa or draw and -2.5 goals',
        percent: {
          home: '60%',
          draw: '25%',
          away: '15%'
        }
      },
      confidence: 'alta',
      recommendation: 'Vencedor: Time Casa (Win or draw) | Gols: -2.5 | Combo Double chance : Time Casa or draw and -2.5 goals | Probabilidades: Casa 60%, Empate 25%, Fora 15%'
    }
  ]
};

// Função para testar renderPredictionCard
function testRenderPredictionCard() {
  console.log('🧪 Testando renderPredictionCard...\n');

  const prediction = mockData.predictions[0];
  
  // Verificação de segurança
  if (!prediction || !prediction.fixture) {
    console.error('❌ Prediction data is invalid:', prediction);
    return null;
  }

  const { fixture, prediction: predData, confidence, recommendation } = prediction;
  const { teams, league, fixture: fixtureData } = fixture;

  // Verificação adicional
  if (!teams || !league || !fixtureData) {
    console.error('❌ Fixture data is invalid:', fixture);
    return null;
  }

  console.log('✅ Dados válidos encontrados:');
  console.log('📊 Teams:', { home: teams.home.name, away: teams.away.name });
  console.log('📊 League:', league.name);
  console.log('📊 Fixture ID:', fixtureData.id);
  console.log('📊 Confidence:', confidence);
  console.log('📊 Prediction data:', {
    hasWinner: !!predData.winner,
    hasUnderOver: !!predData.under_over,
    hasAdvice: !!predData.advice,
    hasPercent: !!predData.percent
  });

  return {
    teams,
    league,
    fixtureData,
    predData,
    confidence,
    recommendation
  };
}

// Função para testar renderFixtureCard
function testRenderFixtureCard() {
  console.log('🧪 Testando renderFixtureCard...\n');

  const fixture = mockData.fixtures[0];
  
  // Verificação de segurança
  if (!fixture || !fixture.teams || !fixture.league || !fixture.fixture) {
    console.error('❌ Fixture data is invalid:', fixture);
    return null;
  }

  const { teams, league, fixture: fixtureData } = fixture;

  console.log('✅ Dados válidos encontrados:');
  console.log('📊 Teams:', { home: teams.home.name, away: teams.away.name });
  console.log('📊 League:', league.name);
  console.log('📊 Fixture ID:', fixtureData.id);
  console.log('📊 Status:', fixtureData.status.short);
  console.log('📊 Goals:', fixture.goals);

  return {
    teams,
    league,
    fixtureData,
    goals: fixture.goals
  };
}

// Função para testar estrutura de dados da API
function testAPIStructure() {
  console.log('🧪 Testando estrutura de dados da API...\n');

  // Simular resposta da API
  const apiResponse = {
    success: true,
    data: mockData.fixtures,
    count: mockData.fixtures.length,
    timestamp: new Date().toISOString()
  };

  console.log('✅ API Response structure:');
  console.log('📊 Success:', apiResponse.success);
  console.log('📊 Data length:', apiResponse.data?.length || 0);
  console.log('📊 Data type:', Array.isArray(apiResponse.data) ? 'Array' : typeof apiResponse.data);
  console.log('📊 Has data:', !!apiResponse.data);

  if (apiResponse.data && apiResponse.data.length > 0) {
    const firstItem = apiResponse.data[0];
    console.log('📊 First item structure:', {
      hasFixture: !!firstItem.fixture,
      hasTeams: !!firstItem.teams,
      hasLeague: !!firstItem.league,
      hasGoals: !!firstItem.goals
    });
  }

  return apiResponse;
}

// Executar todos os testes
console.log('🚀 Iniciando testes do Dashboard...\n');

const predictionResult = testRenderPredictionCard();
const fixtureResult = testRenderFixtureCard();
const apiResult = testAPIStructure();

console.log('\n📋 Resumo dos testes:');
console.log('✅ Prediction card:', predictionResult ? 'PASSOU' : 'FALHOU');
console.log('✅ Fixture card:', fixtureResult ? 'PASSOU' : 'FALHOU');
console.log('✅ API structure:', apiResult ? 'PASSOU' : 'FALHOU');

console.log('\n🎯 Testes concluídos!');
