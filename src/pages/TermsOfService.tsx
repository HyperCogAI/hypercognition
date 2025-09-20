import { SEOHead } from "@/components/seo/SEOHead"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Terms of Service - HyperCognition"
        description="Terms of service for HyperCognition AI trading platform"
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using HyperCognition, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">2. Description of Service</h2>
            <p className="text-muted-foreground">
              HyperCognition provides AI-powered autonomous trading agents for cryptocurrency and DeFi markets. 
              Our platform allows users to co-own and operate trading agents through our marketplace system.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. Risk Disclosure</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-semibold mb-2">⚠️ Important Risk Warning</p>
              <p className="text-muted-foreground text-sm">
                Trading cryptocurrencies and using automated trading systems involves significant risk. 
                Past performance does not guarantee future results. You may lose all or part of your investment.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be 18+ years old to use this service</li>
              <li>You are responsible for compliance with local laws and regulations</li>
              <li>You must secure your account credentials and wallet access</li>
              <li>You acknowledge the risks of automated trading</li>
              <li>You will not use the service for illegal activities</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              HyperCognition shall not be liable for any direct, indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of the service, including 
              but not limited to trading losses, system downtime, or technical errors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of HyperCognition are owned by us and are 
              protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">7. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your access to our service at any time, without prior notice, 
              for conduct that we believe violates these Terms or is harmful to other users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">8. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:legal@hypercognition.io" className="text-accent hover:underline">
                legal@hypercognition.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}