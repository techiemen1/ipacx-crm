const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mode = process.argv[2]; // 'sqlite' or 'postgres'

if (!['sqlite', 'postgres'].includes(mode)) {
    console.error('Usage: node scripts/switch-db.js [sqlite|postgres]');
    process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

console.log(`Switching to ${mode.toUpperCase()} mode...`);

// 1. Update schema.prisma
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (mode === 'postgres') {
    schemaContent = schemaContent.replace('provider = "sqlite"', 'provider = "postgresql"');
} else {
    schemaContent = schemaContent.replace('provider = "postgresql"', 'provider = "sqlite"');
}
fs.writeFileSync(schemaPath, schemaContent);
console.log('✔ Updated prisma/schema.prisma');

// 2. Update .env
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');

    const sqliteUrl = 'DATABASE_URL="file:./dev.db"';
    const postgresUrl = 'DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/ipacx_crm?schema=public"';

    if (mode === 'postgres') {
        // Comment out sqlite, ensure postgres is active
        if (envContent.includes(sqliteUrl)) {
            envContent = envContent.replace(sqliteUrl, `# ${sqliteUrl}`);
        }
        if (envContent.includes(`# ${postgresUrl}`)) {
            envContent = envContent.replace(`# ${postgresUrl}`, postgresUrl);
        } else if (!envContent.includes(postgresUrl)) {
            envContent += `\n${postgresUrl}\n`;
        }
    } else {
        // Comment out postgres, ensure sqlite is active
        if (envContent.includes(postgresUrl)) {
            envContent = envContent.replace(postgresUrl, `# ${postgresUrl}`);
        }
        if (envContent.includes(`# ${sqliteUrl}`)) {
            envContent = envContent.replace(`# ${sqliteUrl}`, sqliteUrl);
        } else if (!envContent.includes(sqliteUrl)) {
            envContent += `\n${sqliteUrl}\n`;
        }
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✔ Updated .env');
} else {
    console.warn('⚠ .env file not found. Please set DATABASE_URL manually.');
}

// 3. Advise on next steps
console.log('\n------------------------------------------------');
console.log(`Successfully switched configuration to ${mode.toUpperCase()}.`);
console.log('Next steps:');
if (mode === 'postgres') {
    console.log('1. Ensure Docker is running: docker-compose up -d');
    console.log('2. Run migrations: npx prisma db push');
} else {
    console.log('1. Run migrations: npx prisma db push');
}
console.log('------------------------------------------------\n');
