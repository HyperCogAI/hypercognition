import { Star, Quote } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { generateDefaultAvatar } from "@/utils/avatarUtils"

const testimonials = [
  {
    name: "Alex Chen",
    role: "DeFi Trader",
    avatar: generateDefaultAvatar("Alex Chen", "initials"),
    rating: 5,
    content: "HyperCognition's AI agents have completely transformed my trading strategy. The autonomous learning capabilities are incredible - my portfolio has grown 340% in just 6 months.",
    highlight: "340% portfolio growth"
  },
  {
    name: "Sarah Martinez",
    role: "Crypto Fund Manager",
    avatar: generateDefaultAvatar("Sarah Martinez", "initials"), 
    rating: 5,
    content: "Managing multiple strategies used to be overwhelming. Now our AI agents handle everything automatically while I focus on high-level decisions. The risk management is phenomenal.",
    highlight: "Phenomenal risk management"
  },
  {
    name: "David Kim",
    role: "Quantitative Analyst",
    avatar: generateDefaultAvatar("David Kim", "initials"),
    rating: 5,
    content: "The reinforcement learning algorithms are state-of-the-art. I've deployed 12 different agents, each optimized for specific market conditions. The results speak for themselves.",
    highlight: "12 optimized agents"
  }
]

export const Testimonials = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/10 via-background to-card/10" />
      <div className="absolute inset-0 cyber-grid opacity-5" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/5 border border-accent/15 text-accent text-sm font-medium">
            💬 What Traders Say
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Trusted by
            <span className="text-accent"> Professionals</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how leading traders and fund managers are leveraging 
            HyperCognition to achieve consistent, automated returns.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-6 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:bg-card/60"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <Quote className="w-4 h-4 text-accent" />
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-white leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Highlight */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                  ✨ {testimonial.highlight}
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>

        {/* Trust Indicator */}
        <div className="text-center mt-12 pt-8 border-t border-border/30">
          <p className="text-muted-foreground">
            Join <span className="text-accent font-semibold">50,000+</span> traders already using AI to maximize their DeFi returns
          </p>
        </div>
      </div>
    </section>
  )
}