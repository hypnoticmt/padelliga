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
        <NavLink href="/protected" icon="🏠">
          Dashboard
        </NavLink>
        <NavLink href="/protected/create-team" icon="➕">
          Create a Team
        </NavLink>
        <NavLink href="/protected/join-team" icon="🤝">
          Join a Team
        </NavLink>
        <NavLink href="/protected/leaderboards" icon="🏆">
          Leaderboards
        </NavLink>
        <NavLink href="/protected/edit-profile" icon="✏️">
          Edit Profile
        </NavLink>
        {isAdmin && (
          <NavLink href="/protected/admin" icon="⚙️">
            Admin
          </NavLink>
        )}
      </nav>

      {/* User Menu - Desktop */}
      <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          👋 Hey, {userName}!
        </span>
        <form action={signOutAction}>
          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Sign up
      </Link>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
    >
      <span className="text-base group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}

function MobileMenu({ userName, isAdmin }: { userName: string | undefined; isAdmin: boolean }) {
  return (
    <details className="relative">
      <summary className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <span>☰</span>
        Menu
      </summary>
      
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            👋 {userName}
          </p>
        </div>
        
        <div className="py-1">
          <MobileNavLink href="/protected" icon="🏠">
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/protected/create-team" icon="➕">
            Create a Team
          </MobileNavLink>
          <MobileNavLink href="/protected/join-team" icon="🤝">
            Join a Team
          </MobileNavLink>
          <MobileNavLink href="/protected/leaderboards" icon="🏆">
            Leaderboards
          </MobileNavLink>
          <MobileNavLink href="/protected/edit-profile" icon="✏️">
            Edit Profile
          </MobileNavLink>
          {isAdmin && (
            <MobileNavLink href="/protected/admin" icon="⚙️">
              Admin
            </MobileNavLink>
          )}
        </div>
        
        <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
          <form action={signOutAction} className="px-2">
            <button 
              type="submit"
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              🚪 Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function MobileNavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-base">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}