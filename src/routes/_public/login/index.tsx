import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-screen-xs p-6">
        <h1 className="font-bold text-2xl text-center">Welcome!</h1>
        <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>Google</a>
      </div>
    </div>
  );
}
