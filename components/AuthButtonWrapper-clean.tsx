import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { signOutAction } from "@/app/actions";

export default async function AuthButtonWrapper() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch player info for name and admin status
  let userName = user?.email;
  let isAdmin = false;
  
  if (user) {
    const { data: playerData } = await supabase
      .from("players")
      .select("name, surname, is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (playerData) {
      isAdmin = playerData.is_admin ?? false;
      // Use full name if available, otherwise fall back to email
      if (playerData.name && playerData.surname) {
        userName = `${playerData.name} ${playerData.surname}`;
      } else if (playerData.name) {
        userName = playerData.name;
      }
    }
  }

  return user ? (
    <div className="flex items-center gap-2">
      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        <NavLink href="/protected">
          Dashboard
        </NavLink>
        <NavLink href="/protected/create-team">
          Create Team
        </NavLink>
        <NavLink href="/protected/join-team">
          Join Team
        </NavLink>
        <NavLink href="/protected/leaderboards">
          Leaderboards
        </NavLink>
        <NavLink href="/protected/edit-profile">
          Profile
        </NavLink>
        {isAdmin && (
          <NavLink href="/protected/admin">
            Admin
          </NavLink>
        )}
      </nav>

      {/* User Menu - Desktop */}
      <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {userName}
        </span>
        <form action={signOutAction}>
          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <MobileMenu userName={userName} isAdmin={isAdmin} />
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/sign-in"
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Sign up
      </Link>
    </div>
  );
}

function NavLink({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-500 rounded-lg transition-all duration-200"
    >
      {children}
    </Link>
  );
}

function MobileMenu({ userName, isAdmin }: { userName: string | undefined; isAdmin: boolean }) {
  return (
    <details className="relative">
      <summary className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors list-none">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menu
      </summary>
      
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {userName}
          </p>
        </div>
        
        <div className="py-1">
          <MobileNavLink href="/protected">
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/protected/create-team">
            Create Team
          </MobileNavLink>
          <MobileNavLink href="/protected/join-team">
            Join Team
          </MobileNavLink>
          <MobileNavLink href="/protected/leaderboards">
            Leaderboards
          </MobileNavLink>
          <MobileNavLink href="/protected/edit-profile">
            Profile
          </MobileNavLink>
          {isAdmin && (
            <MobileNavLink href="/protected/admin">
              Admin
            </MobileNavLink>
          )}
        </div>
        
        <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
          <form action={signOutAction} className="px-2">
            <button 
              type="submit"
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function MobileNavLink({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 transition-colors"
    >
      {children}
    </Link>
  );
}
