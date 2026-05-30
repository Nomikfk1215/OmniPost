import { ScrollReveal } from "./ScrollReveal";
import { Play } from "lucide-react";

export function VideoDemoSection() {
  return (
    <section className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="text-center">
          <span className="inline-block text-sm font-bold tracking-[0.15em] text-coral uppercase">
            功能演示
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
            看看 OmniPost
            <span className="gradient-text"> 如何工作 </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
            从撰写到发布，三分钟了解完整工作流程
          </p>
        </ScrollReveal>

        {/* Video placeholder card */}
        <ScrollReveal className="mt-12">
          <div className="group relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-canvas-warm transition-all hover:border-coral/30 hover:shadow-elevated">
            {/* Placeholder content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              {/* Play button */}
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-card transition-all group-hover:scale-110 group-hover:shadow-elevated">
                <Play className="ml-1 h-8 w-8 text-coral" fill="currentColor" />
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-ink-soft">
                  功能演示视频
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  即将上线，敬请期待
                </p>
              </div>
            </div>

            {/* Subtle gradient overlay at edges */}
            <div
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-coral/3 via-transparent to-bilibili/3"
              aria-hidden="true"
            />

            {/* Fake UI chrome to suggest a video player */}
            <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-3xl bg-gradient-to-t from-black/5 to-transparent" />
            <div className="absolute bottom-4 left-6 h-1.5 w-3/4 rounded-full bg-black/10" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
