import { GlobeComponent } from "./interactive-globe";

export default function GlobeSection() {
  return (
    <div className="flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-5xl rounded-2xl border border-border bg-card overflow-hidden relative">
        {/* Ambient glow - Màu xanh y tế */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left content */}
          <div className="flex-1 flex flex-col justify-center p-10 md:p-14 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6 w-fit">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Medical Analysis Active
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
              Artificial Intelligence
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-emerald-400 bg-clip-text text-transparent">
                For Your Health
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed mb-8">
              Connecting thousands of product medicinal properties through a
              Semantic Search network. We bridge the gap between symptoms and
              healthcare solutions in just seconds.{" "}
            </p>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-foreground">1,000+</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">&lt;1s</p>
                <p className="text-xs text-muted-foreground">Analysis</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">
                  Ministry of Health Compliant
                </p>
              </div>
            </div>
          </div>

          {/* Right — Globe */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-0 min-h-[400px]">
            <GlobeComponent size={460} />
          </div>
        </div>
      </div>
    </div>
  );
}
