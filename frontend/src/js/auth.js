// Sistema de Autenticação
class AuthManager {
    constructor() {
        this.token = null;
        this.user = null;
        this.tokenKey = 'fuel_control_token';
        this.init();
    }

    init() {
        // Carregar token do localStorage ao inicializar
        this.token = localStorage.getItem(this.tokenKey);
        
        // Sempre mostrar a interface principal primeiro (acesso público)
        this.showMainApp();
        
        // Verificar se o usuário já está logado
        if (this.token) {
            this.verifyToken();
        } else {
            // Aplicar visibilidade para usuário não autenticado
            this.applyGuestVisibility();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Toggle de senha
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Botão de login na navbar
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        // Limpar formulário quando modal for fechado
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.addEventListener('hidden.bs.modal', () => {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.reset();
                }
                // Garantir limpeza completa do backdrop
                this.cleanupModalBackdrop();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmitBtn');
        const spinner = document.getElementById('loginSpinner');

        // Validação básica
        if (!email || !password) {
            this.showAlert('Por favor, preencha todos os campos.', 'warning');
            return;
        }

        // Mostrar loading
        submitBtn.disabled = true;
        spinner.style.display = 'inline-block';

        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login bem-sucedido
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem(this.tokenKey, this.token);
                
                // Fechar modal de login com limpeza completa
                this.closeLoginModal();
                
                this.showAlert('Login realizado com sucesso!', 'success');
                
                // Atualizar UI do usuário
                this.updateUserInterface();
                
                // Recarregar dados do dashboard
                if (window.loadDashboard) {
                    window.loadDashboard();
                }
            } else {
                this.showAlert(data.message || 'Erro ao fazer login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Esconder loading
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    }

    async verifyToken() {
        if (!this.token) {
            this.applyGuestVisibility();
            return false;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.updateUserInterface();
                return true;
            } else {
                // Token inválido
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            this.logout();
            return false;
        }
    }

    async handleLogout(e) {
        e.preventDefault();
        
        try {
            // Tentar fazer logout no servidor
            if (this.token) {
                await fetch(`${window.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            this.logout();
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem(this.tokenKey);
        
        // Não mostrar tela de login, manter na interface principal
        // mas aplicar visibilidade de convidado
        this.applyGuestVisibility();
        
        // Ocultar menu do usuário
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // Mostrar botão de login
        this.showLoginButton();
        
        this.showAlert('Logout realizado com sucesso!', 'success');
    }

    showMainApp() {
        // A aplicação principal já está sempre visível
        // Este método mantido por compatibilidade
        
        // Chamar a função de carregamento do dashboard se disponível
        if (window.loadDashboard) {
            window.loadDashboard();
        }
    }

    updateUserInterface() {
        if (!this.user) return;

        // Atualizar informações do usuário na navbar
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userMenu = document.getElementById('userMenu');

        if (userName) {
            userName.textContent = this.user.nome || 'Usuário';
        }

        if (userRole) {
            const roleText = this.user.role === 'admin' ? 'Administrador' : 'Usuário';
            userRole.textContent = roleText;
        }

        if (userMenu) {
            userMenu.style.display = 'block';
        }

        // Ocultar botão de login e mostrar menu do usuário
        this.hideLoginButton();

        // Mostrar/esconder botões baseado no papel do usuário
        this.updateUIBasedOnRole();
        
        // Aplicar visibilidade baseada em papel usando a função global
        if (window.applyRoleVisibility) {
            window.applyRoleVisibility(this.user.role);
        }
    }

    updateUIBasedOnRole() {
        const isAdmin = this.user && this.user.role === 'admin';
        
        // Botões de ações admin (criar, editar, deletar)
        const adminButtons = document.querySelectorAll('.admin-only');
        adminButtons.forEach(btn => {
            btn.style.display = isAdmin ? 'inline-block' : 'none';
        });

        // Adicionar classe CSS baseada no papel
        document.body.classList.toggle('user-admin', isAdmin);
        document.body.classList.toggle('user-regular', !isAdmin);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('loginPassword');
        const toggleIcon = document.querySelector('#togglePassword i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('bi-eye');
            toggleIcon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('bi-eye-slash');
            toggleIcon.classList.add('bi-eye');
        }
    }

    showAlert(message, type = 'info') {
        // Usar SweetAlert2 se disponível, senão usar alert simples
        if (window.Swal) {
            const icon = type === 'error' ? 'error' : 
                        type === 'warning' ? 'warning' : 
                        type === 'success' ? 'success' : 'info';
            
            Swal.fire({
                title: type === 'success' ? 'Sucesso!' : 
                       type === 'error' ? 'Erro!' : 
                       type === 'warning' ? 'Atenção!' : 'Informação',
                text: message,
                icon: icon,
                timer: type === 'success' ? 2000 : null,
                showConfirmButton: type !== 'success'
            });
        } else {
            alert(message);
        }
    }

    // Métodos para uso externo
    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.token;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    // Método para fazer requisições autenticadas
    async authenticatedFetch(url, options = {}) {
        if (!this.token) {
            throw new Error('Usuário não autenticado');
        }

        const authOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.token}`
            }
        };

        const response = await fetch(url, authOptions);

        // Se o token expirou, fazer logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Token expirado');
        }

        return response;
    }

    // Aplicar visibilidade para usuários não autenticados (convidados)
    applyGuestVisibility() {
        // Ocultar todos os elementos admin-only
        const adminElements = document.querySelectorAll('.admin-only, .role-admin');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });

        // Mostrar apenas elementos de visualização
        const viewElements = document.querySelectorAll('.guest-view, .public-view');
        viewElements.forEach(element => {
            element.style.display = 'block';
        });

        // Aplicar visibilidade usando a função global se disponível
        if (window.applyRoleVisibility) {
            window.applyRoleVisibility('guest');
        }
    }

    // Mostrar botão de login na navbar
    showLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }

    // Ocultar botão de login e mostrar menu do usuário
    hideLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
    }

    // Mostrar modal de login em vez da tela completa
    showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // Limpar formulário
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.reset();
            }
            
            const bsModal = new bootstrap.Modal(loginModal);
            bsModal.show();
        }
    }

    // Fechar modal de login com limpeza completa do backdrop
    closeLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // Tentar fechar usando a instância do Bootstrap
            const bsModal = bootstrap.Modal.getInstance(loginModal);
            if (bsModal) {
                bsModal.hide();
            } else {
                // Se não houver instância, criar uma temporária para fechar
                const tempModal = new bootstrap.Modal(loginModal);
                tempModal.hide();
            }

            // Aguardar um pouco e depois fazer limpeza manual do backdrop
            setTimeout(() => {
                this.cleanupModalBackdrop();
            }, 300);
        }
    }

    // Limpeza manual do backdrop do modal
    cleanupModalBackdrop() {
        // Remover todos os backdrops que possam ter ficado
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Remover classes do body que podem ter ficado
        document.body.classList.remove('modal-open');
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Remover atributos que podem ter ficado
        const modalOpen = document.querySelector('.modal-open');
        if (modalOpen) {
            modalOpen.classList.remove('modal-open');
        }
        
        console.log('🧹 Limpeza do modal backdrop realizada');
    }

    // Método público para forçar limpeza (útil para depuração)
    forceCleanupModal() {
        this.cleanupModalBackdrop();
    }

    // Função utilitária universal para fechar qualquer modal com limpeza completa
    static closeModalSafely(modalId, callback = null) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.warn(`Modal ${modalId} não encontrado`);
            return;
        }

        try {
            // Tentar fechar usando a instância do Bootstrap
            const bsModal = bootstrap.Modal.getInstance(modalElement);
            if (bsModal) {
                bsModal.hide();
            } else {
                // Se não houver instância, criar uma temporária para fechar
                const tempModal = new bootstrap.Modal(modalElement);
                tempModal.hide();
            }

            // Aguardar um pouco e depois fazer limpeza manual do backdrop
            setTimeout(() => {
                AuthManager.cleanupModalBackdropStatic();
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, 300);
        } catch (error) {
            console.error('Erro ao fechar modal:', error);
            // Força limpeza mesmo com erro
            AuthManager.cleanupModalBackdropStatic();
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    }

    // Versão estática da limpeza do backdrop
    static cleanupModalBackdropStatic() {
        // Remover todos os backdrops que possam ter ficado
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Remover classes do body que podem ter ficado
        document.body.classList.remove('modal-open');
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Remover atributos que podem ter ficado
        const modalOpen = document.querySelector('.modal-open');
        if (modalOpen) {
            modalOpen.classList.remove('modal-open');
        }
        
        console.log('🧹 Limpeza universal do modal backdrop realizada');
    }
}

// Instanciar o gerenciador de autenticação globalmente
window.authManager = new AuthManager();
