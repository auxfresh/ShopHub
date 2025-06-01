import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string, name: string): Promise<FirebaseUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user profile in our database
  await apiRequest("POST", "/api/users", {
    firebaseUid: result.user.uid,
    email: result.user.email,
    name: name,
    role: "customer"
  });
  
  return result.user;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Check if user exists in our database, if not create them
  try {
    await apiRequest("GET", "/api/users/profile");
  } catch (error) {
    // User doesn't exist, create them
    await apiRequest("POST", "/api/users", {
      firebaseUid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName || "User",
      role: "customer"
    });
  }
  
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
