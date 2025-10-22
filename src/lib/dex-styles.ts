export const DEX_STYLES = {
  card: {
    container: "relative w-full max-w-lg mx-auto",
    glow: "absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur opacity-75 animate-gradient-shift",
    main: "relative border-border/20 bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl"
  },
  input: {
    container: "relative p-4 bg-muted/30 rounded-2xl border border-border/30 hover:border-border/50 transition-all group",
    field: "text-right text-2xl font-semibold bg-transparent border-none outline-none w-full",
    label: "text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium"
  },
  token: {
    button: "flex items-center gap-2 px-3 py-2 rounded-xl bg-background/80 hover:bg-background transition-all border border-border/20",
    logo: "w-6 h-6 rounded-full",
    symbol: "font-semibold text-sm"
  },
  swap: {
    button: "p-3 rounded-xl bg-background border-2 border-border/50 hover:border-primary/50 hover:bg-muted transition-all hover:rotate-180 duration-300 shadow-lg"
  },
  modal: {
    content: "border-border/30 bg-background/95 backdrop-blur-2xl",
    item: "w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer",
    search: "bg-muted/30 border-border/30"
  }
} as const;
