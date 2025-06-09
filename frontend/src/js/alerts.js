// Funções de alertas personalizados com SweetAlert2
// Sistema de Controle de Combustível

// Configuração padrão para todos os alertas
const defaultConfig = {
    customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary',
        denyButton: 'btn btn-danger me-2'
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
    }
};

// Alertas de sucesso
const AlertSuccess = {
    // Sucesso simples
    show: (title, text = '', timer = 3000) => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'success',
            title: title,
            text: text,
            timer: timer,
            timerProgressBar: true,
            showConfirmButton: false
        });
    },

    // Sucesso com confirmação
    confirm: (title, text = '') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'success',
            title: title,
            text: text,
            confirmButtonText: 'OK'
        });
    },

    // Sucesso com detalhes (para testes e debug)
    detailed: (title, details = '', showConsole = true) => {
        const text = showConsole ? `${details}\n\nConsulte o console para mais detalhes.` : details;
        return Swal.fire({
            ...defaultConfig,
            icon: 'success',
            title: title,
            text: text,
            confirmButtonText: 'OK',
            width: '600px'
        });
    }
};

// Alertas de erro
const AlertError = {
    // Erro simples
    show: (title, text = '') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'error',
            title: title,
            text: text,
            confirmButtonText: 'OK'
        });
    },

    // Erro de validação
    validation: (message) => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'error',
            title: 'Dados Inválidos',
            text: message,
            confirmButtonText: 'OK'
        });
    },

    // Erro de API/Sistema
    api: (error) => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'error',
            title: 'Erro do Sistema',
            text: `${error.message || error}\n\nConsulte o console para mais detalhes.`,
            confirmButtonText: 'OK',
            width: '600px'
        });
    }
};

// Alertas de aviso
const AlertWarning = {
    // Aviso simples
    show: (title, text = '') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonText: 'OK'
        });
    },

    // Aviso com dados não encontrados
    noData: (message = 'Nenhum dado encontrado para o período selecionado.') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'warning',
            title: 'Sem Dados',
            text: message,
            confirmButtonText: 'OK'
        });
    }
};

// Alertas de informação
const AlertInfo = {
    // Informação simples
    show: (title, text = '') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'info',
            title: title,
            text: text,
            confirmButtonText: 'OK'
        });
    },

    // Status/loading
    loading: (title = 'Processando...', text = '') => {
        return Swal.fire({
            ...defaultConfig,
            title: title,
            text: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },

    // Alerta discreto de conexão (não-bloqueante)
    connecting: (message = 'Conectando com o servidor...', details = 'Isso pode levar até um minuto. Você pode continuar navegando.') => {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'info',
            title: `🔄 ${message}`,
            text: details,
            showConfirmButton: false,
            timer: 60000, // 1 minuto
            timerProgressBar: true,
            didOpen: (toast) => {
                // Adicionar animação de rotação ao ícone
                const icon = toast.querySelector('.swal2-icon.swal2-info');
                if (icon) {
                    icon.style.animation = 'pulse 2s infinite';
                }
                
                // Adicionar classe CSS para animação customizada
                toast.style.cssText += `
                    animation: slideInUp 0.5s ease-out;
                    border-left: 4px solid #17a2b8;
                    backdrop-filter: blur(5px);
                    background: rgba(255, 255, 255, 0.95);
                `;
            },
            customClass: {
                popup: 'connection-toast'
            }
        });
    },

    // Alerta discreto de carregamento de dados (não-bloqueante)
    loadingData: (message = 'Carregando dados...', details = 'Sincronizando informações do banco de dados. Isso pode levar alguns segundos.') => {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            html: `
                <div class="loading-truck-container">
                    <div class="truck-animation">
                        <div class="truck-body">
                            <div class="truck-cab">🚛</div>
                            <div class="truck-trail">💨</div>
                        </div>
                        <div class="road-line"></div>
                    </div>
                    <div class="loading-text">
                        <strong>🚚 ${message}</strong>
                        <div class="loading-details">${details}</div>
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            timer: 30000, // 30 segundos
            timerProgressBar: true,
            width: '420px',
            didOpen: (toast) => {
                // Adicionar estilo customizado para animação de caminhão
                toast.style.cssText += `
                    animation: slideInUp 0.5s ease-out;
                    border-left: 5px solid #28a745;
                    backdrop-filter: blur(5px);
                    background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), rgba(255, 255, 255, 0.95));
                    box-shadow: 0 8px 32px rgba(40, 167, 69, 0.2);
                `;
            },
            customClass: {
                popup: 'loading-data-toast truck-loading-toast'
            }
        });
    },

    // Alerta de carregamento principal mais visível e profissional
    loadingSystem: (message = 'Carregando Sistema de Gestão...', details = 'Sincronizando dados de caminhões, abastecimentos e relatórios do banco de dados.') => {
        return Swal.fire({
            html: `
                <div class="system-loading-container">
                    <div class="fleet-animation">
                        <div class="truck-convoy">
                            <div class="truck-unit">🚛</div>
                            <div class="truck-unit delay-1">🚚</div>
                            <div class="truck-unit delay-2">🚐</div>
                        </div>
                        <div class="loading-highway">
                            <div class="highway-line"></div>
                            <div class="highway-line delay"></div>
                        </div>
                    </div>
                    <div class="system-loading-text">
                        <h3 class="loading-title">🚚 ${message}</h3>
                        <p class="loading-description">${details}</p>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="progress-text">Carregando sistema...</div>
                            <div class="loading-status">
                                <div class="status-item">📦 Preparando dados</div>
                                <div class="status-item" style="animation-delay: 1s;">🔄 Sincronizando</div>
                                <div class="status-item" style="animation-delay: 2s;">✅ Finalizando</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            width: '520px',
            backdrop: 'rgba(0,0,0,0.7)',
            customClass: {
                popup: 'system-loading-modal'
            },
            didOpen: () => {
                // Adicionar destaque visual extra
                const popup = Swal.getPopup();
                if (popup) {
                    popup.style.transform = 'scale(1.02)';
                    popup.style.transition = 'transform 0.3s ease';
                }
            }
        });
    },

    // Alerta de reconexão bem-sucedida (discreto)
    reconnected: (message = 'Conexão restabelecida!') => {
        return Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: `✅ ${message}`,
            text: 'Sistema totalmente funcional.',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.style.cssText += `
                    animation: slideInUp 0.5s ease-out;
                    border-left: 4px solid #28a745;
                    backdrop-filter: blur(5px);
                    background: rgba(255, 255, 255, 0.95);
                `;
            }
        });
    }
};

// Alertas de confirmação
const AlertConfirm = {
    // Confirmação simples (Sim/Não)
    yesNo: (title, text = '', confirmText = 'Sim', cancelText = 'Não') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'question',
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText
        });
    },

    // Confirmação de exclusão
    delete: (itemName = 'este item') => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'warning',
            title: 'Confirmar Exclusão',
            text: `Tem certeza que deseja excluir ${itemName}?`,
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            customClass: {
                ...defaultConfig.customClass,
                confirmButton: 'btn btn-danger me-2'
            }
        });
    },

    // Confirmação de limpeza de dados
    clearData: () => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'warning',
            title: 'Limpar Todos os Dados',
            text: 'Esta ação irá remover TODOS os dados do sistema. Esta operação não pode ser desfeita!',
            showCancelButton: true,
            confirmButtonText: 'Sim, limpar tudo',
            cancelButtonText: 'Cancelar',
            customClass: {
                ...defaultConfig.customClass,
                confirmButton: 'btn btn-danger me-2'
            }
        });
    },
    
    // Confirmação de exclusão de caminhão com abastecimentos
    deleteWithAbastecimentos: () => {
        return Swal.fire({
            ...defaultConfig,
            icon: 'warning',
            title: '⚠️ Caminhão Possui Abastecimentos',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p style="margin-bottom: 15px; color: #6c757d;">
                        <strong>Este caminhão possui abastecimentos registrados.</strong>
                    </p>
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #856404;">
                            <i class="bi bi-exclamation-triangle-fill" style="color: #fd7e14; margin-right: 8px;"></i>
                            <strong>Atenção:</strong> A exclusão removerá também <strong>todos os abastecimentos associados</strong> a este caminhão.
                        </p>
                    </div>
                    <p style="margin: 0; color: #6c757d;">
                        <i class="bi bi-info-circle-fill" style="color: #0dcaf0; margin-right: 8px;"></i>
                        Esta ação <strong>não pode ser desfeita</strong>. Deseja continuar?
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir tudo',
            cancelButtonText: 'Cancelar',
            customClass: {
                ...defaultConfig.customClass,
                confirmButton: 'btn btn-danger me-2',
                popup: 'swal2-warning-popup'
            },
            width: '480px'
        });
    }
};

// Toast (notificações pequenas)
const AlertToast = {
    success: (message) => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },

    error: (message) => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: message,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
    },

    warning: (message) => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: message,
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true
        });
    },

    info: (message) => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }
};

// Função para fechar alertas programaticamente
const AlertUtils = {
    close: () => {
        Swal.close();
    },

    // Verifica se há um alerta aberto
    isOpen: () => {
        return Swal.isVisible();
    }
};

// Exportar as funções para uso global
window.AlertSuccess = AlertSuccess;
window.AlertError = AlertError;
window.AlertWarning = AlertWarning;
window.AlertInfo = AlertInfo;
window.AlertConfirm = AlertConfirm;
window.AlertToast = AlertToast;
window.AlertUtils = AlertUtils;

// Para compatibilidade com alert() nativo, criar função de fallback
window.customAlert = (message, type = 'info') => {
    switch (type) {
        case 'success':
            return AlertSuccess.show('Sucesso', message);
        case 'error':
            return AlertError.show('Erro', message);
        case 'warning':
            return AlertWarning.show('Aviso', message);
        default:
            return AlertInfo.show('Informação', message);
    }
};

// Adicionar CSS para animações personalizadas dos alertas discretos
const addCustomCSS = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Animações para alertas discretos */
        @keyframes slideInUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
            }
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        /* Estilos específicos para toasts de conexão */
        .connection-toast {
            box-shadow: 0 8px 32px rgba(0, 123, 191, 0.3) !important;
            border-radius: 12px !important;
            font-size: 14px !important;
        }

        .loading-data-toast {
            box-shadow: 0 8px 32px rgba(40, 167, 69, 0.3) !important;
            border-radius: 12px !important;
            font-size: 14px !important;
        }

        /* Melhorar visual dos toasts bottom-end */
        .swal2-container.swal2-bottom-end > .swal2-popup {
            margin-bottom: 20px !important;
            margin-right: 20px !important;
            max-width: 350px !important;
        }

        /* Animação de loading customizada */
        .custom-loading-spinner {
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }

        /* Animações para o caminhão de carregamento */
        .loading-truck-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .truck-animation {
            position: relative;
            width: 100%;
            height: 60px;
            margin-bottom: 15px;
            overflow: hidden;
        }

        .truck-body {
            position: relative;
            display: flex;
            align-items: center;
            animation: truckMove 3s ease-in-out infinite;
        }

        .truck-cab {
            font-size: 24px;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
            animation: truckBounce 0.5s ease-in-out infinite alternate;
        }

        .truck-trail {
            margin-left: -5px;
            font-size: 16px;
            opacity: 0.7;
            animation: trailMove 1s ease-in-out infinite;
        }

        .road-line {
            position: absolute;
            bottom: 10px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                #ddd 25%, 
                #999 50%, 
                #ddd 75%, 
                transparent 100%);
            animation: roadMove 2s linear infinite;
        }

        .loading-text {
            text-align: center;
            color: #2c3e50;
        }

        .loading-text strong {
            font-size: 16px;
            color: #28a745;
            display: block;
            margin-bottom: 5px;
        }

        .loading-details {
            font-size: 13px;
            color: #6c757d;
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .loading-dots {
            display: flex;
            justify-content: center;
            gap: 4px;
        }

        .loading-dots span {
            width: 6px;
            height: 6px;
            background: #28a745;
            border-radius: 50%;
            animation: dotPulse 1.5s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) {
            animation-delay: 0.3s;
        }

        .loading-dots span:nth-child(3) {
            animation-delay: 0.6s;
        }

        @keyframes truckMove {
            0%, 100% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
        }

        @keyframes truckBounce {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-2px); }
        }

        @keyframes trailMove {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.2); }
        }

        @keyframes roadMove {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
        }

        @keyframes dotPulse {
            0%, 80%, 100% { 
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% { 
                transform: scale(1.2);
                opacity: 1;
            }
        }

        /* Estilo especial para toast de carregamento com caminhão */
        .truck-loading-toast {
            background: linear-gradient(135deg, 
                rgba(40, 167, 69, 0.05), 
                rgba(255, 255, 255, 0.98)) !important;
            border: 1px solid rgba(40, 167, 69, 0.2) !important;
            box-shadow: 0 10px 40px rgba(40, 167, 69, 0.25) !important;
        }

        .truck-loading-toast .swal2-timer-progress-bar {
            background: linear-gradient(90deg, #28a745, #20c997) !important;
            height: 3px !important;
        }

        /* Estilos para o modal de carregamento do sistema */
        .system-loading-modal {
            border-radius: 20px !important;
            background: linear-gradient(135deg, #f8f9fa, #ffffff) !important;
            border: none !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
        }

        .system-loading-container {
            padding: 30px 20px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .fleet-animation {
            height: 80px;
            position: relative;
            margin-bottom: 30px;
            overflow: hidden;
        }

        .truck-convoy {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            animation: convoyMove 4s ease-in-out infinite;
        }

        .truck-unit {
            font-size: 28px;
            filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.2));
            animation: truckBob 1.5s ease-in-out infinite;
        }

        .truck-unit.delay-1 {
            animation-delay: 0.2s;
        }

        .truck-unit.delay-2 {
            animation-delay: 0.4s;
        }

        .loading-highway {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            height: 4px;
        }

        .highway-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                #007bff 20%, 
                #28a745 50%, 
                #007bff 80%, 
                transparent 100%);
            animation: highwayFlow 3s linear infinite;
        }

        .highway-line.delay {
            top: 2px;
            animation-delay: 1.5s;
            opacity: 0.6;
        }

        .system-loading-text {
            color: #2c3e50;
        }

        .loading-title {
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #28a745;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .loading-description {
            font-size: 14px;
            color: #6c757d;
            margin: 0 0 25px 0;
            line-height: 1.5;
        }

        .progress-container {
            margin-top: 20px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 10px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007bff, #28a745, #007bff);
            background-size: 200% 100%;
            border-radius: 10px;
            animation: progressFlow 2s ease-in-out infinite;
        }

        .progress-text {
            font-size: 12px;
            color: #6c757d;
            font-weight: 500;
            animation: textPulse 2s ease-in-out infinite;
        }

        @keyframes convoyMove {
            0%, 100% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
        }

        @keyframes truckBob {
            0%, 100% { transform: translateY(0px) rotate(-1deg); }
            50% { transform: translateY(-3px) rotate(1deg); }
        }

        @keyframes highwayFlow {
            0% { transform: translateX(-100%); opacity: 0; }
            25% { opacity: 1; }
            75% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes progressFlow {
            0% { 
                width: 10%;
                background-position: 0% 50%;
            }
            50% { 
                width: 80%;
                background-position: 100% 50%;
            }
            100% { 
                width: 95%;
                background-position: 200% 50%;
            }
        }

        @keyframes textPulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }

        /* Estilos para os indicadores de status de carregamento */
        .loading-status {
            margin-top: 15px;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .status-item {
            font-size: 12px;
            color: #6c757d;
            padding: 4px 8px;
            border-radius: 12px;
            background: rgba(40, 167, 69, 0.1);
            border: 1px solid rgba(40, 167, 69, 0.2);
            animation: statusPulse 3s ease-in-out infinite;
            white-space: nowrap;
        }

        @keyframes statusPulse {
            0%, 100% { 
                opacity: 0.6;
                transform: scale(0.95);
            }
            50% { 
                opacity: 1;
                transform: scale(1);
                background: rgba(40, 167, 69, 0.15);
            }
        }
    `;
    document.head.appendChild(styleElement);
};

// Adicionar CSS quando o script for carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCustomCSS);
} else {
    addCustomCSS();
}

console.log('✅ Sistema de alertas personalizados carregado com sucesso!');
