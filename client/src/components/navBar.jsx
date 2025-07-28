import React from "react";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const NavBar = () => {
  const { data: session } = useSession();

  return (
    // <div className="text-2xl border-b border-sidebar-border flex justify-between p-4 bg-card text-card-foreground shadow-sm">
    //   <div className="font-semibold">JSXsmith</div>
    //   <div className="flex items-center gap-4">
    //     {session ? (
    //       <>
    //         <div className="flex items-center text-muted-foreground text-sm">
    //           Welcome, {session.user.name}
    //         </div>
    //         <img
    //           src={session.user.image}
    //           alt="User Avatar"
    //           className="w-8 h-8 rounded-full border border-sidebar-border"
    //         />
    //         <Button variant="outline" onClick={() => signOut()}>
    //           Logout
    //         </Button>
    //       </>
    //     ) : (
    //       <Button variant="outline" onClick={() => signIn()}>
    //         Login
    //       </Button>
    //     )}
    //     <ModeToggle />
    //     <SidebarTrigger />
    //   </div>
    // </div>
    <div className="border-b bg-card p-4 flex items-center gap-4">
      <SidebarTrigger />
      <div className="flex-1">
        <h1 className="text-xl font-semibold">JSX Smith - AI Code Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Generate React components instantly
        </p>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <img
              src={session.user.image}
              alt="User Avatar"
              className="w-8 h-8 rounded-full border border-sidebar-border"
            />
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={() => signIn()}>Sign In</Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};

export default NavBar;
