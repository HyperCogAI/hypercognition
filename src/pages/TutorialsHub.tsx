import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { InteractiveTutorialSystem } from '@/components/tutorials/InteractiveTutorialSystem';

export default function TutorialsHub() {
  return (
    <>
      <SEOHead 
        title="Learning Hub | Complete Trading Education Center"
        description="Master cryptocurrency trading with our comprehensive tutorials, interactive guides, and learning paths. From beginner to expert level."
        keywords="trading tutorials, crypto education, trading guides, learn trading, cryptocurrency basics"
      />
      
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-white">
            Learning Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Master the art of trading with our comprehensive learning center. From basics to advanced strategies, 
            we've got everything you need to succeed.
          </p>
        </div>
        
        <InteractiveTutorialSystem />
      </div>
    </>
  );
}