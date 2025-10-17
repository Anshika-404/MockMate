"use server";

import { auth as firebaseAuth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import admin from "firebase-admin";


// Add missing type imports or definitions
import type { SignUpParams, SignInParams, User, Interview, GetLatestInterviewsParams } from "@/types/index";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;


export async function auth(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await firebaseAuth.verifySessionCookie(sessionCookie, true);

    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userDoc.exists) return null;

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (err) {
    console.error("Failed to get current user", err);
    return null;
  }
}



export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();


  const sessionCookie = await firebaseAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
   
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

      
    await db.collection("users").doc(uid).set({
      name,
      email,
      
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

   
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account instead.",
      };

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log("");

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  const interviewsSnapshot = await db
    .collection("interviews")
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  if (interviewsSnapshot.empty) return null;

  return interviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  let query = db
    .collection("interviews")
    .where("finalized", "==", true)
    .orderBy("createdAt", "desc");

  if (userId) {
    query = query.where("userId", "==", userId);
  }

  const interviewsSnapshot = await query.limit(limit).get();

  if (interviewsSnapshot.empty) return null;

  return interviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function createInterview(
  interview: Omit<Interview, "id" | "createdAt"> & { createdAt?: any }
) {
  const docRef = await db.collection("interviews").add({
    ...interview,
    createdAt: admin.firestore.Timestamp.now(),
  });

  return docRef.id;
}
export async function getInterviewById(id: string): Promise<Interview | null> {
  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Interview;
}
