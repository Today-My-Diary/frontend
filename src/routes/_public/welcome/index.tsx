import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/welcome/")({
  component: WelcomePage,
});

function WelcomePage() {
  return <div>Welcome to our application!</div>;
}
