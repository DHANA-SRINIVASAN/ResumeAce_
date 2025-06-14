const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Create sample resume templates
    const templates = [
        {
            name: 'Professional',
            description: 'A clean, professional template suitable for corporate environments',
            previewImageUrl: '/templates/professional-preview.png',
            isDefault: true,
        },
        {
            name: 'Creative',
            description: 'A colorful template for creative industries',
            previewImageUrl: '/templates/creative-preview.png',
            isDefault: false,
        },
        {
            name: 'Academic',
            description: 'Formal template for academic and research positions',
            previewImageUrl: '/templates/academic-preview.png',
            isDefault: false,
        },
    ];

    for (const template of templates) {
        await prisma.resumeTemplate.upsert({
            where: { name: template.name },
            update: template,
            create: template,
        });
    }

    console.log('Database has been seeded with initial data');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });