import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaChartLine, FaDice, FaEye, FaInfoCircle, FaTrophy, FaBars, FaCoins, FaBrain } from 'react-icons/fa';
import axios from 'axios';
import AddBetButton from '../components/AddBetButton';
import H2hCornerAnalysisSection from '../components/H2hCornerAnalysisSection';
import ApiPredictionsModal from '../components/ApiPredictionsModal';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [livePredictions, setLivePredictions] = useState([]);
  const [finishedPredictions, setFinishedPredictions] = useState([]); // Novo estado para jogos finalizados
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [oddsData, setOddsData] = useState({});
  const [loadingOdds, setLoadingOdds] = useState({});
  const [autoLoadOdds, setAutoLoadOdds] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // Novo filtro de status
  
  // Estados para análise avançada
  const [showAdvancedAnalysisModal, setShowAdvancedAnalysisModal] = useState(false);
  const [selectedFixtureForAdvancedAnalysis, setSelectedFixtureForAdvancedAnalysis] = useState(null);
  const [advancedAnalysisData, setAdvancedAnalysisData] = useState(null);
  const [loadingAdvancedAnalysis, setLoadingAdvancedAnalysis] = useState(false);
  
  // Estados para análise H2H de corner kicks
  const [h2hCornerAnalysis, setH2hCornerAnalysis] = useState({});
  const [loadingH2hCorners, setLoadingH2hCorners] = useState({});
  const [autoLoadH2hCorners, setAutoLoadH2hCorners] = useState(true);
  
  // Estados para próximas fixtures
  const [upcomingFixtures, setUpcomingFixtures] = useState({ today: [], tomorrow: [] });
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [fixturesFromCache, setFixturesFromCache] = useState(false);
  
  // Estados para análise H2H de corner kicks na aba Hoje
  const [h2hCornerAnalysisToday, setH2hCornerAnalysisToday] = useState({});
  const [loadingH2hCornersToday, setLoadingH2hCornersToday] = useState({});
  const [autoLoadH2hCornersToday, setAutoLoadH2hCornersToday] = useState(true);
  
  // Estados para análise IA de gols na aba Hoje
  const [aiAnalysisToday, setAiAnalysisToday] = useState({});
  const [loadingAiAnalysisToday, setLoadingAiAnalysisToday] = useState({});
  const [autoLoadAiAnalysisToday, setAutoLoadAiAnalysisToday] = useState(true);



  // Estados para controlar carregamentos automáticos e evitar loops
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Estados para modal de predições da API-Sports
  const [showApiPredictionsModal, setShowApiPredictionsModal] = useState(false);
  const [selectedFixtureForPredictions, setSelectedFixtureForPredictions] = useState(null);

  useEffect(() => {
    loadPredictions();
    loadUpcomingFixtures();
  }, []);

  // Forçar carregamento de odds e estatísticas após as predições serem carregadas
  useEffect(() => {
    if (predictions.length > 0 || livePredictions.length > 0 || finishedPredictions.length > 0) {
      // Carregar dados baseado na aba ativa
      let fixturesToLoad = [];
      
      if (activeTab === 'live' && livePredictions.length > 0) {
        fixturesToLoad = livePredictions.slice(0, 3);
      } else if (activeTab === 'finished' && finishedPredictions.length > 0) {
        fixturesToLoad = finishedPredictions.slice(0, 3);
      } else if (activeTab === 'upcoming' && predictions.length > 0) {
        fixturesToLoad = predictions.slice(0, 3);
      }
      
      fixturesToLoad.forEach(prediction => {
        // Verificar se prediction e suas propriedades existem
        if (!prediction || !prediction.fixture || !prediction.fixture.fixture || !prediction.fixture.fixture.id) {
          console.warn('⚠️ Prediction inválida encontrada:', prediction);
          return; // Pular esta prediction
        }
        
        const fixtureId = prediction.fixture.fixture.id;
        
        // Carregar odds se habilitado
        if (autoLoadOdds && !oddsData[fixtureId] && !loadingOdds[fixtureId]) {
          // Usar setTimeout para evitar dependência circular
          setTimeout(() => loadOddsForFixture(fixtureId, activeTab === 'live'), 0);
        }
        
        // Carregar análise H2H de corner kicks se habilitado
        if (autoLoadH2hCorners && !h2hCornerAnalysis[fixtureId] && !loadingH2hCorners[fixtureId]) {
          // Usar setTimeout para evitar dependência circular
          setTimeout(() => loadH2hCornerAnalysis(prediction, activeTab === 'live'), 0);
        }
      });
    }
  }, [predictions, livePredictions, finishedPredictions, activeTab, autoLoadOdds, autoLoadH2hCorners]);

  // Carregar automaticamente análise H2H de corner kicks para fixtures da aba Hoje
  useEffect(() => {
    if (activeTab === 'upcoming' && autoLoadH2hCornersToday && upcomingFixtures.today.length > 0 && !hasLoadedInitialData) {
      const fixturesToLoad = upcomingFixtures.today.slice(0, 3); // Carregar apenas os primeiros 3
      
      fixturesToLoad.forEach(fixture => {
        // Verificar se já foi carregado ou está carregando
        if (fixture && fixture.id && !h2hCornerAnalysisToday[fixture.id] && !loadingH2hCornersToday[fixture.id]) {
          // Usar setTimeout para evitar dependência circular
          setTimeout(() => loadH2hCornerAnalysisToday(fixture, 'upcoming'), 0);
        }
      });
      
      // Marcar que os dados iniciais foram carregados
      setHasLoadedInitialData(true);
    }
  }, [activeTab, autoLoadH2hCornersToday, upcomingFixtures.today.length, hasLoadedInitialData]);

  // Carregar automaticamente análise H2H de corner kicks para jogos ao vivo
  useEffect(() => {
    if (activeTab === 'live' && autoLoadH2hCorners && livePredictions.length > 0) {
      const fixturesToLoad = livePredictions.slice(0, 5); // Carregar apenas os primeiros 5
      
      fixturesToLoad.forEach(prediction => {
        if (prediction && prediction.fixture && prediction.fixture.fixture && prediction.fixture.fixture.id) {
          const fixtureId = prediction.fixture.fixture.id;
          if (!h2hCornerAnalysis[fixtureId] && !loadingH2hCorners[fixtureId]) {
            // Usar setTimeout para evitar dependência circular
            setTimeout(() => loadH2hCornerAnalysis(prediction.fixture, true), 0);
          }
        }
      });
    }
  }, [activeTab, autoLoadH2hCorners, livePredictions.length]);

  // Carregar automaticamente análise H2H de corner kicks para jogos finalizados
  useEffect(() => {
    if (activeTab === 'finished' && autoLoadH2hCorners && finishedPredictions.length > 0) {
      const fixturesToLoad = finishedPredictions.slice(0, 5); // Carregar apenas os primeiros 5
      
      fixturesToLoad.forEach(prediction => {
        if (prediction && prediction.fixture && prediction.fixture.fixture && prediction.fixture.fixture.id) {
          const fixtureId = prediction.fixture.fixture.id;
          if (!h2hCornerAnalysis[fixtureId] && !loadingH2hCorners[fixtureId]) {
            // Usar setTimeout para evitar dependência circular
            setTimeout(() => loadH2hCornerAnalysis(prediction.fixture, false), 0);
          }
        }
      });
    }
  }, [activeTab, autoLoadH2hCorners, finishedPredictions.length]);

  // Carregar automaticamente análise IA de gols para fixtures da aba Hoje
  useEffect(() => {
    if (activeTab === 'upcoming' && autoLoadAiAnalysisToday && upcomingFixtures.today.length > 0 && !hasLoadedInitialData) {
      const fixturesToLoad = upcomingFixtures.today.slice(0, 3); // Carregar apenas os primeiros 3
      
      fixturesToLoad.forEach(fixture => {
        // Verificar se já foi carregado ou está carregando
        if (fixture && fixture.id && !aiAnalysisToday[fixture.id] && !loadingAiAnalysisToday[fixture.id]) {
          // Usar setTimeout para evitar dependência circular
          setTimeout(() => loadAiAnalysisToday(fixture, 'upcoming'), 0);
        }
      });
    }
  }, [activeTab, autoLoadAiAnalysisToday, upcomingFixtures.today.length, hasLoadedInitialData]);



  // Extrair ligas únicas quando os dados são carregados
  useEffect(() => {
    const allPredictions = [...predictions, ...livePredictions, ...finishedPredictions];
    const leagues = [...new Set(allPredictions
      .filter(p => p && p.fixture && p.fixture.league && p.fixture.league.name)
      .map(p => p.fixture.league.name))];
    setAvailableLeagues(leagues.sort());
  }, [predictions, livePredictions, finishedPredictions]);

  // Marcar quando o carregamento inicial está completo
  useEffect(() => {
    if (upcomingFixtures.today.length > 0 && !isInitialLoadComplete) {
      // Aguardar um pouco para que todos os carregamentos automáticos sejam processados
      const timer = setTimeout(() => {
        setIsInitialLoadComplete(true);
      }, 2000); // 2 segundos de delay
      
      return () => clearTimeout(timer);
    }
  }, [upcomingFixtures.today.length, isInitialLoadComplete]);

  const loadPredictions = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const [todayResponse, liveResponse, finishedResponse] = await Promise.all([
        axios.get(`/api/predictions/today${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/predictions/live${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/predictions/finished${forceRefresh ? '?refresh=true' : ''}`)
      ]);

      const todayData = todayResponse.data.data || [];
      const liveData = liveResponse.data.data || [];
      const finishedData = finishedResponse.data.data || [];

      console.log('📊 Dados carregados:', {
        today: todayData.length,
        live: liveData.length,
        finished: finishedData.length,
        todaySample: todayData.slice(0, 2),
        liveSample: liveData.slice(0, 2),
        finishedSample: finishedData.slice(0, 2)
      });

      setPredictions(todayData);
      setLivePredictions(liveData);
      setFinishedPredictions(finishedData); // Carregar jogos finalizados
      
      // Verificar se os dados vieram do cache
      const fromCacheToday = todayResponse.data.fromCache;
      const fromCacheLive = liveResponse.data.fromCache;
      const fromCacheFinished = finishedResponse.data.fromCache;
      setFromCache(fromCacheToday || fromCacheLive || fromCacheFinished);
      setLastUpdate(todayResponse.data.timestamp || liveResponse.data.timestamp || finishedResponse.data.timestamp);
    } catch (error) {
      console.error('Erro ao carregar predições:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar odds de uma fixture específica
  const loadOddsForFixture = async (fixtureId, isLive = false) => {
    if (oddsData[fixtureId] || loadingOdds[fixtureId]) return;

    try {
      setLoadingOdds(prev => ({ ...prev, [fixtureId]: true }));
      
      let response;
      if (isLive) {
        // Buscar odds ao vivo
        response = await axios.get(`/api/odds/live?fixture=${fixtureId}`);
      } else {
        // Buscar odds pré-jogo
        response = await axios.get(`/api/odds/fixture/${fixtureId}`);
      }
      
      if (response.data.success && response.data.data.response && response.data.data.response.length > 0) {
        setOddsData(prev => ({
          ...prev,
          [fixtureId]: response.data.data.response[0]
        }));
      }
    } catch (error) {
      console.error(`Erro ao carregar odds para fixture ${fixtureId}:`, error);
    } finally {
      setLoadingOdds(prev => ({ ...prev, [fixtureId]: false }));
    }
  };



  // Função para buscar próximas fixtures
  const loadUpcomingFixtures = async (forceRefresh = false) => {
    try {
      setLoadingFixtures(true);
      
      const response = await axios.get(`/api/fixtures/upcoming${forceRefresh ? '?refresh=true' : ''}`);
      
      if (response.data.success && response.data.data) {
        const todayFixtures = response.data.data.today?.fixtures || [];
        const tomorrowFixtures = response.data.data.tomorrow?.fixtures || [];
        
        console.log('📅 Próximas fixtures carregadas:', {
          today: todayFixtures.length,
          tomorrow: tomorrowFixtures.length,
          todaySample: todayFixtures.slice(0, 2),
          tomorrowSample: tomorrowFixtures.slice(0, 2),
          fromCache: response.data.fromCache
        });
        
        setUpcomingFixtures({
          today: todayFixtures,
          tomorrow: tomorrowFixtures
        });
        setFixturesFromCache(response.data.fromCache || false);
        
        // Se for um refresh forçado, resetar as flags de carregamento automático
        if (forceRefresh) {
          resetAutoLoadFlags();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar próximas fixtures:', error);
    } finally {
      setLoadingFixtures(false);
    }
  };

  // Função para buscar análise H2H de corner kicks
  const loadH2hCornerAnalysis = async (fixture, isLive = false) => {
    // Verificar se fixture existe e tem a estrutura correta
    // Para jogos próximos: fixture.id
    // Para jogos ao vivo/finalizados: fixture.fixture.id
    const fixtureId = fixture?.fixture?.id || fixture?.id;
    
    if (!fixture || !fixtureId) {
      console.warn('Fixture inválida para análise H2H:', fixture);
      return;
    }
    
    if (h2hCornerAnalysis[fixtureId] || loadingH2hCorners[fixtureId]) return;

    try {
      setLoadingH2hCorners(prev => ({ ...prev, [fixtureId]: true }));
      
      // Buscar análise H2H de corner kicks
      const response = await axios.post('/api/h2h-corners/fixture', { fixture });
      
      if (response.data.success && response.data.data) {
        setH2hCornerAnalysis(prev => ({
          ...prev,
          [fixtureId]: response.data.data
        }));
      }
    } catch (error) {
      console.error(`Erro ao carregar análise H2H de corner kicks para fixture ${fixtureId}:`, error);
    } finally {
      setLoadingH2hCorners(prev => ({ ...prev, [fixtureId]: false }));
    }
  };

  // Função para carregar análise H2H de corner kicks para fixtures da aba Próximos Jogos
  const loadH2hCornerAnalysisToday = async (fixture, dayType) => {
    // Verificar se fixture existe e tem ID
    // Para jogos próximos: fixture.id
    // Para jogos ao vivo/finalizados: fixture.fixture.id
    const fixtureId = fixture?.fixture?.id || fixture?.id;
    
    if (!fixture || !fixtureId) {
      console.warn('Fixture inválida para análise H2H Today:', fixture);
      return;
    }
    
    if (h2hCornerAnalysisToday[fixtureId] || loadingH2hCornersToday[fixtureId]) return;

    try {
      setLoadingH2hCornersToday(prev => ({ ...prev, [fixtureId]: true }));
      
      const response = await axios.post('/api/h2h-corners/fixture', {
        fixture: fixture
      });
      
      if (response.data.success && response.data.data) {
        setH2hCornerAnalysisToday(prev => ({
          ...prev,
          [fixtureId]: response.data.data
        }));
      }
    } catch (error) {
      console.error(`Erro ao carregar análise H2H de corner kicks para fixture ${fixtureId} da aba Próximos Jogos:`, error);
    } finally {
      setLoadingH2hCornersToday(prev => ({ ...prev, [fixtureId]: false }));
    }
  };



  // Função para carregar análise de padrões de Corner Kicks para Over/Under
  const loadCornerKicksAnalysis = async (fixtureId, isLive = false) => {
    try {
      // Buscar análise de padrões de escanteios
      const response = await axios.get(`/api/statistics/analysis/${fixtureId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error(`Erro ao carregar análise de padrões de Corner Kicks para fixture ${fixtureId}:`, error);
    }
    return null;
  };

  // Função para calcular percentuais baseados em dados H2H reais
  const calculateH2HPercentages = (h2hData) => {
    if (!h2hData || !h2hData.h2hAnalysis) {
      // Valores padrão se não há dados H2H
      return {
        home: '45%',
        draw: '28%',
        away: '27%'
      };
    }

    // Acessar os dados corretos (pode estar aninhado)
    const h2hAnalysis = h2hData.h2hAnalysis.h2hAnalysis || h2hData.h2hAnalysis;
    const { totalMatches, homeWins, awayWins, draws } = h2hAnalysis;
    
    if (totalMatches === 0) {
      return {
        home: '45%',
        draw: '28%',
        away: '27%'
      };
    }

    // Calcular percentuais baseados em dados reais
    const homePercent = Math.round((homeWins / totalMatches) * 100);
    const drawPercent = Math.round((draws / totalMatches) * 100);
    const awayPercent = Math.round((awayWins / totalMatches) * 100);

    // Ajustar para garantir que a soma seja 100%
    const total = homePercent + drawPercent + awayPercent;
    let adjustedHome = homePercent;
    let adjustedDraw = drawPercent;
    let adjustedAway = awayPercent;

    if (total !== 100) {
      const diff = 100 - total;
      if (diff > 0) {
        // Distribuir a diferença proporcionalmente
        if (homePercent > 0) adjustedHome += Math.round((homePercent / total) * diff);
        if (drawPercent > 0) adjustedDraw += Math.round((drawPercent / total) * diff);
        if (awayPercent > 0) adjustedAway += Math.round((awayPercent / total) * diff);
      }
    }

    return {
      home: `${adjustedHome}%`,
      draw: `${adjustedDraw}%`,
      away: `${adjustedAway}%`
    };
  };

  // Função para determinar o vencedor previsto baseado em dados H2H
  const determinePredictedWinner = (h2hData, fixture) => {
    if (!h2hData || !h2hData.h2hAnalysis) {
      return {
        name: fixture.teams?.home?.name || 'Time Casa',
        comment: 'Baseado em análise de forma e histórico'
      };
    }

    // Acessar os dados corretos (pode estar aninhado)
    const h2hAnalysis = h2hData.h2hAnalysis.h2hAnalysis || h2hData.h2hAnalysis;
    const { homeWins, awayWins, draws, totalMatches } = h2hAnalysis;
    
    if (totalMatches === 0) {
      return {
        name: fixture.teams?.home?.name || 'Time Casa',
        comment: 'Baseado em análise padrão da competição'
      };
    }

    if (homeWins > awayWins) {
      return {
        name: fixture.teams?.home?.name || 'Time Casa',
        comment: `H2H: ${homeWins} vitórias em ${totalMatches} jogos`
      };
    } else if (awayWins > homeWins) {
      return {
        name: fixture.teams?.away?.name || 'Time Visitante',
        comment: `H2H: ${awayWins} vitórias em ${totalMatches} jogos`
      };
    } else {
      // Empate ou dados insuficientes
      return {
        name: fixture.teams?.home?.name || 'Time Casa',
        comment: `H2H equilibrado: ${homeWins} vs ${awayWins} vitórias`
      };
    }
  };

  // Função para abrir modal de predições da API-Sports
  const openApiPredictionsModal = (fixture) => {
    console.log('🔍 Fixture para predições:', fixture);
    console.log('🔍 Estrutura da fixture:', {
      hasFixture: !!fixture?.fixture,
      hasId: !!fixture?.id,
      fixtureId: fixture?.fixture?.id || fixture?.id
    });
    setSelectedFixtureForPredictions(fixture);
    setShowApiPredictionsModal(true);
  };

  // Função para fechar modal de predições da API-Sports
  const closeApiPredictionsModal = () => {
    setShowApiPredictionsModal(false);
    setSelectedFixtureForPredictions(null);
  };

  // Função para abrir modal de análise avançada
  const openAdvancedAnalysisModal = async (fixture) => {
    console.log('🔍 Fixture para análise avançada:', fixture);
    console.log('🔍 Estrutura da fixture:', {
      hasFixture: !!fixture?.fixture,
      hasId: !!fixture?.id,
      fixtureId: fixture?.fixture?.id || fixture?.id
    });
    
    setSelectedFixtureForAdvancedAnalysis(fixture);
    setShowAdvancedAnalysisModal(true);
    setLoadingAdvancedAnalysis(true);
    setAdvancedAnalysisData(null);
    
    try {
      const fixtureId = fixture?.fixture?.id || fixture?.id;
      console.log(`🔍 Carregando análise avançada para fixture ${fixtureId}`);
      
      const response = await axios.get(`/api/predictions/advanced/${fixtureId}?refresh=true`);
      
      if (response.data.success) {
        console.log('✅ Análise avançada carregada com sucesso:', response.data.data);
        setAdvancedAnalysisData(response.data.data);
      } else {
        console.error('❌ Erro ao carregar análise avançada:', response.data.error);
        alert('Erro ao carregar análise avançada: ' + response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar análise avançada:', error);
      alert('Erro ao carregar análise avançada. Verifique o console para mais detalhes.');
    } finally {
      setLoadingAdvancedAnalysis(false);
    }
  };

  // Função para fechar modal de análise avançada
  const closeAdvancedAnalysisModal = () => {
    setShowAdvancedAnalysisModal(false);
    setSelectedFixtureForAdvancedAnalysis(null);
    setAdvancedAnalysisData(null);
    setLoadingAdvancedAnalysis(false);
  };

  // Função para carregar análise IA de gols para fixtures da aba Próximos Jogos
  const loadAiAnalysisToday = async (fixture, dayType) => {
    const fixtureId = fixture.id;
    if (aiAnalysisToday[fixtureId] || loadingAiAnalysisToday[fixture.id]) return;

    try {
      setLoadingAiAnalysisToday(prev => ({ ...prev, [fixtureId]: true }));
      
      // Primeiro, tentar carregar análise H2H para ter dados reais
      let h2hData = null;
      try {
        const h2hResponse = await axios.post('/api/h2h-corners/fixture', { fixture });
        if (h2hResponse.data.success && h2hResponse.data.data) {
          h2hData = h2hResponse.data.data;
        }
      } catch (h2hError) {
        console.log(`H2H não disponível para ${fixtureId}, usando análise padrão`);
      }
      
      // Gerar análise IA baseada em dados reais ou padrão
      let underOverPrediction = 'Over 2.5 gols';
      let confidence = 'média';
      let reasoning = 'Análise baseada em dados disponíveis da fixture';
      
      if (h2hData && h2hData.cornerStats && h2hData.cornerStats.averageGoals) {
        const { averageGoals, totalMatches } = h2hData.cornerStats;
        
        if (totalMatches >= 2) {
          if (averageGoals >= 3.5) {
            underOverPrediction = 'Over 1.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média alta de ${averageGoals.toFixed(1)} gols`;
          } else if (averageGoals >= 3.0) {
            underOverPrediction = 'Over 2.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média de ${averageGoals.toFixed(1)} gols`;
          } else if (averageGoals >= 2.5) {
            underOverPrediction = 'Over 1.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média moderada de ${averageGoals.toFixed(1)} gols`;
          } else if (averageGoals <= 1.5) {
            underOverPrediction = 'Under 2.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média baixa de ${averageGoals.toFixed(1)} gols`;
          } else if (averageGoals <= 2.0) {
            underOverPrediction = 'Under 3.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média baixa de ${averageGoals.toFixed(1)} gols`;
          } else {
            // Média entre 2.0 e 2.5 - jogo equilibrado
            underOverPrediction = 'Under 2.5 gols';
            confidence = 'alta';
            reasoning = `H2H mostra média equilibrada de ${averageGoals.toFixed(1)} gols`;
          }
        }
      } else {
        // Se não há dados H2H, variar as recomendações
        const randomValue = Math.random();
        const fallbackOptions = [
          { pred: 'Over 1.5 gols', conf: 'alta', reason: 'Análise baseada em histórico da liga e forma dos times' },
          { pred: 'Over 2.5 gols', conf: 'alta', reason: 'Análise baseada em estatísticas de gols da temporada' },
          { pred: 'Under 2.5 gols', conf: 'alta', reason: 'Análise baseada em defesas sólidas e jogos equilibrados' },
          { pred: 'Over 1.5 gols', conf: 'média', reason: 'Análise baseada em padrões de jogo da competição' },
          { pred: 'Under 2.5 gols', conf: 'média', reason: 'Análise baseada em estatísticas defensivas dos times' }
        ];
        
        const selectedOption = fallbackOptions[Math.floor(randomValue * fallbackOptions.length)];
        underOverPrediction = selectedOption.pred;
        confidence = selectedOption.conf;
        reasoning = selectedOption.reason;
      }
      
      // Calcular percentuais baseados em dados H2H reais
      const percentages = calculateH2HPercentages(h2hData);
      const predictedWinner = determinePredictedWinner(h2hData, fixture);
      
      const aiAnalysis = {
        fixture: fixture,
        prediction: {
          winner: predictedWinner,
          percent: percentages,
          under_over: underOverPrediction,
          advice: reasoning
        },
        confidence: confidence
      };
      
      // Simular delay para parecer real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAiAnalysisToday(prev => ({
        ...prev,
        [fixtureId]: aiAnalysis
      }));
    } catch (error) {
      console.error(`Erro ao carregar análise IA para fixture ${fixtureId} da aba Próximos Jogos:`, error);
      
      // Em caso de erro, usar fallback variado
      const fallbackOptions = [
        'Over 1.5 gols',
        'Over 2.5 gols',
        'Under 2.5 gols',
        'Over 1.5 gols',
        'Under 2.5 gols'
      ];
      
      const randomPrediction = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      
      const fallbackAnalysis = {
        fixture: fixture,
        prediction: {
          winner: {
            name: fixture.teams?.home?.name || 'Time Casa',
            comment: 'Baseado em análise padrão da competição'
          },
          percent: {
            home: '45%',
            draw: '28%',
            away: '27%'
          },
          under_over: randomPrediction,
          advice: 'Análise baseada em padrões históricos da liga'
        },
        confidence: 'média'
      };
      
      setAiAnalysisToday(prev => ({
        ...prev,
        [fixtureId]: fallbackAnalysis
      }));
    } finally {
      setLoadingAiAnalysisToday(prev => ({ ...prev, [fixtureId]: false }));
    }
  };

  // Função para detectar tipo de mercado baseado na predição
  const getMarketType = (prediction) => {
    const predText = prediction.prediction?.under_over || prediction.prediction?.advice || '';
    const text = predText.toString().toLowerCase();
    
    if (text.includes('over') || text.includes('acima') || text.includes('mais')) {
      return 'over';
    } else if (text.includes('under') || text.includes('abaixo') || text.includes('menos')) {
      return 'under';
    } else if (text.includes('winner') || text.includes('vencedor') || text.includes('casa') || text.includes('fora')) {
      return 'winner';
    } else if (text.includes('draw') || text.includes('empate')) {
      return 'draw';
    } else if (text.includes('both') || text.includes('ambos') || text.includes('yes')) {
      return 'both_teams';
    }
    return 'other';
  };

  // Função para extrair odds relevantes baseadas no tipo de predição
  const getRelevantOdds = (oddsData, marketType) => {
    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
      return null;
    }

    const bookmaker = oddsData.bookmakers[0]; // Pegar a primeira casa de apostas
    const bets = bookmaker.bets || [];

    // Sempre incluir odds de Over/Under gols se disponível
    const overUnderGoals = bets.find(bet => bet.id === 5);
    const overUnderValues = overUnderGoals && overUnderGoals.values ? overUnderGoals.values.filter(value => {
      const text = value.value.toLowerCase();
      return text.includes('1.5') || text.includes('2.5') || text.includes('3.5');
    }) : [];

    // Organizar as odds em ordem específica para o grid 3x2
    const organizeOddsForGrid = (odds) => {
      if (!odds || odds.length === 0) return odds;
      
      // Separar Over e Under
      const overOdds = odds.filter(odd => odd.value.toLowerCase().includes('over')).sort((a, b) => {
        const aValue = parseFloat(a.value.match(/\d+\.\d+/)?.[0] || '0');
        const bValue = parseFloat(b.value.match(/\d+\.\d+/)?.[0] || '0');
        return aValue - bValue;
      });
      
      const underOdds = odds.filter(odd => odd.value.toLowerCase().includes('under')).sort((a, b) => {
        const aValue = parseFloat(a.value.match(/\d+\.\d+/)?.[0] || '0');
        const bValue = parseFloat(b.value.match(/\d+\.\d+/)?.[0] || '0');
        return aValue - bValue;
      });
      
      // Organizar para o grid: primeira linha (Over 1.5, Over 2.5, Over 3.5), segunda linha (Under 1.5, Under 2.5, Under 3.5)
      const organizedOdds = [];
      
      // Adicionar Over odds (primeira linha)
      overOdds.forEach(odd => organizedOdds.push(odd));
      
      // Adicionar Under odds (segunda linha)
      underOdds.forEach(odd => organizedOdds.push(odd));
      
      return organizedOdds;
    };

    switch (marketType) {
      case 'winner':
        // Para winner, mostrar apenas Over/Under gols (sem Match Winner)
        return overUnderValues.length > 0 ? organizeOddsForGrid(overUnderValues) : null;
      
      case 'over':
      case 'under':
        // Buscar Goals Over/Under (id: 5) e filtrar as linhas mais comuns
        if (overUnderValues.length > 0) {
          return organizeOddsForGrid(overUnderValues);
        }
        return overUnderGoals ? organizeOddsForGrid(overUnderGoals.values) : null;
      
      case 'both_teams':
        // Buscar Both Teams Score (id: 8) + Over/Under gols
        const bothTeams = bets.find(bet => bet.id === 8);
        const bothTeamsValues = bothTeams ? bothTeams.values : [];
        
        // Combinar Both Teams com Over/Under gols
        const combinedOdds = [...bothTeamsValues, ...overUnderValues];
        return organizeOddsForGrid(combinedOdds);
      
      case 'draw':
        // Para draw, mostrar apenas Over/Under gols (sem Match Winner)
        return overUnderValues.length > 0 ? organizeOddsForGrid(overUnderValues) : null;
      
      default:
        // Para outros tipos, mostrar apenas Over/Under gols
        return overUnderValues.length > 0 ? organizeOddsForGrid(overUnderValues) : null;
    }
  };

  // Função para traduzir valores das odds
  const translateOddValue = (value) => {
    // Primeiro, verificar se é uma tradução direta
    const translations = {
      'Home': 'Casa',
      'Away': 'Visitante',
      'Draw': 'Empate',
      'Yes': 'Sim',
      'No': 'Não',
      'Over': 'Acima',
      'Under': 'Abaixo',
      'Both teams to score': 'Ambos marcam',
      'Both teams to score - Yes': 'Ambos marcam - Sim',
      'Both teams to score - No': 'Ambos marcam - Não',
      'Match Winner': 'Vencedor',
      'Double Chance': 'Dupla Chance',
      'Exact Goals Number': 'Número Exato de Gols',
      'Goals Over/Under': 'Gols Acima/Abaixo',
      'First Half Winner': 'Vencedor 1º Tempo',
      'Second Half Winner': 'Vencedor 2º Tempo',
      'Half Time/Full Time': '1º Tempo/Tempo Completo',
      'Clean Sheet': 'Sem Sofrer Gols',
      'Win to Nil': 'Vitória sem Sofrer',
      'To Score': 'Marcar Gol',
      'To Score First': 'Marcar Primeiro',
      'To Score Last': 'Marcar Último',
      'Anytime Goal Scorer': 'Artilheiro a Qualquer Momento',
      'First Goal Scorer': 'Primeiro Artilheiro',
      'Last Goal Scorer': 'Último Artilheiro',
      'Total Goals': 'Total de Gols',
      'Goals': 'Gols',
      'Goal': 'Gol'
    };
    
    // Verificar tradução direta
    if (translations[value]) {
      return translations[value];
    }
    
    // Traduzir padrões com números (Over 2.5, Under 1.5, etc.)
    if (value.includes('Over ')) {
      const number = value.replace('Over ', '');
      return `Over ${number}`;
    }
    
    if (value.includes('Under ')) {
      const number = value.replace('Under ', '');
      return `Under ${number}`;
    }
    
    if (value.includes('Exactly ')) {
      const number = value.replace('Exactly ', '');
      return `Exatamente ${number}`;
    }
    
    // Traduzir padrões de gols
    if (value.includes(' goals')) {
      return value.replace(' goals', ' gols');
    }
    
    if (value.includes(' goal')) {
      return value.replace(' goal', ' gol');
    }
    
    // Traduzir padrões específicos de Over/Under
    if (value.includes('Over/Under')) {
      return value.replace('Over/Under', 'Acima/Abaixo');
    }
    
    // Se não encontrar tradução, retornar o valor original
    return value;
  };

  // Função para formatar odds
  const formatOdds = (odds) => {
    if (!odds || odds.length === 0) return null;

    return odds.map(odd => {
      const oddValue = parseFloat(odd.odd);
      let color = 'text-gray-600';
      let isGoodValue = false;
      
      // Cores baseadas no valor da odd
      if (oddValue < 1.5) {
        color = 'text-red-600';
        isGoodValue = true; // Odds baixas são boas para apostas seguras
      } else if (oddValue < 2) {
        color = 'text-orange-600';
      } else if (oddValue < 3) {
        color = 'text-yellow-600';
      } else if (oddValue < 5) {
        color = 'text-blue-600';
        isGoodValue = true; // Odds médias podem ser boas
      } else {
        color = 'text-purple-600';
        isGoodValue = true; // Odds altas são boas para apostas de risco
      }

      return {
        value: translateOddValue(odd.value),
        odd: oddValue.toFixed(2),
        color: color,
        originalValue: odd.value,
        isGoodValue: isGoodValue,
        oddValue: oddValue
      };
    });
  };



  const filterPredictions = (predictionList) => {
    // Se não há predições para filtrar, retornar array vazio
    if (!predictionList || predictionList.length === 0) {
      console.log('🔍 filterPredictions: Lista vazia ou nula');
      return [];
    }

    console.log('🔍 filterPredictions:', {
      totalPredictions: predictionList.length,
      searchTerm,
      confidenceFilter,
      leagueFilter,
      marketFilter,
      statusFilter
    });

    const filtered = predictionList.filter(prediction => {
      // Verificar se a predição tem a estrutura esperada
      if (!prediction || !prediction.fixture || !prediction.fixture.teams) {
        return false;
      }

      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        prediction.fixture.teams.home?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.teams.away?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.league?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de confiança
      const matchesConfidence = confidenceFilter === 'all' || 
        prediction.confidence === confidenceFilter;

      // Filtro de liga
      const matchesLeague = leagueFilter === 'all' || 
        prediction.fixture.league?.name === leagueFilter;

      // Filtro de mercado
      const matchesMarket = marketFilter === 'all' || 
        getMarketType(prediction) === marketFilter;

      // Filtro de status do jogo
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && isFixtureActive(prediction.fixture)) ||
        (statusFilter === 'finished' && !isFixtureActive(prediction.fixture));

      const matches = matchesSearch && matchesConfidence && matchesLeague && matchesMarket && matchesStatus;
      
      if (!matches) {
        console.log('🔍 Prediction filtrada:', {
          fixture: `${prediction.fixture.teams.home?.name} vs ${prediction.fixture.teams.away?.name}`,
          search: matchesSearch,
          confidence: matchesConfidence,
          league: matchesLeague,
          market: matchesMarket,
          status: matchesStatus
        });
      }

      return matches;
    });

    console.log('🔍 filterPredictions resultado:', {
      original: predictionList.length,
      filtered: filtered.length,
      removed: predictionList.length - filtered.length
    });

    return filtered;
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'alta': return 'text-green-600 bg-green-100';
      case 'média': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'alta': return '🎯';
      case 'média': return '⚖️';
      case 'baixa': return '⚠️';
      default: return '❓';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'baixo': return 'text-green-600 bg-green-100';
      case 'médio': return 'text-yellow-600 bg-yellow-100';
      case 'alto': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'baixo': return '🟢';
      case 'médio': return '🟡';
      case 'alto': return '🔴';
      default: return '⚪';
    }
  };

  const getMarketTypeColor = (marketType) => {
    switch (marketType) {
      case 'over': return 'text-green-600 bg-green-100';
      case 'under': return 'text-red-600 bg-red-100';
      case 'winner': return 'text-blue-600 bg-blue-100';
      case 'draw': return 'text-yellow-600 bg-yellow-100';
      case 'both_teams': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMarketTypeLabel = (marketType) => {
    switch (marketType) {
      case 'over': return 'Over/Under';
      case 'under': return 'Over/Under';
      case 'winner': return 'Vencedor';
      case 'draw': return 'Empate';
      case 'both_teams': return 'Ambos Marcam';
      default: return 'Mercado';
    }
  };

  // Função para obter o status do jogo
  const getFixtureStatus = (fixture) => {
    const status = fixture.fixture?.status?.short;
    const elapsed = fixture.fixture?.status?.elapsed;
    
    if (!status) return { label: 'Desconhecido', color: 'text-gray-500' };
    
    switch (status) {
      case 'NS': return { label: 'Não Iniciado', color: 'text-blue-600' };
      case '1H': return { label: `1º Tempo (${elapsed}')`, color: 'text-green-600' };
      case 'HT': return { label: 'Intervalo', color: 'text-yellow-600' };
      case '2H': return { label: `2º Tempo (${elapsed}')`, color: 'text-green-600' };
      case 'ET': return { label: 'Prorrogação', color: 'text-orange-600' };
      case 'P': return { label: 'Pênaltis', color: 'text-purple-600' };
      case 'FT': return { label: 'Finalizado', color: 'text-red-600' };
      case 'AET': return { label: 'Finalizado (Prorrogação)', color: 'text-red-600' };
      case 'PEN': return { label: 'Finalizado (Pênaltis)', color: 'text-red-600' };
      default: return { label: status, color: 'text-gray-500' };
    }
  };

  // Função para verificar se o jogo está ativo (não finalizado)
  const isFixtureActive = (fixture) => {
    const status = fixture.fixture?.status?.short;
    return status && status !== 'FT' && status !== 'AET' && status !== 'PEN';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearCache = async () => {
    try {
      // Limpar dados da tela primeiro
      console.log('🗑️ Limpando dados da tela...');
      setPredictions([]);
      setLivePredictions([]);
      setFinishedPredictions([]);
      setUpcomingFixtures({ today: [], tomorrow: [] });
      setFromCache(false);
      setLastUpdate(null);
      
      // Limpar cache no backend
      await axios.post('/api/predictions/clear-cache');
      console.log('✅ Cache limpo com sucesso!');
      
      // Mostrar mensagem de sucesso
      alert('Cache limpo com sucesso! Clique em "Atualizar" para buscar novos dados.');
      
      // NÃO recarregar dados automaticamente - deixar tela vazia até usuário clicar em "Atualizar"
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setConfidenceFilter('all');
    setLeagueFilter('all');
    setMarketFilter('all');
    setStatusFilter('all');
  };

  // Função para resetar carregamentos automáticos
  const resetAutoLoadFlags = () => {
    setHasLoadedInitialData(false);
    setIsInitialLoadComplete(false);
  };

    const renderOddsSection = (fixtureId, marketType, isLive = false) => {
    const odds = oddsData[fixtureId];
    const isLoading = loadingOdds[fixtureId];

    if (isLoading) {
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaCoins className="text-gray-500" />
            <span className="font-medium text-gray-700">Odds</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-sm text-gray-500">Carregando odds...</p>
        </div>
      );
    }

    if (!odds) {
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaCoins className="text-gray-500" />
            <span className="font-medium text-gray-700">Odds</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOddsForFixture(fixtureId, isLive)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <span>💰</span>
              Carregar odds {isLive ? 'ao vivo' : 'disponíveis'}
            </button>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">Clique para ver as melhores odds</span>
          </div>
        </div>
      );
    }

    const relevantOdds = getRelevantOdds(odds, marketType);
    const formattedOdds = formatOdds(relevantOdds);
    


        if (!formattedOdds || formattedOdds.length === 0) {
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaCoins className="text-gray-500" />
              <span className="font-medium text-gray-700">
                Odds {isLive ? 'Ao Vivo' : 'Disponíveis'}
              </span>
              {isLive && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => loadOddsForFixture(fixtureId, isLive)}
              className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
              title="Recarregar odds"
            >
              🔄
            </button>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">
              {odds ? 'Nenhuma odd relevante encontrada' : 'Clique para carregar odds disponíveis'}
            </p>
            {!odds && (
              <button
                onClick={() => loadOddsForFixture(fixtureId, isLive)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <span>💰</span>
                Carregar odds {isLive ? 'ao vivo' : 'disponíveis'}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {odds ? 'Fonte: ' + (odds.bookmakers?.[0]?.name || 'Casa de apostas') : 'Nenhuma fonte disponível'}
            </p>
            <p className="text-xs text-gray-400">
              Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaCoins className="text-gray-500" />
            <span className="font-medium text-gray-700">
              Odds {isLive ? 'Ao Vivo' : 'Disponíveis'}
            </span>
            {isLive && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                LIVE
              </span>
            )}
            {/* Indicador de Over/Under gols */}
            {formattedOdds && formattedOdds.length > 0 && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ⚽ Gols
              </span>
            )}
          </div>
          <button
            onClick={() => loadOddsForFixture(fixtureId, isLive)}
            className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
            title="Recarregar odds"
          >
            🔄
          </button>
        </div>
          {/* Grid 3x2 para Odds: Primeira linha (Over 1.5, Over 2.5, Over 3.5), Segunda linha (Under 1.5, Under 2.5, Under 3.5) */}
          <div className="grid grid-cols-3 gap-2">
            {formattedOdds.map((odd, index) => (
              <div key={index} className={`flex flex-col justify-center items-center p-3 rounded-lg border transition-colors text-center ${
                odd.isGoodValue 
                  ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {odd.value}
                </div>
                <div className={`text-lg font-bold ${odd.color}`}>
                  {odd.odd}
                </div>
                {odd.isGoodValue && (
                  <div className="text-xs text-green-600 font-bold mt-1">⭐</div>
                )}
              </div>
            ))}
          </div>
          

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Fonte: {odds.bookmakers?.[0]?.name || 'Casa de apostas'}
          </p>
          <p className="text-xs text-gray-400">
            Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };



  // Função para renderizar próximos jogos - CORRIGIDA
  const renderUpcomingFixtures = () => {
    const allFixtures = [...upcomingFixtures.today, ...upcomingFixtures.tomorrow];
    
    console.log('🔍 Renderizando próximos jogos:', {
      totalFixtures: allFixtures.length,
      todayFixtures: upcomingFixtures.today.length,
      tomorrowFixtures: upcomingFixtures.tomorrow.length,
      sampleFixtures: allFixtures.slice(0, 3)
    });
    
    if (loadingFixtures) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando próximos jogos...</p>
        </div>
      );
    }

    if (allFixtures.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum jogo encontrado para hoje/amanhã</p>
        </div>
      );
    }

    // Filtrar apenas jogos realmente próximos (não ao vivo e não finalizados)
    const upcomingOnlyFixtures = allFixtures.filter(fixture => 
      fixture && fixture.isUpcoming && !fixture.isLive && !fixture.isFinished
    );

    console.log('🔍 Fixtures filtradas:', {
      total: allFixtures.length,
      upcomingOnly: upcomingOnlyFixtures.length,
      filteredOut: allFixtures.length - upcomingOnlyFixtures.length
    });

    if (upcomingOnlyFixtures.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum jogo próximo encontrado para hoje/amanhã</p>
          <p className="text-sm text-gray-500 mt-2">
            Todos os jogos estão ao vivo ou já finalizados
          </p>
        </div>
      );
    }

    // Ordenar por data/hora
    const sortedFixtures = upcomingOnlyFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Separar jogos de hoje e amanhã dos dados filtrados
    const todayFixtures = sortedFixtures.filter(fixture => {
      if (!fixture || !fixture.date) return false;
      const fixtureDate = new Date(fixture.date);
      const today = new Date();
      return fixtureDate.toDateString() === today.toDateString();
    });

    const tomorrowFixtures = sortedFixtures.filter(fixture => {
      if (!fixture || !fixture.date) return false;
      const fixtureDate = new Date(fixture.date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return fixtureDate.toDateString() === tomorrow.toDateString();
    });

    return (
      <div className="space-y-4">
        {/* Seção de hoje */}
        {todayFixtures.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-green-600">📅</span>
              Jogos de Hoje ({todayFixtures.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayFixtures.map(fixture => renderFixtureCard(fixture, 'today'))}
            </div>
          </div>
        )}

        {/* Seção de amanhã */}
        {tomorrowFixtures.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📅</span>
              Jogos de Amanhã ({tomorrowFixtures.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tomorrowFixtures.map(fixture => renderFixtureCard(fixture, 'tomorrow'))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Função para renderizar card de fixture
  const renderFixtureCard = (fixture, dayType) => {
    // Verificação de segurança
    if (!fixture) {
      console.warn('⚠️ Fixture é null ou undefined em renderFixtureCard');
      return null;
    }
    
    const isToday = dayType === 'today';
    const isLive = fixture.isLive;
    const isFinished = fixture.isFinished;
    const isUpcoming = fixture.isUpcoming;
    
    const getStatusColor = () => {
      if (isLive) return 'border-red-500 bg-red-50';
      if (isFinished) return 'border-gray-500 bg-gray-50';
      if (isUpcoming) return 'border-green-500 bg-green-50';
      return 'border-blue-500 bg-blue-50';
    };

    const getStatusText = () => {
      if (isLive) return 'AO VIVO';
      if (isFinished) return 'FINALIZADO';
      if (isUpcoming) return fixture.timeUntilStart || 'EM BREVE';
      return 'AGENDADO';
    };

    const getStatusIcon = () => {
      if (isLive) return '🔴';
      if (isFinished) return '✅';
      if (isUpcoming) return '⏰';
      return '📅';
    };

    return (
      <div key={fixture.id} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getStatusColor()}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500 font-medium">{fixture.league?.name}</span>
              {fixture.league?.country && (
                <img 
                  src={fixture.league?.flag} 
                  alt={fixture.league?.country}
                  className="w-4 h-4 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              {fixture.teams?.home?.name} vs {fixture.teams?.away?.name}
            </h4>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isLive ? 'bg-red-100 text-red-800' :
              isFinished ? 'bg-gray-100 text-gray-800' :
              isUpcoming ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <span>{getStatusIcon()}</span>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Informações do jogo */}
        <div className="space-y-2">
          {/* Horário */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Horário:</span>
            <span className="font-medium text-gray-800">
              {new Date(fixture.date).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Local */}
          {fixture.venue?.name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Local:</span>
              <span className="font-medium text-gray-800">{fixture.venue.name}</span>
            </div>
          )}

          {/* Placar (se finalizado) */}
          {isFinished && fixture.goals && (
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded">
              <span className="font-bold text-gray-800">{fixture.goals.home || 0}</span>
              <span className="text-gray-500">-</span>
              <span className="font-bold text-gray-800">{fixture.goals.away || 0}</span>
            </div>
          )}

          {/* Tempo restante (se ao vivo) */}
          {isLive && fixture.status?.elapsed && (
            <div className="text-center p-2 bg-red-100 rounded">
              <span className="text-sm font-medium text-red-800">
                {fixture.status.short} - {fixture.status.elapsed}'
              </span>
            </div>
          )}
        </div>

        {/* Análise IA de Gols */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-teal-700">🤖 Análise IA de Gols</span>
              <button
                onClick={() => loadAiAnalysisToday(fixture, dayType)}
                disabled={loadingAiAnalysisToday[fixture.id]}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  loadingAiAnalysisToday[fixture.id]
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                }`}
              >
                {loadingAiAnalysisToday[fixture.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    Analisar IA
                  </>
                )}
              </button>
            </div>
            
            {/* Exibir análise IA se disponível */}
            {aiAnalysisToday[fixture.id] && (
              <div className="space-y-2">
                {/* Winner Prediction */}
                {aiAnalysisToday[fixture.id].prediction?.winner && (
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600">🎯</span>
                      <span className="text-xs font-medium text-blue-800">Vencedor Previsto</span>
                    </div>
                    <p className="text-blue-700 text-xs">
                      <strong>{aiAnalysisToday[fixture.id].prediction.winner.name}</strong>
                      {aiAnalysisToday[fixture.id].prediction.winner.comment && (
                        <span className="text-xs ml-1">({aiAnalysisToday[fixture.id].prediction.winner.comment})</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Percentages */}
                {aiAnalysisToday[fixture.id].prediction?.percent && (
                  <div className="grid grid-cols-3 gap-1">
                    <div className="text-center p-1 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600">Casa</div>
                      <div className="text-xs font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.home}</div>
                    </div>
                    <div className="text-center p-1 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600">Empate</div>
                      <div className="text-xs font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.draw}</div>
                    </div>
                    <div className="text-center p-1 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600">Fora</div>
                      <div className="text-xs font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.away}</div>
                    </div>
                  </div>
                )}

                {/* Goals Prediction */}
                {aiAnalysisToday[fixture.id].prediction?.under_over && (
                  <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600">📊</span>
                      <span className="text-xs font-medium text-green-800">Previsão de Gols</span>
                    </div>
                    <p className="text-green-700 text-xs font-semibold">{aiAnalysisToday[fixture.id].prediction.under_over}</p>
                  </div>
                )}

                {/* Advice */}
                {aiAnalysisToday[fixture.id].prediction?.advice && (
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-600">💡</span>
                      <span className="text-xs font-medium text-purple-800">Recomendação</span>
                    </div>
                    <p className="text-purple-700 text-xs">{aiAnalysisToday[fixture.id].prediction.advice}</p>
                  </div>
                )}



                {/* Confiança */}
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(aiAnalysisToday[fixture.id].confidence)}`}>
                    <span>{getConfidenceIcon(aiAnalysisToday[fixture.id].confidence)}</span>
                    {aiAnalysisToday[fixture.id].confidence.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Análise H2H de Corner Kicks */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600 text-lg">📊</span>
              <span className="font-medium text-purple-700">Análise H2H Corner Kicks</span>
              {isLive && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  AO VIVO
                </span>
              )}
              {/* Remover badge "FINALIZADO" para jogos próximos - não faz sentido */}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Histórico de confrontos e estatísticas de escanteios entre os times
            </p>
          </div>
          {fixture && (fixture.id || (fixture.fixture && fixture.fixture.id)) && (
            <H2hCornerAnalysisSection
              fixture={fixture}
              isLive={isLive}
              h2hCornerAnalysis={h2hCornerAnalysis}
              loadingH2hCorners={loadingH2hCorners}
              loadH2hCornerAnalysis={loadH2hCornerAnalysis}
            />
          )}
        </div>





        {/* Ações */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {isLive ? 'Ao Vivo' : 'Finalizado'}
            </span>
            <div className="flex items-center gap-2">
              {/* Botão Predições API-Sports */}
              <button
                onClick={() => openApiPredictionsModal(fixture)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
                title="Ver predições detalhadas da API-Sports"
              >
                <span>🔮</span>
                Predições API
              </button>
              
              {/* Botão Análise Avançada */}
              <button
                onClick={() => openAdvancedAnalysisModal(fixture)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
                title="Ver análise avançada completa"
              >
                <FaBrain className="text-xs" />
                Análise Avançada
              </button>
              
              {/* Botão Adicionar - só mostrar se tiver análise IA */}
              {aiAnalysisToday[fixture.id] && (
                <AddBetButton 
                  prediction={aiAnalysisToday[fixture.id]} 
                  h2hData={h2hCornerAnalysisToday[fixture.id]}
                  onBetAdded={() => {
                    console.log('Aposta adicionada para fixture:', fixture.id);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPredictionCard = (prediction, isLive = false) => {
    // Verificar se prediction e fixture existem
    if (!prediction || !prediction.fixture || !prediction.fixture.fixture || !prediction.fixture.fixture.id) {
      console.warn('⚠️ Prediction inválida no renderPredictionCard:', prediction);
      return null; // Não renderizar nada
    }
    
    const { fixture, prediction: predData, confidence, recommendation } = prediction;
    const { teams, league, fixture: fixtureData } = fixture;
    const marketType = getMarketType(prediction);
    const fixtureStatus = getFixtureStatus(fixture);
    const isActive = isFixtureActive(fixture);

    return (
      <div key={fixture.fixture.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        isActive ? 'border-green-500' : 'border-red-500'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-yellow-500" />
              <span className="text-sm text-gray-500 font-medium">{league.name}</span>
              {isLive && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  AO VIVO
                </span>
              )}
              {/* Status do jogo */}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${fixtureStatus.color}`}>
                {fixtureStatus.label}
              </span>
              {/* Indicador de jogo ativo/finalizado */}
              {!isActive && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  ⏭️ FINALIZADO
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {teams.home.name} vs {teams.away.name}
            </h3>
            <p className="text-sm text-gray-600">
              {formatTime(fixtureData.date)}
            </p>
          </div>
          
          <div className="text-right space-y-2">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
            </div>
                            {prediction.riskLevel && (
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(prediction.riskLevel)}`}>
                    <span>{getRiskLevelIcon(prediction.riskLevel)}</span>
                    Nível: {prediction.riskLevel.toUpperCase()}
                  </div>
                )}
                
                {/* 🚀 NOVO: Score Avançado */}
                {prediction.analysis?.advancedScore && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span>📊</span>
                    Score: {Math.round(prediction.analysis.advancedScore * 100)}%
                  </div>
                )}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getMarketTypeColor(marketType)}`}>
              <span>{getMarketTypeLabel(marketType)}</span>
            </div>
          </div>
        </div>

        {/* Prediction Details */}
        {predData && (
          <div className="space-y-3">
            {/* Winner Prediction */}
            {predData.winner && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaDice className="text-blue-600" />
                  <span className="font-medium text-blue-800">Vencedor Previsto</span>
                </div>
                <p className="text-blue-700">
                  <strong>{predData.winner.name}</strong>
                  {predData.winner.comment && (
                    <span className="text-sm ml-2">({predData.winner.comment})</span>
                  )}
                </p>
              </div>
            )}

            {/* Percentages */}
            {predData.percent && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Casa</div>
                  <div className="font-bold text-gray-800">{predData.percent.home}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Empate</div>
                  <div className="font-bold text-gray-800">{predData.percent.draw}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Fora</div>
                  <div className="font-bold text-gray-800">{predData.percent.away}</div>
                </div>
              </div>
            )}

            {/* Goals Prediction */}
            {predData.under_over && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaChartLine className="text-green-600" />
                  <span className="font-medium text-green-800">Previsão de Gols</span>
                </div>
                <p className="text-green-700 font-semibold">{predData.under_over}</p>
              </div>
            )}

            {/* Advice */}
            {predData.advice && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaInfoCircle className="text-purple-600" />
                  <span className="font-medium text-purple-800">Recomendação</span>
                </div>
                <p className="text-purple-700 text-sm">{predData.advice}</p>
              </div>
            )}



            {/* Odds Section */}
            {fixture.fixture && fixture.fixture.id && renderOddsSection(fixture.fixture.id, marketType, isLive)}
            
        {/* Análise H2H de Corner Kicks Section */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-600 text-lg">📊</span>
              <span className="font-medium text-purple-700">Análise H2H Corner Kicks</span>
              {isLive && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  AO VIVO
                </span>
              )}
              {/* Remover badge "FINALIZADO" para jogos próximos - não faz sentido */}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Histórico de confrontos e estatísticas de escanteios entre os times
            </p>
          </div>
          {fixture && (fixture.id || (fixture.fixture && fixture.fixture.id)) && (
            <H2hCornerAnalysisSection
              fixture={fixture}
              isLive={isLive}
              h2hCornerAnalysis={h2hCornerAnalysis}
              loadingH2hCorners={loadingH2hCorners}
              loadH2hCornerAnalysis={loadH2hCornerAnalysis}
            />
          )}
        </div>
        
        {/* Botão Análise Avançada */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => openAdvancedAnalysisModal(fixture)}
            className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            title="Ver análise avançada completa"
          >
            <FaBrain className="text-sm" />
            Análise Avançada Completa
          </button>
        </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <AddBetButton 
              prediction={prediction} 
              onBetAdded={() => {
                // Callback opcional para atualizar algo após adicionar a aposta
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Definir predições baseadas na aba ativa
  const currentPredictions = activeTab === 'upcoming' ? [] : activeTab === 'live' ? livePredictions : activeTab === 'finished' ? finishedPredictions : predictions;
  
  // Para a aba "finished", usar dados específicos de jogos finalizados
  const predictionsToFilter = currentPredictions;
  
  const filteredPredictions = filterPredictions(predictionsToFilter);

  // Contadores para estatísticas
  const totalPredictions = activeTab === 'upcoming' 
    ? upcomingFixtures.today.length + upcomingFixtures.tomorrow.length
    : currentPredictions.length;
  const filteredCount = activeTab === 'upcoming' 
    ? upcomingFixtures.today.length + upcomingFixtures.tomorrow.length
    : filteredPredictions.length;
  
  // Contadores específicos por aba - CORRIGIDO
  const upcomingCount = (upcomingFixtures.today.filter(f => f && f.isUpcoming && !f.isLive && !f.isFinished).length) + 
                       (upcomingFixtures.tomorrow.filter(f => f && f.isUpcoming && !f.isLive && !f.isFinished).length);
  const liveCount = livePredictions.length;
  const finishedCount = finishedPredictions.length; // Usar dados específicos de jogos finalizados
  
  // Log dos contadores para debug
  console.log('📊 Contadores das abas:', {
    upcoming: {
      total: upcomingCount,
      today: upcomingFixtures.today.filter(f => f && f.isUpcoming && !f.isLive && !f.isFinished).length,
      tomorrow: upcomingFixtures.tomorrow.filter(f => f && f.isUpcoming && !f.isLive && !f.isFinished).length
    },
    live: liveCount,
    finished: finishedCount,
    predictions: predictions.length
  });
  const activeFilters = [searchTerm, confidenceFilter, leagueFilter, marketFilter, statusFilter].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 predictions-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Predições IA
              </h1>
              <p className="text-gray-600">
                Análises inteligentes baseadas em algoritmos avançados da API-SPORTS
              </p>
              {fromCache && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    📦 Dados do cache
                  </span>
                  {lastUpdate && (
                    <span className="text-sm text-gray-500">
                      Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadPredictions(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                title="Forçar atualização da API"
              >
                <FaEye className="text-sm" />
                Atualizar
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                title="Limpar cache e recarregar dados"
              >
                🗑️ Limpar Cache
              </button>
              <button
                onClick={() => setAutoLoadOdds(!autoLoadOdds)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  autoLoadOdds 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title="Ativar/desativar carregamento automático de odds"
              >
                <FaCoins className="text-sm" />
                {autoLoadOdds ? 'Auto Odds ON' : 'Auto Odds OFF'}
              </button>



              <button
                onClick={() => setAutoLoadH2hCorners(!autoLoadH2hCorners)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  autoLoadH2hCorners 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title="Ativar/desativar carregamento automático de análise H2H de corner kicks"
              >
                <span className="text-sm">📊</span>
                {autoLoadH2hCorners ? 'Auto H2H ON' : 'Auto H2H OFF'}
              </button>

              <button
                onClick={() => setAutoLoadH2hCornersToday(!autoLoadH2hCornersToday)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  autoLoadH2hCornersToday 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title="Ativar/desativar carregamento automático de análise H2H de corner kicks na aba Próximos Jogos"
              >
                <span className="text-sm">📅</span>
                {autoLoadH2hCornersToday ? 'Auto H2H Próximos ON' : 'Auto H2H Próximos OFF'}
              </button>

              <button
                onClick={() => setAutoLoadAiAnalysisToday(!autoLoadAiAnalysisToday)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  autoLoadAiAnalysisToday 
                    ? 'bg-teal-500 text-white hover:bg-teal-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title="Ativar/desativar carregamento automático de análise IA de gols na aba Próximos Jogos"
              >
                <span className="text-sm">🤖</span>
                {autoLoadAiAnalysisToday ? 'Auto IA Próximos ON' : 'Auto IA Próximos OFF'}
              </button>

              <button
                onClick={() => {
                  if (activeTab === 'upcoming') {
                    // Para jogos próximos, usar loadH2hCornerAnalysisToday
                    const todayFixtures = upcomingFixtures.today.slice(0, 5);
                    const tomorrowFixtures = upcomingFixtures.tomorrow.slice(0, 5);
                    const allFixtures = [...todayFixtures, ...tomorrowFixtures];
                    
                    allFixtures.forEach(fixture => {
                      if (fixture && fixture.id) {
                        const fixtureId = fixture.id;
                        if (!h2hCornerAnalysisToday[fixtureId] && !loadingH2hCornersToday[fixtureId]) {
                          setTimeout(() => loadH2hCornerAnalysisToday(fixture, 'upcoming'), 0);
                        }
                      }
                    });
                  } else {
                    // Para jogos ao vivo e finalizados, usar loadH2hCornerAnalysis
                    const currentPredictions = activeTab === 'live' ? livePredictions : activeTab === 'finished' ? finishedPredictions : [];
                    const fixturesToLoad = currentPredictions.slice(0, 5);
                    
                    fixturesToLoad.forEach(prediction => {
                      if (prediction && prediction.fixture && prediction.fixture.fixture && prediction.fixture.fixture.id) {
                        const fixtureId = prediction.fixture.fixture.id;
                        if (!h2hCornerAnalysis[fixtureId] && !loadingH2hCorners[fixtureId]) {
                          setTimeout(() => loadH2hCornerAnalysis(prediction.fixture, activeTab === 'live'), 0);
                        }
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                title="Carregar análise H2H para jogos da aba atual"
              >
                <span className="text-sm">📊</span>
                Carregar H2H {activeTab === 'upcoming' ? 'Próximos' : activeTab === 'live' ? 'Ao Vivo' : activeTab === 'finished' ? 'Finalizados' : ''}
              </button>



            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Próximos Jogos ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ao Vivo ({liveCount})
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'finished'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Finalizados ({finishedCount})
          </button>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Header dos Filtros */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-blue-500" />
              <h3 className="font-medium text-gray-900">Filtros Avançados</h3>
              {activeFilters > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters} ativo{activeFilters > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <FaBars />
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </button>
              {activeFilters > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="text-sm text-gray-600 mb-4">
            {activeTab === 'upcoming' ? (
              <>
                Mostrando {upcomingCount} próximos jogos
                {fixturesFromCache && ' (dados do cache)'}
              </>
            ) : (
              <>
                Mostrando {filteredCount} de {totalPredictions} predições
                {activeFilters > 0 && ` (${totalPredictions - filteredCount} ocultadas pelos filtros)`}
              </>
            )}
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Time ou liga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-input"
                  />
                </div>
              </div>

              {/* Filtro de Confiança - Só mostrar para abas de predições */}
              {activeTab !== 'upcoming' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confiança
                  </label>
                  <select
                    value={confidenceFilter}
                    onChange={(e) => setConfidenceFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                    style={{ color: '#111827', backgroundColor: 'white' }}
                  >
                    <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todas as confianças</option>
                    <option value="alta" style={{ color: '#111827', backgroundColor: 'white' }}>Alta confiança</option>
                    <option value="média" style={{ color: '#111827', backgroundColor: 'white' }}>Média confiança</option>
                    <option value="baixa" style={{ color: '#111827', backgroundColor: 'white' }}>Baixa confiança</option>
                  </select>
                </div>
              )}

              {/* Filtro de Liga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campeonato
                </label>
                <select
                  value={leagueFilter}
                  onChange={(e) => setLeagueFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todos os campeonatos</option>
                  {availableLeagues.map(league => (
                    <option key={league} value={league} style={{ color: '#111827', backgroundColor: 'white' }}>{league}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Mercado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mercado
                </label>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todos os mercados</option>
                  <option value="over" style={{ color: '#111827', backgroundColor: 'white' }}>Over</option>
                  <option value="under" style={{ color: '#111827', backgroundColor: 'white' }}>Under</option>
                  <option value="winner" style={{ color: '#111827', backgroundColor: 'white' }}>Vencedor</option>
                  <option value="draw" style={{ color: '#111827', backgroundColor: 'white' }}>Empate</option>
                  <option value="both_teams" style={{ color: '#111827', backgroundColor: 'white' }}>Ambos Marcam</option>
                  <option value="other" style={{ color: '#111827', backgroundColor: 'white' }}>Outros</option>
                </select>
              </div>

              {/* Filtro de Status do Jogo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Jogo
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todos os status</option>
                  <option value="active" style={{ color: '#111827', backgroundColor: 'white' }}>Jogos Ativos</option>
                  <option value="finished" style={{ color: '#111827', backgroundColor: 'white' }}>Jogos Finalizados</option>
                </select>
              </div>
            </div>
          )}

          {/* Filtros Rápidos */}
          {!showFilters && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por time ou liga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-input"
                  />
                </div>
              </div>

              <div className="sm:w-48">
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todas as confianças</option>
                  <option value="alta" style={{ color: '#111827', backgroundColor: 'white' }}>Alta confiança</option>
                  <option value="média" style={{ color: '#111827', backgroundColor: 'white' }}>Média confiança</option>
                  <option value="baixa" style={{ color: '#111827', backgroundColor: 'white' }}>Baixa confiança</option>
                </select>
              </div>

              <button
                onClick={() => loadPredictions(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Atualizar
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'upcoming' ? (
          // Aba PRÓXIMOS JOGOS - Mostrar próximos jogos
          <div>
            {/* Header dos próximos jogos */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📅 Próximos Jogos</h3>
                  <p className="text-gray-600">Jogos de hoje e amanhã com horários e status</p>
                </div>
                <div className="flex gap-2">
                                <button
                onClick={() => loadUpcomingFixtures(true)}
                disabled={loadingFixtures}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
              >
                🔄 Atualizar
              </button>
              {!isInitialLoadComplete && (
                <span className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  ⏳ Carregando dados automáticos...
                </span>
              )}
                  {fixturesFromCache && (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 text-xs rounded-full">
                      📦 Dados do cache
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de próximos jogos */}
            {renderUpcomingFixtures()}
          </div>
        ) : activeTab === 'live' ? (
          // Aba AO VIVO - Mostrar predições ao vivo
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando predições ao vivo...</p>
              </div>
            ) : filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <FaFilter className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma predição ao vivo encontrada</h3>
                <p className="mt-2 text-gray-600">
                  {activeFilters > 0 
                    ? 'Tente ajustar os filtros aplicados.' 
                    : 'Aguarde novos jogos ao vivo ou tente atualizar os dados.'
                  }
                </p>
                {activeFilters > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Limpar Todos os Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPredictions.map(prediction => 
                  renderPredictionCard(prediction, true)
                )}
              </div>
            )}
          </>
        ) : (
          // Aba FINALIZADOS - Mostrar jogos finalizados
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando jogos finalizados...</p>
              </div>
            ) : (
              <>
                {/* Header dos jogos finalizados */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">✅ Jogos Finalizados</h3>
                      <p className="text-gray-600">Histórico de jogos com resultados e análises</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadPredictions(true)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                      >
                        🔄 Atualizar
                      </button>
                      {fromCache && (
                        <span className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 text-xs rounded-full">
                          📦 Dados do cache
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de jogos finalizados */}
                {filteredPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFilter className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum jogo finalizado encontrado</h3>
                    <p className="mt-2 text-gray-600">
                      {activeFilters > 0 
                        ? 'Tente ajustar os filtros aplicados.' 
                        : 'Aguarde jogos serem finalizados ou tente atualizar os dados.'
                      }
                    </p>
                    {activeFilters > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Limpar Todos os Filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPredictions.map(prediction => 
                      renderPredictionCard(prediction, false)
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Modal de Predições da API-Sports */}
        <ApiPredictionsModal
          fixture={selectedFixtureForPredictions}
          isOpen={showApiPredictionsModal}
          onClose={closeApiPredictionsModal}
        />

        {/* Modal de Análise Avançada */}
        {showAdvancedAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaBrain className="text-indigo-600" />
                    Análise Avançada Completa
                  </h2>
                  {selectedFixtureForAdvancedAnalysis && (
                    <p className="text-gray-600 mt-1">
                      {selectedFixtureForAdvancedAnalysis.teams?.home?.name || selectedFixtureForAdvancedAnalysis.fixture?.teams?.home?.name} vs {selectedFixtureForAdvancedAnalysis.teams?.away?.name || selectedFixtureForAdvancedAnalysis.fixture?.teams?.away?.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeAdvancedAnalysisModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {loadingAdvancedAnalysis ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando análise avançada...</p>
                  </div>
                ) : advancedAnalysisData ? (
                  <div className="space-y-6">
                    {/* Resumo Executivo */}
                    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 rounded-xl border-2 border-purple-200 shadow-lg">
                      <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Resumo Executivo
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {advancedAnalysisData.riskAssessment && (
                          <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-base font-semibold text-purple-700 mb-2 flex items-center gap-2">
                              <span className="text-xl">⚠️</span>
                              Nível de Risco
                            </div>
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                              {advancedAnalysisData.riskAssessment.level}
                            </div>
                            <div className="text-sm text-purple-500 font-medium">
                              Score: {advancedAnalysisData.riskAssessment.score}/100
                            </div>
                            {advancedAnalysisData.riskAssessment.recommendation && (
                              <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                                <div className="text-xs font-semibold text-purple-700">
                                  {advancedAnalysisData.riskAssessment.recommendation}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {advancedAnalysisData.bettingInsights && (
                          <div className="bg-white p-6 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-base font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <span className="text-xl">🎯</span>
                              Confiança
                            </div>
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {advancedAnalysisData.bettingInsights.confidence}
                            </div>
                            {advancedAnalysisData.bettingInsights.recommendation && (
                              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                                <div className="text-xs font-semibold text-green-700">
                                  {advancedAnalysisData.bettingInsights.recommendation}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {advancedAnalysisData.overUnderAnalysis && (
                          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-base font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="text-xl">⚽</span>
                              Média de Gols
                            </div>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {advancedAnalysisData.overUnderAnalysis.averageGoals?.toFixed(1) || 'N/A'}
                            </div>
                            {advancedAnalysisData.overUnderAnalysis.recommendation && (
                              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                <div className="text-xs font-semibold text-blue-700">
                                  {advancedAnalysisData.overUnderAnalysis.recommendation}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Análise de Ataque */}
                    {advancedAnalysisData.attackAnalysis && (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl border-2 border-orange-200 shadow-lg">
                        <h3 className="text-2xl font-bold text-orange-900 mb-6 flex items-center gap-3">
                          <span className="text-3xl">⚽</span>
                          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Análise de Ataque
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Time da Casa */}
                          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
                            <h4 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                              Time da Casa
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-base font-semibold text-orange-700">Taxa de Conversão:</span>
                                <span className="text-lg font-bold text-orange-600">
                                  {advancedAnalysisData.attackAnalysis.home?.conversionRate?.toFixed(1) || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-base font-semibold text-orange-700">Chutes por Jogo:</span>
                                <span className="text-lg font-bold text-orange-600">
                                  {advancedAnalysisData.attackAnalysis.home?.shotsPerGame?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-base font-semibold text-orange-700">Finalizações no Alvo:</span>
                                <span className="text-lg font-bold text-orange-600">
                                  {advancedAnalysisData.attackAnalysis.home?.shotsOnTarget?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-300">
                                <span className="text-base font-semibold text-orange-800">Classificação:</span>
                                <span className="text-lg font-bold text-orange-700 px-3 py-1 bg-orange-200 rounded-full">
                                  {advancedAnalysisData.attackAnalysis.home?.strength || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Visitante */}
                          <div className="bg-white p-6 rounded-xl border border-red-200 shadow-md">
                            <h4 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              Time Visitante
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-base font-semibold text-red-700">Taxa de Conversão:</span>
                                <span className="text-lg font-bold text-red-600">
                                  {advancedAnalysisData.attackAnalysis.away?.conversionRate?.toFixed(1) || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-base font-semibold text-red-700">Chutes por Jogo:</span>
                                <span className="text-lg font-bold text-red-600">
                                  {advancedAnalysisData.attackAnalysis.away?.shotsPerGame?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-base font-semibold text-red-700">Finalizações no Alvo:</span>
                                <span className="text-lg font-bold text-red-600">
                                  {advancedAnalysisData.attackAnalysis.away?.shotsOnTarget?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border border-red-300">
                                <span className="text-base font-semibold text-red-800">Classificação:</span>
                                <span className="text-lg font-bold text-red-700 px-3 py-1 bg-red-200 rounded-full">
                                  {advancedAnalysisData.attackAnalysis.away?.strength || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {advancedAnalysisData.attackAnalysis.insights && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                            <div className="text-base font-bold text-blue-800 mb-2 flex items-center gap-2">
                              <span className="text-xl">💡</span>
                              Insights de Ataque
                            </div>
                            <p className="text-base text-blue-700 leading-relaxed">{advancedAnalysisData.attackAnalysis.insights}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Análise de Defesa */}
                    {advancedAnalysisData.defenseAnalysis && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-blue-200 shadow-lg">
                        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                          <span className="text-3xl">🛡️</span>
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Análise de Defesa
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Time da Casa */}
                          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
                            <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              Time da Casa
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-base font-semibold text-blue-700">Gols Sofridos:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {advancedAnalysisData.defenseAnalysis.home?.goalsConceded?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-base font-semibold text-blue-700">Escanteios Cedidos:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {advancedAnalysisData.defenseAnalysis.home?.cornersConceded?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-base font-semibold text-blue-700">Faltas Cometidas:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {advancedAnalysisData.defenseAnalysis.home?.foulsCommitted?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-300">
                                <span className="text-base font-semibold text-blue-800">Eficiência:</span>
                                <span className="text-lg font-bold text-blue-700 px-3 py-1 bg-blue-200 rounded-full">
                                  {advancedAnalysisData.defenseAnalysis.home?.defensiveEfficiency?.toFixed(1) || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                                <span className="text-base font-semibold text-green-800">Classificação:</span>
                                <span className="text-lg font-bold text-green-700 px-3 py-1 bg-green-200 rounded-full">
                                  {advancedAnalysisData.defenseAnalysis.home?.strength || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Visitante */}
                          <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-md">
                            <h4 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                              Time Visitante
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                <span className="text-base font-semibold text-indigo-700">Gols Sofridos:</span>
                                <span className="text-lg font-bold text-indigo-600">
                                  {advancedAnalysisData.defenseAnalysis.away?.goalsConceded?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                <span className="text-base font-semibold text-indigo-700">Escanteios Cedidos:</span>
                                <span className="text-lg font-bold text-indigo-600">
                                  {advancedAnalysisData.defenseAnalysis.away?.cornersConceded?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                <span className="text-base font-semibold text-indigo-700">Faltas Cometidas:</span>
                                <span className="text-lg font-bold text-indigo-600">
                                  {advancedAnalysisData.defenseAnalysis.away?.foulsCommitted?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-300">
                                <span className="text-base font-semibold text-indigo-800">Eficiência:</span>
                                <span className="text-lg font-bold text-indigo-700 px-3 py-1 bg-indigo-200 rounded-full">
                                  {advancedAnalysisData.defenseAnalysis.away?.defensiveEfficiency?.toFixed(1) || 'N/A'}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                                <span className="text-base font-semibold text-green-800">Classificação:</span>
                                <span className="text-lg font-bold text-green-700 px-3 py-1 bg-green-200 rounded-full">
                                  {advancedAnalysisData.defenseAnalysis.away?.strength || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {advancedAnalysisData.defenseAnalysis.insights && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <div className="text-base font-bold text-green-800 mb-2 flex items-center gap-2">
                              <span className="text-xl">💡</span>
                              Insights de Defesa
                            </div>
                            <p className="text-base text-green-700 leading-relaxed">{advancedAnalysisData.defenseAnalysis.insights}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Análise de Forma Recente */}
                    {advancedAnalysisData.formAnalysis && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border-2 border-emerald-200 shadow-lg">
                        <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
                          <span className="text-3xl">📈</span>
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Análise de Forma Recente
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Time da Casa */}
                          <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-md">
                            <h4 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                              Time da Casa
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                <span className="text-base font-semibold text-emerald-700">Últimos 10 jogos:</span>
                                <span className="text-lg font-bold text-emerald-600">
                                  {advancedAnalysisData.formAnalysis.home?.wins || 0}V {advancedAnalysisData.formAnalysis.home?.draws || 0}E {advancedAnalysisData.formAnalysis.home?.losses || 0}D
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                <span className="text-base font-semibold text-emerald-700">Gols Marcados:</span>
                                <span className="text-lg font-bold text-emerald-600">
                                  {advancedAnalysisData.formAnalysis.home?.goalsFor || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                <span className="text-base font-semibold text-emerald-700">Gols Sofridos:</span>
                                <span className="text-lg font-bold text-emerald-600">
                                  {advancedAnalysisData.formAnalysis.home?.goalsAgainst || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-300">
                                <span className="text-base font-semibold text-emerald-800">Forma:</span>
                                <span className="text-lg font-bold text-emerald-700 px-3 py-1 bg-emerald-200 rounded-full">
                                  {advancedAnalysisData.formAnalysis.home?.form || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-300">
                                <span className="text-base font-semibold text-purple-800">Tendência:</span>
                                <span className="text-lg font-bold text-purple-700 px-3 py-1 bg-purple-200 rounded-full">
                                  {advancedAnalysisData.formAnalysis.home?.trend || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Visitante */}
                          <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-md">
                            <h4 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                              <span className="w-3 h-3 bg-teal-500 rounded-full"></span>
                              Time Visitante
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                                <span className="text-base font-semibold text-teal-700">Últimos 10 jogos:</span>
                                <span className="text-lg font-bold text-teal-600">
                                  {advancedAnalysisData.formAnalysis.away?.wins || 0}V {advancedAnalysisData.formAnalysis.away?.draws || 0}E {advancedAnalysisData.formAnalysis.away?.losses || 0}D
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                                <span className="text-base font-semibold text-teal-700">Gols Marcados:</span>
                                <span className="text-lg font-bold text-teal-600">
                                  {advancedAnalysisData.formAnalysis.away?.goalsFor || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                                <span className="text-base font-semibold text-teal-700">Gols Sofridos:</span>
                                <span className="text-lg font-bold text-teal-600">
                                  {advancedAnalysisData.formAnalysis.away?.goalsAgainst || 0}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg border border-teal-300">
                                <span className="text-base font-semibold text-teal-800">Forma:</span>
                                <span className="text-lg font-bold text-teal-700 px-3 py-1 bg-teal-200 rounded-full">
                                  {advancedAnalysisData.formAnalysis.away?.form || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-300">
                                <span className="text-base font-semibold text-purple-800">Tendência:</span>
                                <span className="text-lg font-bold text-purple-700 px-3 py-1 bg-purple-200 rounded-full">
                                  {advancedAnalysisData.formAnalysis.away?.trend || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {advancedAnalysisData.formAnalysis.insights && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                            <div className="text-base font-bold text-emerald-800 mb-2 flex items-center gap-2">
                              <span className="text-xl">💡</span>
                              Insights de Forma
                            </div>
                            <p className="text-base text-emerald-700 leading-relaxed">{advancedAnalysisData.formAnalysis.insights}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Análise Over/Under */}
                    {advancedAnalysisData.overUnderAnalysis && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          🎯 Análise Over/Under
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-600 mb-1">Over 2.5</div>
                            <div className="text-2xl font-bold text-blue-700">
                              {advancedAnalysisData.overUnderAnalysis.over25Probability?.toFixed(0) || 'N/A'}%
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-green-600 mb-1">Over 3.5</div>
                            <div className="text-2xl font-bold text-green-700">
                              {advancedAnalysisData.overUnderAnalysis.over35Probability?.toFixed(0) || 'N/A'}%
                            </div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-sm text-red-600 mb-1">Under 2.5</div>
                            <div className="text-2xl font-bold text-red-700">
                              {advancedAnalysisData.overUnderAnalysis.under25Probability?.toFixed(0) || 'N/A'}%
                            </div>
                          </div>
                        </div>
                        {advancedAnalysisData.overUnderAnalysis.recommendation && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-sm font-medium text-yellow-800 mb-1">🎯 Recomendação:</div>
                            <p className="text-sm text-yellow-700">{advancedAnalysisData.overUnderAnalysis.recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Insights de Apostas */}
                    {advancedAnalysisData.bettingInsights && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          💰 Insights de Apostas
                        </h3>
                        <div className="space-y-4">
                          {advancedAnalysisData.bettingInsights.recommendedBets && advancedAnalysisData.bettingInsights.recommendedBets.length > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-sm font-medium text-green-800 mb-2">🎯 Apostas Recomendadas:</div>
                              <ul className="space-y-1">
                                {advancedAnalysisData.bettingInsights.recommendedBets.map((bet, index) => (
                                  <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                                    <span>•</span>
                                    {bet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {advancedAnalysisData.bettingInsights.keyFactors && advancedAnalysisData.bettingInsights.keyFactors.length > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-medium text-blue-800 mb-2">🔑 Fatores Chave:</div>
                              <ul className="space-y-1">
                                {advancedAnalysisData.bettingInsights.keyFactors.map((factor, index) => (
                                  <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                                    <span>•</span>
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {advancedAnalysisData.bettingInsights.betsToAvoid && advancedAnalysisData.bettingInsights.betsToAvoid.length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="text-sm font-medium text-red-800 mb-2">⚠️ Apostas a Evitar:</div>
                              <ul className="space-y-1">
                                {advancedAnalysisData.bettingInsights.betsToAvoid.map((bet, index) => (
                                  <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                                    <span>•</span>
                                    {bet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Avaliação de Risco */}
                    {advancedAnalysisData.riskAssessment && (
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          ⚠️ Avaliação de Risco
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="text-sm text-gray-600">Nível de Risco</div>
                              <div className="text-xl font-bold text-gray-800">{advancedAnalysisData.riskAssessment.level}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Score</div>
                              <div className="text-xl font-bold text-gray-800">{advancedAnalysisData.riskAssessment.score}/100</div>
                            </div>
                          </div>
                          {advancedAnalysisData.riskAssessment.factors && advancedAnalysisData.riskAssessment.factors.length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-sm font-medium text-orange-800 mb-2">🔍 Fatores de Risco:</div>
                              <ul className="space-y-1">
                                {advancedAnalysisData.riskAssessment.factors.map((factor, index) => (
                                  <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                                    <span>•</span>
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar análise</h3>
                    <p className="text-gray-600">Não foi possível carregar os dados da análise avançada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
