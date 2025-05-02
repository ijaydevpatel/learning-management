import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers for student and teacher routes
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

    // Check if the route is for a student
    if (isStudentRoute(req)) {
      // If the user is not a student, redirect to the teacher dashboard
      if (userRole !== "student") {
        const url = new URL("/teacher/courses", req.url);
        console.log("Redirecting to Teacher Courses"); // Debugging log
        return NextResponse.redirect(url);
      }
    }

    // Check if the route is for a teacher
    if (isTeacherRoute(req)) {
      // If the user is not a teacher, redirect to the user dashboard
      if (userRole !== "teacher") {
        const url = new URL("/user/courses", req.url);
        console.log("Redirecting to User Courses"); // Debugging log
        return NextResponse.redirect(url);
      }
    }

    // In case of any error or no redirection, just proceed
    return NextResponse.next();
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
