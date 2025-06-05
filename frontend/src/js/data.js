// Arquivo de funções para manipulação de dados via API
// Migrado do localStorage para PostgreSQL

// Sistema de fallback para localStorage quando API não estiver disponível
const USE_FALLBACK = false; // Pode ser configurado via ambiente

// Função para gerar ID único (mantida para compatibilidade)
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para buscar caminhões via API
async function buscarCaminhoes() {
    try {
        if (window.dbApi) {
            return await window.dbApi.buscarCaminhoes();
        } else {
            // Fallback para localStorage se API não estiver disponível
            console.warn('API não disponível, usando localStorage como fallback');
            const savedCaminhoes = localStorage.getItem('caminhoes');
            return savedCaminhoes ? JSON.parse(savedCaminhoes) : [];
        }
    } catch (error) {
        console.error('Erro ao buscar caminhões:', error);
        // Fallback para localStorage em caso de erro
        if (USE_FALLBACK) {
            const savedCaminhoes = localStorage.getItem('caminhoes');
            return savedCaminhoes ? JSON.parse(savedCaminhoes) : [];
        }
        return [];
    }
}

// Função para salvar caminhão via API
async function salvarCaminhao(caminhao) {
    try {
        if (window.dbApi) {
            return await window.dbApi.salvarCaminhao(caminhao);
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            const caminhoes = await buscarCaminhoes();
            
            if (caminhao.id) {
                // Editar caminhão existente
                const index = caminhoes.findIndex(c => c.id === caminhao.id);
                if (index !== -1) {
                    caminhoes[index] = caminhao;
                }
            } else {
                // Novo caminhão
                caminhao.id = generateId();
                caminhao.data_criacao = new Date().toISOString();
                caminhoes.push(caminhao);
            }
            
            localStorage.setItem('caminhoes', JSON.stringify(caminhoes));
            return caminhao;
        }
    } catch (error) {
        console.error('Erro ao salvar caminhão:', error);
        throw new Error('Erro ao salvar caminhão: ' + error.message);
    }
}

// Função para excluir caminhão via API
async function excluirCaminhao(id) {
    try {
        if (window.dbApi) {
            await window.dbApi.excluirCaminhao(id);
            return true;
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            const caminhoes = await buscarCaminhoes();
            const caminhoesFilter = caminhoes.filter(c => c.id !== id);
            localStorage.setItem('caminhoes', JSON.stringify(caminhoesFilter));
            return true;
        }
    } catch (error) {
        console.error('Erro ao excluir caminhão:', error);
        return false;
    }
}

// Função para buscar abastecimentos via API
async function buscarAbastecimentos() {
    try {
        if (window.dbApi) {
            return await window.dbApi.buscarAbastecimentos();
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            const savedAbastecimentos = localStorage.getItem('abastecimentos');
            return savedAbastecimentos ? JSON.parse(savedAbastecimentos) : [];
        }
    } catch (error) {
        console.error('Erro ao buscar abastecimentos:', error);
        // Fallback para localStorage em caso de erro
        if (USE_FALLBACK) {
            const savedAbastecimentos = localStorage.getItem('abastecimentos');
            return savedAbastecimentos ? JSON.parse(savedAbastecimentos) : [];
        }
        return [];
    }
}

// Função para salvar abastecimento via API
async function salvarAbastecimento(abastecimento) {
    try {
        if (window.dbApi) {
            return await window.dbApi.salvarAbastecimento(abastecimento);
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            const abastecimentos = await buscarAbastecimentos();
            
            if (abastecimento.id) {
                // Editar abastecimento existente
                const index = abastecimentos.findIndex(a => a.id === abastecimento.id);
                if (index !== -1) {
                    abastecimentos[index] = abastecimento;
                }
            } else {
                // Novo abastecimento
                abastecimento.id = generateId();
                abastecimento.data_criacao = new Date().toISOString();
                abastecimentos.push(abastecimento);
            }
            
            localStorage.setItem('abastecimentos', JSON.stringify(abastecimentos));
            return abastecimento;
        }
    } catch (error) {
        console.error('Erro ao salvar abastecimento:', error);
        throw new Error('Erro ao salvar abastecimento: ' + error.message);
    }
}

// Função para excluir abastecimento via API
async function excluirAbastecimento(id) {
    try {
        if (window.dbApi) {
            await window.dbApi.excluirAbastecimento(id);
            return true;
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            const abastecimentos = await buscarAbastecimentos();
            const abastecimentosFilter = abastecimentos.filter(a => a.id !== id);
            localStorage.setItem('abastecimentos', JSON.stringify(abastecimentosFilter));
            return true;
        }
    } catch (error) {
        console.error('Erro ao excluir abastecimento:', error);
        return false;
    }
}

// Função para limpar todos os dados via API
async function limparTodosDados() {
    try {
        if (window.dbApi) {
            return await window.dbApi.limparTodosDados();
        } else {
            // Fallback para localStorage
            console.warn('API não disponível, usando localStorage como fallback');
            localStorage.removeItem('caminhoes');
            localStorage.removeItem('abastecimentos');
            return true;
        }
    } catch (error) {
        console.error('Erro ao limpar todos os dados:', error);
        return false;
    }
}

// Função para fazer backup dos dados via API
async function fazerBackupDados() {
    try {
        const caminhoes = await buscarCaminhoes();
        const abastecimentos = await buscarAbastecimentos();
        
        const backup = {
            caminhoes,
            abastecimentos,
            data_backup: new Date().toISOString(),
            versao: '2.0.0', // Versão com API
            fonte: window.dbApi ? 'API' : 'localStorage'
        };
        
        return JSON.stringify(backup, null, 2);
    } catch (error) {
        console.error('Erro ao fazer backup:', error);
        throw new Error('Erro ao fazer backup: ' + error.message);
    }
}

// Função para restaurar dados do backup
async function restaurarBackupDados(backupData) {
    try {
        const backup = JSON.parse(backupData);
        
        if (backup.caminhoes && Array.isArray(backup.caminhoes)) {
            // Se temos API, salvar via API, senão usar localStorage
            if (window.dbApi) {
                for (const caminhao of backup.caminhoes) {
                    await salvarCaminhao(caminhao);
                }
            } else {
                localStorage.setItem('caminhoes', JSON.stringify(backup.caminhoes));
            }
        }
        
        if (backup.abastecimentos && Array.isArray(backup.abastecimentos)) {
            // Se temos API, salvar via API, senão usar localStorage
            if (window.dbApi) {
                for (const abastecimento of backup.abastecimentos) {
                    await salvarAbastecimento(abastecimento);
                }
            } else {
                localStorage.setItem('abastecimentos', JSON.stringify(backup.abastecimentos));
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        return false;
    }
}

// Função para migrar dados do localStorage para a API
async function migrarDadosLocalStorageParaAPI() {
    try {
        if (!window.dbApi) {
            throw new Error('API não está disponível para migração');
        }

        console.log('🔄 Iniciando migração do localStorage para API...');

        // Buscar dados do localStorage
        const caminhoesLocal = localStorage.getItem('caminhoes');
        const abastecimentosLocal = localStorage.getItem('abastecimentos');

        let migracaoRealizada = false;

        if (caminhoesLocal) {
            const caminhoes = JSON.parse(caminhoesLocal);
            console.log(`📦 Migrando ${caminhoes.length} caminhões...`);
            
            for (const caminhao of caminhoes) {
                await window.dbApi.salvarCaminhao(caminhao);
            }
            migracaoRealizada = true;
        }

        if (abastecimentosLocal) {
            const abastecimentos = JSON.parse(abastecimentosLocal);
            console.log(`⛽ Migrando ${abastecimentos.length} abastecimentos...`);
            
            for (const abastecimento of abastecimentos) {
                await window.dbApi.salvarAbastecimento(abastecimento);
            }
            migracaoRealizada = true;
        }

        if (migracaoRealizada) {
            console.log('✅ Migração concluída! Criando backup do localStorage...');
            
            // Fazer backup antes de limpar
            const backup = {
                caminhoes: caminhoesLocal ? JSON.parse(caminhoesLocal) : [],
                abastecimentos: abastecimentosLocal ? JSON.parse(abastecimentosLocal) : [],
                data_backup: new Date().toISOString(),
                versao: '1.0.0-localStorage'
            };
            
            localStorage.setItem('backup_migracao', JSON.stringify(backup));
            
            // Opcional: limpar localStorage após migração bem-sucedida
            // localStorage.removeItem('caminhoes');
            // localStorage.removeItem('abastecimentos');
            
            console.log('💾 Backup salvo no localStorage como "backup_migracao"');
        } else {
            console.log('ℹ️ Nenhum dado encontrado no localStorage para migrar');
        }

        return migracaoRealizada;
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        throw error;
    }
}

// Exportar funções para uso no aplicativo (mantendo compatibilidade)
window.localStorageApi = {
    buscarCaminhoes,
    salvarCaminhao,
    excluirCaminhao,
    buscarAbastecimentos,
    salvarAbastecimento,
    excluirAbastecimento,
    limparTodosDados,
    fazerBackupDados,
    restaurarBackupDados,
    migrarDadosLocalStorageParaAPI
};

// Alias para manter compatibilidade total
window.dataApi = window.localStorageApi;

console.log('✅ Data layer atualizado para usar API com fallback para localStorage!');
