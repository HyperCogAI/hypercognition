import { SEOHead } from "@/components/seo/SEOHead"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, FileText, Users } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    })
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Contact Us - HyperCognition"
        description="Get in touch with the HyperCognition team for support, partnerships, or general inquiries"
      />
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Have questions about our AI trading agents? Need technical support? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card/20 border-border/30">
            <CardHeader>
              <CardTitle className="text-white">Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-32"
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-card/20 border-border/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">General Inquiries</h4>
                  <a href="mailto:contact@hypercognition.io" className="text-accent hover:underline">
                    contact@hypercognition.io
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Technical Support</h4>
                  <a href="mailto:support@hypercognition.io" className="text-accent hover:underline">
                    support@hypercognition.io
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Partnerships</h4>
                  <a href="mailto:partnerships@hypercognition.io" className="text-accent hover:underline">
                    partnerships@hypercognition.io
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-border/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white">Telegram</h4>
                  <a href="https://t.me/Donut_Swap" className="text-accent hover:underline">
                    Join our community chat
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-white">X (Twitter)</h4>
                  <a href="https://x.com/HyperCogAI" className="text-accent hover:underline">
                    @HyperCogAI
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-border/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Looking for technical documentation or API references?
                </p>
                <a 
                  href="https://whitepaper.hypercognition.io/hypercognition/" 
                  className="text-accent hover:underline"
                >
                  View Documentation →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}