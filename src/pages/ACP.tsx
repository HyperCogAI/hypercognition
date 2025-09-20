import { ACPDashboard } from "@/components/acp/ACPDashboard"
import { Navigation } from "@/components/layout/Navigation"

const ACP = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <ACPDashboard />
      </main>
    </div>
  )
}

export default ACP