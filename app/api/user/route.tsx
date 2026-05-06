import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.DATABASE_URL) {
            // Return mock response when database is not available
            return NextResponse.json({
                id: 1,
                name: "Mock User",
                email: "mock-user@example.com"
            });
        }

        const { db } = await import("@/config/db");
        const { usersTable } = await import("@/config/schema");
        const { currentUser } = await import("@clerk/nextjs/server");
        const { eq } = await import("drizzle-orm");

        const user = await currentUser();

        const users = await db.select().from(usersTable)
            .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress as string))

        if (users?.length == 0) {
            const data = {
                name: user?.fullName ?? '',
                email: user?.primaryEmailAddress?.emailAddress as string
            }

            const result = await db.insert(usersTable).values({
                ...data
            }).returning();

            return NextResponse.json(result[0] ?? {});
        }

        return NextResponse.json(users[0] ?? {})
    } catch (error) {
        console.error('User API Error:', error);
        return NextResponse.json({ error: 'Failed to process user' }, { status: 500 });
    }
}