import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "oscarama | blog" }] }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-18 pb-32 max-sm:pt-4 sm:w-2xl md:w-3xl">
        <h1 className="text-3xl font-bold">blog | work in progress..</h1>
        <div className="mt-8 flex flex-col">
          <a href="/">back home</a>
          <a className="mt-2" href="https://eng.coloop.ai" target="_blank" rel="noreferrer">
            coloop engineering blog
          </a>
        </div>
      </div>
    </div>
  );
}
