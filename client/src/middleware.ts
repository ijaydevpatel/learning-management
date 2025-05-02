import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { sessionClaims } = await auth(); // Fetch session claims

    // Log session claims to check if they're being retrieved correctly
    console.log("Session Claims:", sessionClaims);

    const userRole =
      (sessionClaims?.metadata as { userType: "student" | "teacher" })?.userType || "student"; // Default to 'student' if not set

    // Log the userRole to ensure it's being set correctly
    console.log("User Role:", userRole);

    if (isStudentRoute(req)) {
      // If the user is not a student, redirect to the teacher dashboard
      if (userRole !== "student") {
        const url = new URL("/teacher/courses", req.url);
        return NextResponse.redirect(url);
      }
    }

    if (isTeacherRoute(req)) {
      // If the user is not a teacher, redirect to the user dashboard
      if (userRole !== "teacher") {
        const url = new URL("/user/courses", req.url);
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    // In case of any error, allow the request to proceed without redirection
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", // Skip Next.js internals and static files
    "/(api|trpc)(.*)", // Always run for API routes
  ],
};
