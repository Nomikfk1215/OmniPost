import { ScrollReveal } from "./ScrollReveal";
import { PenLine, Sparkles, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PenLine,
    title: "撰写内容",
    description:
      "在编辑器中用 Markdown 撰写原始内容，添加标签、封面图，选择内容类型与风格预设。",
    detail: "Markdown 实时预览 · 图片上传 · 标签管理",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "智能适配",
    description:
      "选择目标平台，AI 自动分析内容要点，按各平台规则生成适配版本——标题、排版、语气全面优化。",
    detail: "LLM 驱动 · 跨平台风格迁移 · 结构化输出",
  },
  {
    number: "03",
    icon: Send,
    title: "一键发布",
    description:
      "预览各平台版本，手动微调后确认发布。支持模拟发布预览真实效果，也可对接真实平台 API。",
    detail: "模拟预览 · 真实平台对接 · 发布记录追踪",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="inline-block text-sm font-bold tracking-[0.15em] text-coral uppercase">
            工作流程
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
            三步完成
            <span className="gradient-text"> 跨平台 </span>
            内容分发
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-3xl border-2 border-gray-100 bg-canvas-warm p-8 transition-all duration-300 hover:border-coral/20 hover:shadow-card-hover hover:-translate-y-1"
              >
                {/* Step number — large, decorative */}
                <div className="mb-6 font-display text-7xl font-extrabold tracking-[-0.04em] text-gray-100 transition-colors duration-300 group-hover:text-coral-pale">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-5 inline-flex rounded-2xl bg-coral-pale p-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-coral" />
                </div>

                <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  {step.description}
                </p>

                {/* Detail line — appears on hover */}
                <p className="mt-4 text-sm font-semibold text-coral opacity-0 transition-all duration-300 group-hover:opacity-100">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
