const { pool } = require('./database.js');

async function checkUser() {
    try {
        console.log('🔍 Verificando usuário admin no banco...');
        
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', ['admin@gmail.com']);
        
        if (result.rows.length > 0) {
            console.log('✅ Usuário admin encontrado:', {
                id: result.rows[0].id,
                email: result.rows[0].email,
                nome: result.rows[0].nome,
                ativo: result.rows[0].ativo,
                created_at: result.rows[0].created_at
            });
        } else {
            console.log('❌ Usuário admin não encontrado');
            
            // Tentar criar o usuário
            console.log('🔧 Criando usuário admin...');
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin', 10);
            
            await pool.query(`
                INSERT INTO usuarios (email, senha_hash, nome, ativo) 
                VALUES ($1, $2, $3, $4)
            `, ['admin@gmail.com', hashedPassword, 'Administrador', true]);
            
            console.log('✅ Usuário admin criado com sucesso!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

checkUser();
