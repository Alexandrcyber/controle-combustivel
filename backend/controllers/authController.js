const { pool } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Usuário padrão admin
const DEFAULT_ADMIN = {
    email: 'admin@gmail.com',
    password: 'admin',
    role: 'admin',
    name: 'Administrador'
};

// Criar usuário padrão se não existir
async function createDefaultAdmin() {
    try {
        const existingAdmin = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [DEFAULT_ADMIN.email]
        );

        if (existingAdmin.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
            const adminId = `admin_${Date.now()}`;
            
            await pool.query(`
                INSERT INTO usuarios (id, email, senha, role, nome, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
                adminId,
                DEFAULT_ADMIN.email,
                hashedPassword,
                DEFAULT_ADMIN.role,
                DEFAULT_ADMIN.name
            ]);
            
            console.log('✅ Usuário admin padrão criado');
        }
    } catch (error) {
        console.error('Erro ao criar usuário admin padrão:', error);
    }
}

// Login do usuário
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email e senha são obrigatórios' 
            });
        }

        // Buscar usuário
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }

        const user = result.rows[0];

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.senha);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'controle_combustivel_jwt_secret_2025',
            { expiresIn: '24h' }
        );

        // Atualizar último login
        await pool.query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Remover senha da resposta
        const { senha: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword,
            token,
            expiresIn: '24h'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor' 
        });
    }
}

// Verificar token
async function verifyToken(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido' 
            });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'controle_combustivel_jwt_secret_2025'
        );

        // Buscar usuário atualizado
        const result = await pool.query(
            'SELECT id, email, role, name, created_at, last_login FROM usuarios WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Usuário não encontrado' 
            });
        }

        res.json({
            valid: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(401).json({ 
            error: 'Token inválido' 
        });
    }
}

// Logout (no caso de JWT, é feito no frontend)
async function logout(req, res) {
    res.json({ 
        success: true, 
        message: 'Logout realizado com sucesso' 
    });
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ 
            error: 'Acesso negado. Token não fornecido.' 
        });
    }

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'controle_combustivel_jwt_secret_2025'
        );
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ 
            error: 'Token inválido' 
        });
    }
}

// Middleware de autorização para admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
        });
    }
    next();
}

// Middleware de autorização flexível
function requireRole(roles = []) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Acesso negado. Permissão insuficiente.' 
            });
        }
        next();
    };
}

// Middleware de autenticação opcional (permite acesso público)
function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        // Sem token - acesso público
        req.user = null;
        req.isAuthenticated = false;
        return next();
    }

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'controle_combustivel_jwt_secret_2025'
        );
        
        req.user = decoded;
        req.isAuthenticated = true;
        next();
    } catch (error) {
        // Token inválido - tratar como acesso público
        req.user = null;
        req.isAuthenticated = false;
        next();
    }
}

module.exports = {
    login,
    logout,
    verifyToken,
    authenticateToken,
    requireAdmin,
    requireRole,
    optionalAuth,
    createDefaultAdmin
};
