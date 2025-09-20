import { SEOHead } from "@/components/seo/SEOHead"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Cookie Policy - HyperCognition"
        description="Cookie policy for HyperCognition AI trading platform"
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              analyzing how you use our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="border border-border/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies are necessary for the website to function properly. They enable basic 
                  features like page navigation, access to secure areas, and authentication.
                </p>
              </div>
              
              <div className="border border-border/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
              </div>
              
              <div className="border border-border/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Preference Cookies</h3>
                <p className="text-muted-foreground text-sm">
                  These cookies allow our website to remember information that changes the way the website 
                  behaves or looks, like your preferred language or theme.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Third-Party Cookies</h2>
            <p className="text-muted-foreground">
              We may use third-party services that place cookies on your device, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Analytics providers (for usage statistics)</li>
              <li>Web3 wallet providers (for blockchain connectivity)</li>
              <li>Security services (for fraud prevention)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Managing Cookies</h2>
            <p className="text-muted-foreground">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
              <li>Opt-out links: Some third-party services provide direct opt-out options</li>
              <li>Cookie preferences: Use our cookie preference center (if available)</li>
            </ul>
            <p className="text-muted-foreground text-sm mt-4">
              Note: Disabling essential cookies may affect website functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please contact us at{" "}
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