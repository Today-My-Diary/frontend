import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/my/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>마이 페이지!</div>;
}
