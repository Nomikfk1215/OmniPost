import { ScrollReveal } from "./ScrollReveal";
import { Brain, Palette, Eye, Shield, Zap, Settings2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "LLM 智能理解",
    description:
      "提取内容核心要点、关键词与受众定位，不丢失重要细节，确保跨平台版本忠实于原文意图。",
  },
  {
    icon: Palette,
    title: "风格预设系统",
    description:
      "提供 casual 与 professional 两种风格预设，支持自定义标题、正文、组件、强调格式的适配偏好。",
  },
  {
    icon: Eye,
    title: "平台预览渲染",
    description:
      "每个平台版本提供仿真预览——微信公众号文章样式、知乎回答样式、小红书笔记卡片、B 站专栏样式，所见即所得。",
  },
  {
    icon: Shield,
    title: "内容校验",
    description:
      "自动检测标题长度、标签数量、emoji 使用、封面尺寸等平台规则，给出通过/警告/错误三级校验结果。",
  },
  {
    icon: Zap,
    title: "模拟 & 真实发布",
    description:
      "先模拟发布查看效果，确认无误后再推送到真实平台。已支持微信公众号真实发布，更多平台接入中。",
  },
  {
    icon: Settings2,
    title: "灵活 LLM 配置",
    description:
      "支持 OpenAI 兼容接口，可自定义 API Key、Base URL 与模型。密钥 AES-256-GCM 加密存储，安全可控。",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-canvas-warm px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="inline-block text-sm font-bold tracking-[0.15em] text-coral uppercase">
            核心能力
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
            不止是
            <span className="gradient-text"> 格式转换 </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
            从内容理解到风格迁移，从校验预览到安全发布，全链路覆盖
          </p>
        </ScrollReveal>

        {/* Bento-style grid */}
        <ScrollReveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/20 hover:shadow-card-hover"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex rounded-2xl bg-coral-pale p-2.5 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-coral-dark" />
                </div>

                <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {feature.description}
                </p>

                {/* Subtle hover accent */}
                <div
                  className="absolute bottom-0 right-0 h-0 w-0 rounded-tl-3xl bg-coral/5 transition-all duration-300 group-hover:h-14 group-hover:w-14"
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
