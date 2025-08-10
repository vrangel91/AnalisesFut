const { exec } = require('child_process');
const path = require('path');

async function runTest(testFile, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 EXECUTANDO: ${description}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const child = exec(`node ${testFile}`, {
      cwd: __dirname,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data;
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      output += data;
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      console.log(`\n${'='.repeat(60)}`);
      if (code === 0) {
        console.log(`✅ ${description} - CONCLUÍDO COM SUCESSO`);
      } else {
        console.log(`❌ ${description} - FALHOU (código: ${code})`);
      }
      console.log(`${'='.repeat(60)}`);
      resolve({ code, output });
    });

    child.on('error', (error) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`❌ ${description} - ERRO: ${error.message}`);
      console.log(`${'='.repeat(60)}`);
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('🚀 INICIANDO TODOS OS TESTES DE CACHE');
  console.log('⏰ Início:', new Date().toISOString());
  
  const tests = [
    { file: 'test-database-cache.js', description: 'Teste do Banco de Dados do Cache' },
    { file: 'test-cache.js', description: 'Teste do CacheService' },
    { file: 'test-cached-api.js', description: 'Teste do CachedApiService' },
    { file: 'test-predictions-cache.js', description: 'Teste do Cache de Predictions' }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTest(test.file, test.description);
      results.push({ ...test, ...result });
    } catch (error) {
      results.push({ ...test, code: -1, error: error.message });
    }
  }

  // Resumo final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.code === 0).length;
  const failed = results.filter(r => r.code !== 0).length;
  
  console.log(`✅ Testes passaram: ${passed}`);
  console.log(`❌ Testes falharam: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detalhes:');
  results.forEach((result, index) => {
    const status = result.code === 0 ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.description}`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });
  
  console.log('\n⏰ Fim:', new Date().toISOString());
  
  if (failed > 0) {
    console.log('\n🔍 RECOMENDAÇÕES:');
    console.log('- Verifique os logs acima para identificar problemas específicos');
    console.log('- Certifique-se de que o servidor está rodando');
    console.log('- Verifique se o banco de dados foi inicializado corretamente');
    console.log('- Confirme se todas as dependências estão instaladas');
  } else {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! O sistema de cache está funcionando corretamente.');
  }
}

// Executar todos os testes
runAllTests().catch(console.error);
