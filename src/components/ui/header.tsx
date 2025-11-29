import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-background-white/50 sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 py-4 shadow-md backdrop-blur-md md:px-16">
      <Link to="/">
        <Logo />
      </Link>
      <div>{children}</div>
    </header>
  );
}
