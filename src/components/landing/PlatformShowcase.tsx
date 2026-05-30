import { ScrollReveal } from "./ScrollReveal";
import { cn } from "@/lib/utils";
import { MessageCircle, HelpCircle, Heart, PlayCircle } from "lucide-react";

type PlatformCard = {
  id: string;
  name: string;
  icon: typeof MessageCircle;
  tagline: string;
  description: string;
  bgClass: string;
  iconBg: string;
  iconColor: string;
  borderClass: string;
};

const platforms: PlatformCard[] = [
  {
    id: "wechat",
    name: "微信公众号",
    icon: MessageCircle,
    tagline: "深度阅读 · 私域沉淀",
    description:
      "自动生成摘要与封面建议，段落间距与字重适配移动端阅读节奏，支持互动引导与原文链接。",
    bgClass: "hover:bg-wechat-light/30",
    iconBg: "bg-wechat-light",
    iconColor: "text-wechat",
    borderClass: "border-wechat/15 hover:border-wechat/30",
  },
  {
    id: "zhihu",
    name: "知乎",
    icon: HelpCircle,
    tagline: "专业表达 · 知识分享",
    description:
      "智能生成开篇结论与结尾互动引导，适配知乎问答风格，优化标题关键词密度与话题标签。",
    bgClass: "hover:bg-zhihu-light/30",
    iconBg: "bg-zhihu-light",
    iconColor: "text-zhihu",
    borderClass: "border-zhihu/15 hover:border-zhihu/30",
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    icon: Heart,
    tagline: "种草笔记 · 视觉优先",
    description:
      "生成符合小红书风格的口语化标题与笔记正文，搭配 emoji 与话题标签，提供封面图建议。",
    bgClass: "hover:bg-xiaohongshu-light/30",
    iconBg: "bg-xiaohongshu-light",
    iconColor: "text-xiaohongshu",
    borderClass: "border-xiaohongshu/15 hover:border-xiaohongshu/30",
  },
  {
    id: "bilibili",
    name: "Bilibili",
    icon: PlayCircle,
    tagline: "专栏创作 · 社区互动",
    description:
      "适配 B 站专栏排版规范，优化分节结构与段落节奏，添加互动元素与专栏封面配置。",
    bgClass: "hover:bg-bilibili-light/30",
    iconBg: "bg-bilibili-light",
    iconColor: "text-bilibili",
    borderClass: "border-bilibili/15 hover:border-bilibili/30",
  },
];

export function PlatformShowcase() {
  return (
    <section className="bg-canvas-warm px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <ScrollReveal className="mb-16 text-center">
          <span className="inline-block text-sm font-bold tracking-[0.15em] text-coral uppercase">
            支持平台
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
            一个编辑器
            <br className="sm:hidden" />
            <span className="gradient-text"> 四处 </span>
            发布
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
            每个平台都有专属的适配规则与风格定制，确保内容在任意渠道都呈现最佳效果
          </p>
        </ScrollReveal>

        {/* Platform cards — asymmetric grid */}
        <ScrollReveal stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={cn(
                  "group relative rounded-3xl border-2 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
                  i === 0 && "lg:mt-0",
                  i === 1 && "lg:mt-8",
                  i === 2 && "lg:mt-4",
                  i === 3 && "lg:mt-12",
                  p.borderClass,
                  p.bgClass
                )}
              >
                {/* Platform icon — large and distinctive */}
                <div
                  className={cn(
                    "mb-5 inline-flex rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110",
                    p.iconBg
                  )}
                >
                  <Icon className={cn("h-7 w-7", p.iconColor)} />
                </div>

                <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-ink">
                  {p.name}
                </h3>
                <p className="mt-1.5 text-sm font-semibold text-ink-muted">
                  {p.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {p.description}
                </p>

                {/* Subtle corner decoration on hover */}
                <div
                  className={cn(
                    "absolute right-0 top-0 h-20 w-20 rounded-bl-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    p.iconBg,
                    "bg-opacity-40"
                  )}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
