import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define validation schema for registration data
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  dreamXIUsername: z.string().min(3, { message: 'Dream11 username must be at least 3 characters' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email, dreamXIUsername, password } = result.data;
    
    // Check if user with email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Check if user with dreamXIUsername already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { dreamXIUsername }
    });
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'User with this Dream11 username already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        dreamXIUsername,
        password: hashedPassword
      }
    });
    
    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}