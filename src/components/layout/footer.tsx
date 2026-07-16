import Link from "next/link";
import { Plane } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Plane size={15} />
              </span>
              SkyBook
            </div>
            <p className="mt-3 text-sm text-foreground/60">
              A premium flight-booking demo. Mock data only — nothing here is a real reservation.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground/60">
              <li><Link href="/search" className="hover:text-foreground">Search flights</Link></li>
              <li><Link href="/flight-status" className="hover:text-foreground">Flight status</Link></li>
              <li><Link href="/manage-booking" className="hover:text-foreground">Manage booking</Link></li>
              <li><Link href="/deals" className="hover:text-foreground">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground/60">
              <li><Link href="/dashboard" className="hover:text-foreground">My Trips</Link></li>
              <li><Link href="/auth/login" className="hover:text-foreground">Log in</Link></li>
              <li><Link href="/auth/signup" className="hover:text-foreground">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">SkyBook</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground/60">
              <li><Link href="/admin" className="hover:text-foreground">Admin panel</Link></li>
              <li><span className="opacity-70">Portfolio / demo project</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-black/8 pt-6 text-xs text-foreground/50 dark:border-white/10">
          © {new Date().getFullYear()} SkyBook Demo. Not affiliated with any airline. All flights, prices, and bookings are simulated.
        </div>
      </div>
    </footer>
  );
}
