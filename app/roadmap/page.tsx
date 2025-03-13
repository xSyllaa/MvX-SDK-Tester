"use client";

import { Timeline } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function RoadmapPage() {
  const roadmapData = [
    {
      title: "Q2 2025",
      content: (
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-bold text-card-foreground mb-4">
              <Badge variant="outline" className="mr-2 bg-primary/10">
                Short-Term Goals
              </Badge>
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Enhanced AI Capabilities</strong> - Develop more context-aware assistance for SDK and smart contract interactions
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Expanded SDK/ABI Library</strong> - Add more examples and templates for common smart contract patterns
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Improved User Experience</strong> - Refine the interface based on community feedback to make SDK testing more intuitive
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Community Contributions System</strong> - Launch platform for community members to share components and examples
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Q3 2025",
      content: (
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-bold text-card-foreground mb-4">
              <Badge variant="outline" className="mr-2 bg-primary/10">
                Medium-Term Goals
              </Badge>
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Advanced SDK & ABI Processing</strong> - Build more powerful tools for working with complex smart contracts and ABIs
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Component Ecosystem Expansion</strong> - Create a comprehensive library of reusable components for common MultiversX development tasks
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>AI-Powered Component Intelligence</strong> - Implement AI systems that suggest optimizations and improvements for component implementations
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Q4 2025",
      content: (
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-bold text-card-foreground mb-4">
              <Badge variant="outline" className="mr-2 bg-primary/10">
                Long-Term Vision
              </Badge>
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>AI-Powered Contract Analysis</strong> - Develop advanced AI tools for security auditing and optimization of smart contracts
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Advanced Visualization & Simulation</strong> - Create interactive visualizations for complex contract interactions and transaction flows
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">
                  <strong>Comprehensive Learning Ecosystem</strong> - Build an integrated learning platform with tutorials, documentation, and interactive examples
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen">
      <Timeline data={roadmapData} />
    </main>
  );
} 