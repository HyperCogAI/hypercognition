import { SEOHead } from "@/components/seo/SEOHead"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Privacy Policy - HyperCognition"
        description="Privacy policy for HyperCognition AI trading platform"
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              use our AI trading agents, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (email, username)</li>
              <li>Trading preferences and settings</li>
              <li>Wallet addresses and transaction data</li>
              <li>Usage analytics and performance metrics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and improve our AI trading services</li>
              <li>Process transactions and manage your portfolio</li>
              <li>Send important notifications about your trading activities</li>
              <li>Analyze platform usage to enhance user experience</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">4. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our platform integrates with various blockchain networks and cryptocurrency exchanges. 
              These third-party services have their own privacy policies and terms of service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information. You may also 
              opt out of certain communications from us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@hypercognition.io" className="text-accent hover:underline">
                privacy@hypercognition.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}