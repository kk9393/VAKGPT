"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loginWithGoogle, logout, getSession } from "@/lib/auth";

interface User {
  userid: string;
  name: string;
  email: string;
  profile_picture?: string;
}

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); 

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session) {
        setUser(session as User);
      }
    };
    fetchSession();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {!user ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Sign in</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Sign in with Google</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Button onClick={loginWithGoogle} className="w-full">
                Login with Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex items-center gap-4">
          <p>Welcome, {user.name}</p>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
