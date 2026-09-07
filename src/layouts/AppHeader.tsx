import { Logo } from './Logo';
import { NavLink } from './NavLink';

export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3 sm:px-6">
        <Logo brand="🐣" label="LifeStyle Studio" />
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink href="/">Timetable</NavLink>
          <NavLink href="/members">Members</NavLink>
        </nav>
      </div>
    </header>
  );
}
