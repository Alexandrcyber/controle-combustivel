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

console.log('✅ Sistema de alertas personalizados carregado com sucesso!');
