require('dotenv').config();

console.log('🔍 Testando variáveis de ambiente:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA (length: ' + process.env.DATABASE_URL.length + ')' : 'NÃO DEFINIDA');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'DEFINIDA (type: ' + typeof process.env.DB_PASSWORD + ')' : 'NÃO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verificar se DATABASE_URL tem caracteres especiais
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}
