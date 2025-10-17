"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { Bell, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/interview-pro", label: "Interview" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <nav>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={38} height={32} />
            <h2 className="text-primary-100">MockMate</h2>
          </Link>
        </nav>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>

              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </div>

              <Button
                variant="outline"
                onClick={async () => {
                  await signOut(auth);
                  setUser(null);
                  router.push("/sign-in"); // redirect after sign out
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
