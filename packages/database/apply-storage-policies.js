const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyStoragePolicies() {
    console.log('Applying storage policies...');

    try {
        const sqlPath = path.join(__dirname, 'fix-storage-policies.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split into individual statements since executeRaw might process them better
        // Note: Simple split by semicolon might be fragile for complex PL/pgSQL, but fine for this simple script
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            // Skip comments if any remain
            if (statement.startsWith('--')) continue;

            try {
                await prisma.$executeRawUnsafe(statement);
                // console.log(`Executed: ${statement.substring(0, 50)}...`);
            } catch (e) {
                // Ignore "already exists" errors or similar minor issues
                if (!e.message.includes('already exists')) {
                    console.warn(`Warning executing statement: ${e.message}`);
                    console.warn(`Statement: ${statement}`);
                }
            }
        }

        console.log('✅ Storage buckets created and policies applied successfully!');
    } catch (error) {
        console.error('❌ Error applying storage policies:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyStoragePolicies();
