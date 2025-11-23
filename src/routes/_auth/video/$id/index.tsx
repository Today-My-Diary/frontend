import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/video/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <div>#{id} 영상 보여줄 예정</div>;
}
