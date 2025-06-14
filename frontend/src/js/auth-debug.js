// Debug e correção de problemas de autenticação admin
console.log('🔐 [AUTH-DEBUG] Iniciando diagnóstico de autenticação...');

// Aguardar sistema carregar
setTimeout(() => {
    // 1. Verificar se authManager existe
    if (window.authManager) {
        console.log('✅ [AUTH-DEBUG] AuthManager encontrado');
        
        // 2. Verificar usuário atual
        const user = window.authManager.getUser();
        console.log('👤 [AUTH-DEBUG] Usuário atual:', user);
        
        // 3. Verificar se está autenticado
        const isAuth = window.authManager.isAuthenticated();
        console.log('🔓 [AUTH-DEBUG] Está autenticado:', isAuth);
        
        // 4. Se for admin, verificar se os botões estão visíveis
        if (user && user.role === 'admin') {
            console.log('👑 [AUTH-DEBUG] Usuário é admin, verificando visibilidade...');
            
            // Forçar aplicação da visibilidade admin
            if (window.applyRoleVisibility) {
                window.applyRoleVisibility('admin');
                console.log('✅ [AUTH-DEBUG] Visibilidade admin aplicada');
            }
            
            // Verificar botões específicos
            const editButtons = document.querySelectorAll('.edit-caminhao, .edit-abastecimento');
            const deleteButtons = document.querySelectorAll('.delete-caminhao, .delete-abastecimento');
            const adminOnlyElements = document.querySelectorAll('.admin-only');
            
            console.log(`📊 [AUTH-DEBUG] Elementos encontrados:
                - Botões de edição: ${editButtons.length}
                - Botões de exclusão: ${deleteButtons.length} 
                - Elementos admin-only: ${adminOnlyElements.length}`);
            
            // Se não há botões visíveis, pode ser problema de timing
            if (editButtons.length === 0 && deleteButtons.length === 0) {
                console.warn('⚠️ [AUTH-DEBUG] Botões admin não encontrados, re-renderizando...');
                
                // Forçar re-renderização das tabelas
                setTimeout(() => {
                    if (typeof renderCaminhoes === 'function') {
                        console.log('🔄 [AUTH-DEBUG] Re-renderizando caminhões...');
                        renderCaminhoes();
                    }
                    if (typeof renderAbastecimentos === 'function') {
                        console.log('🔄 [AUTH-DEBUG] Re-renderizando abastecimentos...');
                        renderAbastecimentos();
                    }
                    
                    // Reaplicar visibilidade
                    if (window.applyRoleVisibility) {
                        window.applyRoleVisibility('admin');
                    }
                }, 500);
            }
        } else {
            console.log('👤 [AUTH-DEBUG] Usuário não é admin ou não está logado');
            
            // Se não está logado mas deveria estar (cache/sessão)
            const token = localStorage.getItem('auth_token');
            if (token) {
                console.log('🔄 [AUTH-DEBUG] Token encontrado, tentando re-autenticar...');
                // Força verificação do token
                window.authManager.init();
            }
        }
        
    } else {
        console.error('❌ [AUTH-DEBUG] AuthManager não encontrado');
    }
    
}, 2000);

// Monitor para mudanças de usuário
if (window.authManager) {
    // Interceptar login para garantir que a interface seja atualizada
    const originalLogin = window.authManager.login;
    if (originalLogin) {
        window.authManager.login = async function(...args) {
            const result = await originalLogin.apply(this, args);
            
            // Se login foi bem-sucedido, forçar atualização da interface
            if (result && this.isAuthenticated()) {
                console.log('🔄 [AUTH-DEBUG] Login detectado, atualizando interface...');
                
                setTimeout(() => {
                    const user = this.getUser();
                    if (user && user.role === 'admin') {
                        // Forçar re-renderização com privilégios admin
                        if (typeof renderCaminhoes === 'function') renderCaminhoes();
                        if (typeof renderAbastecimentos === 'function') renderAbastecimentos();
                        if (window.applyRoleVisibility) window.applyRoleVisibility('admin');
                        
                        console.log('✅ [AUTH-DEBUG] Interface atualizada para admin');
                    }
                }, 300);
            }
            
            return result;
        };
    }
}
