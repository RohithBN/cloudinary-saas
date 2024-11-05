import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicApiRoute = createRouteMatcher(['/api/videos']);
const isPublicRoute = createRouteMatcher(['/sign-up', '/sign-in', '/', '/home']);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentPath = new URL(req.url);
    const isHomePage = currentPath.pathname === '/home';
    const isAccessingApi = currentPath.pathname.startsWith('/api');

    console.log(`User ID: ${userId}, Current Path: ${currentPath.pathname}`);

    if (userId) {
        // Redirect logged-in users trying to access public routes (except home)
        if (isPublicRoute(req) && !isHomePage) {
            console.log('Redirecting logged-in user to home page');
            return NextResponse.redirect(new URL('/home', req.url));
        }
    } else {
        // Redirect unauthenticated users from private routes
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            console.log('Redirecting unauthenticated user to sign-in page');
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        // Redirect unauthenticated users from private API routes
        if (isAccessingApi && !isPublicApiRoute(req)) {
            console.log('Redirecting unauthenticated user from private API');
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
