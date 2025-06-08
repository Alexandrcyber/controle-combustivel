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
            icon: 'info',
            title: `📊 ${message}`,
            text: details,
            showConfirmButton: false,
            timer: 30000, // 30 segundos
            timerProgressBar: true,
            didOpen: (toast) => {
                // Adicionar animação de carregamento
                const icon = toast.querySelector('.swal2-icon.swal2-info');
                if (icon) {
                    icon.style.animation = 'bounce 1.5s infinite';
                }
                
                // Adicionar classe CSS para animação customizada
                toast.style.cssText += `
                    animation: slideInUp 0.5s ease-out;
                    border-left: 4px solid #28a745;
                    backdrop-filter: blur(5px);
                    background: rgba(255, 255, 255, 0.95);
                `;
            },
            customClass: {
                popup: 'loading-data-toast'
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
