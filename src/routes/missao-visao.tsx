import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/missao-visao")({
  beforeLoad: () => {
    throw redirect({ to: "/quem-somos", hash: "missao-visao" });
  },
  component: () => null,
});
