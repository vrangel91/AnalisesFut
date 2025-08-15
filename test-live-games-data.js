// Dados de teste para jogos ao vivo
const liveGamesTestData = [
  {
    fixture: {
      fixture: {
        id: 1234567,
        date: new Date().toISOString(),
        timestamp: Math.floor(Date.now() / 1000),
        status: {
          short: '1H',
          long: 'First Half',
          elapsed: 25
        },
        venue: {
          id: 123,
          name: 'Estádio Municipal',
          city: 'São Paulo'
        }
      },
      teams: {
        home: {
          id: 1001,
          name: 'Palmeiras',
          logo: 'https://media.api-sports.io/football/teams/1001.png'
        },
        away: {
          id: 1002,
          name: 'Corinthians',
          logo: 'https://media.api-sports.io/football/teams/1002.png'
        }
      },
      league: {
        id: 71,
        name: 'Brasileirão Série A',
        country: 'Brasil',
        logo: 'https://media.api-sports.io/football/leagues/71.png',
        flag: 'https://media.api-sports.io/flags/br.svg'
      },
      goals: {
        home: 1,
        away: 0
      }
    },
    prediction: {
      winner: {
        id: 1001,
        name: 'Palmeiras',
        comment: 'Casa forte'
      },
      percent: {
        home: '65%',
        draw: '20%',
        away: '15%'
      },
      under_over: 'Over 2.5',
      advice: 'Palmeiras tem vantagem em casa'
    },
    confidence: 'alta',
    riskLevel: 'baixo',
    analysis: {
      advancedScore: 0.85,
      homeForm: 'WWWDL',
      awayForm: 'LDLWW',
      h2h: {
        total: 5,
        homeWins: 3,
        awayWins: 1,
        draws: 1
      }
    }
  },
  {
    fixture: {
      fixture: {
        id: 1234568,
        date: new Date().toISOString(),
        timestamp: Math.floor(Date.now() / 1000),
        status: {
          short: '2H',
          long: 'Second Half',
          elapsed: 67
        },
        venue: {
          id: 124,
          name: 'Maracanã',
          city: 'Rio de Janeiro'
        }
      },
      teams: {
        home: {
          id: 1003,
          name: 'Flamengo',
          logo: 'https://media.api-sports.io/football/teams/1003.png'
        },
        away: {
          id: 1004,
          name: 'Vasco',
          logo: 'https://media.api-sports.io/football/teams/1004.png'
        }
      },
      league: {
        id: 71,
        name: 'Brasileirão Série A',
        country: 'Brasil',
        logo: 'https://media.api-sports.io/football/leagues/71.png',
        flag: 'https://media.api-sports.io/flags/br.svg'
      },
      goals: {
        home: 2,
        away: 1
      }
    },
    prediction: {
      winner: {
        id: 1003,
        name: 'Flamengo',
        comment: 'Superioridade técnica'
      },
      percent: {
        home: '70%',
        draw: '15%',
        away: '15%'
      },
      under_over: 'Over 2.5',
      advice: 'Flamengo domina o jogo'
    },
    confidence: 'alta',
    riskLevel: 'médio',
    analysis: {
      advancedScore: 0.78,
      homeForm: 'WWWWD',
      awayForm: 'LLWDL',
      h2h: {
        total: 8,
        homeWins: 5,
        awayWins: 2,
        draws: 1
      }
    }
  },
  {
    fixture: {
      fixture: {
        id: 1234569,
        date: new Date().toISOString(),
        timestamp: Math.floor(Date.now() / 1000),
        status: {
          short: 'HT',
          long: 'Half Time',
          elapsed: 45
        },
        venue: {
          id: 125,
          name: 'Arena Corinthians',
          city: 'São Paulo'
        }
      },
      teams: {
        home: {
          id: 1005,
          name: 'São Paulo',
          logo: 'https://media.api-sports.io/football/teams/1005.png'
        },
        away: {
          id: 1006,
          name: 'Santos',
          logo: 'https://media.api-sports.io/football/teams/1006.png'
        }
      },
      league: {
        id: 71,
        name: 'Brasileirão Série A',
        country: 'Brasil',
        logo: 'https://media.api-sports.io/football/leagues/71.png',
        flag: 'https://media.api-sports.io/flags/br.svg'
      },
      goals: {
        home: 0,
        away: 0
      }
    },
    prediction: {
      winner: {
        id: 1005,
        name: 'São Paulo',
        comment: 'Momento melhor'
      },
      percent: {
        home: '55%',
        draw: '30%',
        away: '15%'
      },
      under_over: 'Under 2.5',
      advice: 'Jogo equilibrado, São Paulo ligeiramente favorito'
    },
    confidence: 'média',
    riskLevel: 'alto',
    analysis: {
      advancedScore: 0.62,
      homeForm: 'DLWWD',
      awayForm: 'WLLDD',
      h2h: {
        total: 6,
        homeWins: 2,
        awayWins: 2,
        draws: 2
      }
    }
  }
];

// Dados de teste para fixtures ao vivo (formato diferente)
const liveFixturesTestData = [
  {
    fixture: {
      id: 1234567,
      date: new Date().toISOString(),
      timestamp: Math.floor(Date.now() / 1000),
      status: {
        short: '1H',
        long: 'First Half',
        elapsed: 25
      },
      venue: {
        id: 123,
        name: 'Estádio Municipal',
        city: 'São Paulo'
      }
    },
    teams: {
      home: {
        id: 1001,
        name: 'Palmeiras',
        logo: 'https://media.api-sports.io/football/teams/1001.png'
      },
      away: {
        id: 1002,
        name: 'Corinthians',
        logo: 'https://media.api-sports.io/football/teams/1002.png'
      }
    },
    league: {
      id: 71,
      name: 'Brasileirão Série A',
      country: 'Brasil',
      logo: 'https://media.api-sports.io/football/leagues/71.png',
      flag: 'https://media.api-sports.io/flags/br.svg'
    },
    goals: {
      home: 1,
      away: 0
    }
  },
  {
    fixture: {
      id: 1234568,
      date: new Date().toISOString(),
      timestamp: Math.floor(Date.now() / 1000),
      status: {
        short: '2H',
        long: 'Second Half',
        elapsed: 67
      },
      venue: {
        id: 124,
        name: 'Maracanã',
        city: 'Rio de Janeiro'
      }
    },
    teams: {
      home: {
        id: 1003,
        name: 'Flamengo',
        logo: 'https://media.api-sports.io/football/teams/1003.png'
      },
      away: {
        id: 1004,
        name: 'Vasco',
        logo: 'https://media.api-sports.io/football/teams/1004.png'
      }
    },
    league: {
      id: 71,
      name: 'Brasileirão Série A',
      country: 'Brasil',
      logo: 'https://media.api-sports.io/football/leagues/71.png',
      flag: 'https://media.api-sports.io/flags/br.svg'
    },
    goals: {
      home: 2,
      away: 1
    }
  }
];

module.exports = {
  liveGamesTestData,
  liveFixturesTestData
};
