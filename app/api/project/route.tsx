import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.DATABASE_URL) {
            // Return mock response when database is not available
            return NextResponse.json({
                projectId: crypto.randomUUID(),
                userId: "mock-user@example.com",
                device: "mobile",
                userInput: "Mock project for demonstration"
            });
        }

        const { userInput, device, projectId } = await req.json();

        const { db } = await import("@/config/db");
        const { ProjectTable } = await import("@/config/schema");
        const { auth, currentUser } = await import("@clerk/nextjs/server");
        const { eq } = await import("drizzle-orm");

        const user = await currentUser();

        const { has } = await auth();
        const hasPremiumAccess = has({ plan: 'unlimted' })

        const projects = await db.select().from(ProjectTable)
            .where(eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string))

        if (projects.length >= 2 && !true) { // Pro mode enabled for everyone
            return NextResponse.json({ msg: 'Limit Exceed' })
        }

        const result = await db.insert(ProjectTable).values({
            projectId: projectId,
            userId: user?.primaryEmailAddress?.emailAddress as string,
            device: device,
            userInput: userInput
        }).returning();

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const projectId = await req.nextUrl.searchParams.get('projectId');

        if (!process.env.DATABASE_URL) {
            // Return mock response when database is not available
            if (!projectId) {
                return NextResponse.json([]);
            }
            return NextResponse.json({
                projectDetail: {
                    projectId: projectId,
                    projectName: "Mock Project",
                    device: "mobile",
                    userInput: "Mock project for demonstration",
                    theme: "NETFLIX"
                },
                screenConfig: []
            });
        }

        const { db } = await import("@/config/db");
        const { ProjectTable, ScreenConfigTable } = await import("@/config/schema");
        const { currentUser } = await import("@clerk/nextjs/server");
        const { and, desc, eq } = await import("drizzle-orm");

        const user = await currentUser()

        if (!projectId) {
            const result = await db.select().from(ProjectTable)
                .where(eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string))
                .orderBy(desc(ProjectTable.id));

            // Fetch first screen code for each project
            const projectsWithSneakPeek = await Promise.all(result.map(async (project) => {
                const screen = await db.select().from(ScreenConfigTable)
                    .where(eq(ScreenConfigTable.projectId, project.projectId))
                    .limit(1);

                return {
                    ...project,
                    sneakPeekCode: screen[0]?.code || null
                };
            }));

            return NextResponse.json(projectsWithSneakPeek);

        }

        const result = await db.select().from(ProjectTable)
            .where(and(eq(ProjectTable.projectId, projectId as string), eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string)))

        const ScreenConfig = await db.select().from(ScreenConfigTable)
            .where(eq(ScreenConfigTable.projectId, projectId as string))
            .orderBy(desc(ScreenConfigTable.id))

        return NextResponse.json({
            projectDetail: result[0],
            screenConfig: ScreenConfig
        });
    }
    catch (e) {
        console.error('GET Error:', e);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    try {
        const { projectName, theme, projectId, screenShot } = await req.json();

        if (!process.env.DATABASE_URL) {
            // Return mock response when database is not available
            return NextResponse.json({
                projectId: projectId,
                projectName: projectName || "Mock Project",
                theme: theme || "NETFLIX",
                screenshot: screenShot || null
            });
        }

        const { db } = await import("@/config/db");
        const { ProjectTable } = await import("@/config/schema");
        const { eq } = await import("drizzle-orm");

        const result = await db.update(ProjectTable).set({
            projectName: projectName,
            theme: theme,
            screenshot: screenShot as string ?? null

        }).where(eq(ProjectTable.projectId, projectId))
            .returning();

        return NextResponse.json(result[0])
    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}