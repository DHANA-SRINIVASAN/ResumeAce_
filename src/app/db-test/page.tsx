import DbTest from '@/components/db-test';

export default function DbTestPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">MySQL Database Test</h1>
            <p className="mb-6">
                This page demonstrates basic MySQL database operations using Prisma.
                Make sure you have set up your MySQL database and run migrations.
            </p>
            <DbTest />
        </div>
    );
}