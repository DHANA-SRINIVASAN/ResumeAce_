import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // In a real app, you should hash this password
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
}