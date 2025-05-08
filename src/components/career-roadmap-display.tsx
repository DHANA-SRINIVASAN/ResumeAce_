// src/components/career-roadmap-display.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { generateCareerRoadmap, type CareerRoadmapOutput, type RoadmapNode, type RoadmapEdge } from '@/ai/flows/career-roadmap-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { DraftingCompass, TrendingUp, Lightbulb, Award, BadgeDollarSign, CheckSquare, ExternalLink, Clock3, Info, Brain, BookOpen, Download, CircleHelp, CircleCheck, CircleDotDashed, Network, Layers, Sparkles as SparklesIconLucide } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import html2canvas from 'html2canvas';

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node as ReactFlowNode,
  type Edge as ReactFlowEdge,
  Position,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface CareerRoadmapDisplayProps {
  analysisResult: AnalyzeResumeOutput | null;
}

const NodeIcon: React.FC<{ stage: RoadmapNode['stage'], coverageStatus: 'covered' | 'new'}> = ({ stage, coverageStatus }) => {
  let IconComponent = CircleHelp;
  let iconColor = "text-muted-foreground";

  if (coverageStatus === 'covered') {
    IconComponent = CircleCheck;
    iconColor = "text-green-500";
  } else if (coverageStatus === 'new') {
     // Differentiate icon based on stage for new skills
    switch (stage) {
        case "Fundamentals": IconComponent = Layers; iconColor = "text-blue-500"; break;
        case "Core Skills": IconComponent = Network; iconColor = "text-indigo-500"; break;
        case "Advanced Topics": IconComponent = Brain; iconColor = "text-purple-500"; break;
        case "Optional/Nice-to-Have": IconComponent = SparklesIconLucide; iconColor = "text-pink-500"; break; 
        default: IconComponent = CircleHelp;
    }
  }
  return <IconComponent className={`w-5 h-5 mt-0.5 ${iconColor} shrink-0`} />;
};

const CustomNode = ({ data }: { data: any }) => { // data is a RoadmapNode plus coverageStatus
  let borderColor = "border-border";
  if (data.coverageStatus === 'covered') {
    borderColor = "border-green-500";
  } else {
    // Color new skills based on stage
    switch (data.stage) {
        case "Fundamentals": borderColor = "border-blue-500"; break;
        case "Core Skills": borderColor = "border-indigo-500"; break;
        case "Advanced Topics": borderColor = "border-purple-500"; break;
        case "Optional/Nice-to-Have": borderColor = "border-pink-500"; break;
        default: borderColor = "border-border";
    }
  }

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow w-72 ${borderColor} border-2`}>
      <CardHeader className="p-3">
        <div className="flex items-start space-x-2">
          <NodeIcon stage={data.stage} coverageStatus={data.coverageStatus} />
          <div>
            <CardTitle className="text-base font-semibold text-primary">{data.label}</CardTitle>
            <Badge variant="outline" className="text-xs mt-1">{data.stage}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-xs space-y-1">
        {data.description && <p className="text-muted-foreground line-clamp-3">{data.description}</p>}
        {data.resources && data.resources.length > 0 && (
          <div>
            <p className="font-medium text-foreground/90 flex items-center"><BookOpen className="w-3 h-3 mr-1 text-accent" /> Resources:</p>
            <ul className="list-disc list-inside pl-2">
              {data.resources.slice(0, 2).map((res:string, i:number) => <li key={i} className="truncate">{res}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const nodeTypes = { custom: CustomNode };

const RoadmapFlow = ({ roadmap, analysisResult }: { roadmap: CareerRoadmapOutput, analysisResult: AnalyzeResumeOutput | null }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ReactFlowEdge[]>([]);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roadmap && roadmap.nodes && roadmap.edges) {
      const stageOrder: RoadmapNode['stage'][] = ["Fundamentals", "Core Skills", "Advanced Topics", "Optional/Nice-to-Have"];
      const nodesByStage: Record<string, RoadmapNode[]> = {};
      roadmap.nodes.forEach(node => {
        if (!nodesByStage[node.stage]) {
          nodesByStage[node.stage] = [];
        }
        nodesByStage[node.stage].push(node);
      });

      const xSpacing = 320; // Horizontal space between nodes
      const ySpacing = 230; // Vertical space between stages / node rows
      const nodesPerRow = 2; // Max nodes per row within a stage visualization

      const reactFlowNodes: ReactFlowNode[] = [];
      let currentGlobalY = 50; // Initial Y offset

      stageOrder.forEach(stageName => {
        const stageNodes = nodesByStage[stageName];
        if (stageNodes && stageNodes.length > 0) {
          let stageMaxRows = 0;
          stageNodes.forEach((node, index) => {
            const isCovered = analysisResult?.skills?.some(s => s.toLowerCase().trim() === node.label.toLowerCase().trim()) ?? false;
            const coverageStatus = isCovered ? 'covered' : 'new';
            
            const rowIndex = Math.floor(index / nodesPerRow);
            const colIndex = index % nodesPerRow;
            stageMaxRows = Math.max(stageMaxRows, rowIndex + 1);

            reactFlowNodes.push({
              id: node.id,
              type: 'custom',
              data: {
                ...node, // Includes id, label, stage, description, resources
                coverageStatus: coverageStatus,
              },
              position: {
                x: colIndex * xSpacing + (rowIndex % 2 === 1 ? xSpacing / 3 : 0), // Stagger odd rows slightly
                y: currentGlobalY + rowIndex * (ySpacing * 0.75),
              },
              sourcePosition: Position.Right,
              targetPosition: Position.Left,
            });
          });
          currentGlobalY += stageMaxRows * (ySpacing * 0.75) + ySpacing * 0.5; // Move to next stage Y
        }
      });
      setNodes(reactFlowNodes);

      const reactFlowEdges: ReactFlowEdge[] = roadmap.edges.map(edge => ({
        id: `edge-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
        labelStyle: { fontSize: '10px', fill: 'hsl(var(--muted-foreground))' },
        labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.7 },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 2,
      }));
      setEdges(reactFlowEdges);
    }
  }, [roadmap, analysisResult, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: ReactFlowEdge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const handleDownloadImage = useCallback(async () => {
    if (reactFlowWrapperRef.current) {
      try {
        const canvas = await html2canvas(reactFlowWrapperRef.current, {
          useCORS: true,
          logging: false,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff', // Use theme background
        });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "career_roadmap.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("Failed to download image using html2canvas", err);
      }
    }
  }, []);


  return (
    <div ref={reactFlowWrapperRef} style={{ height: '700px', width: '100%' }} className="mt-6 border rounded-lg shadow-inner bg-muted/20 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        className="rounded-lg"
      >
        <Controls className="[&_button]:bg-background [&_button]:border-border [&_button_path]:fill-foreground" />
        <Background color="hsl(var(--border))" gap={16} />
      </ReactFlow>
      <div className="p-2 flex justify-end bg-background border-t">
        <Button onClick={handleDownloadImage} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Roadmap (PNG)
        </Button>
      </div>
    </div>
  );
};

const AdditionalInfoSection: React.FC<{ title: string; icon: React.ReactNode; items?: string[]; children?: React.ReactNode; badgeVariant?: "default" | "secondary" | "destructive" | "outline" }> = ({ title, icon, items, children, badgeVariant = "outline" }) => {
  if (!items && !children) return null;
  if (items && items.length === 0 && !children) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center mb-2">
        <span className="text-primary mr-2">{icon}</span>
        <h4 className="text-md font-semibold text-primary">{title}</h4>
      </div>
      {items && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant={badgeVariant} className="p-2 text-sm">{item}</Badge>
          ))}
        </div>
      )}
      {children && <div className="text-sm text-muted-foreground">{children}</div>}
    </div>
  );
};


export function CareerRoadmapDisplay({ analysisResult }: CareerRoadmapDisplayProps) {
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !analysisResult) {
      setError("Please enter a target role and ensure your resume has been analyzed.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    try {
      const currentRole = analysisResult.experience?.split('\n')[0]?.split(' at ')[0] || "current profile";
      const result = await generateCareerRoadmap({
        resumeAnalysis: { // Pass only necessary fields
            name: analysisResult.name,
            skills: analysisResult.skills,
            experience: analysisResult.experience,
            education: analysisResult.education,
            projects: analysisResult.projects,
            language: analysisResult.language
        },
        currentRole: currentRole,
        targetRole: targetRole,
        useRoadmapSHStructure: true, // Ensure this is passed
      });
      setRoadmap(result);
    } catch (err) {
      console.error("Error generating career roadmap:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the roadmap.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!analysisResult) {
    return null; 
  }

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-primary/10 rounded-md text-primary">
            <DraftingCompass className="w-7 h-7" />
          </span>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Career Roadmap Generator</CardTitle>
            <CardDescription>Enter your target role to get a personalized step-by-step visual plan. The graph shows learning dependencies and considers structures from roadmap.sh.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:flex sm:space-y-0 sm:space-x-3 items-end">
          <div className="flex-grow">
            <label htmlFor="targetRole" className="block text-sm font-medium text-foreground mb-1">Your Target Role:</label>
            <Input
              id="targetRole"
              placeholder="E.g., Senior Data Scientist, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading || !targetRole.trim()} className="w-full sm:w-auto">
            {isLoading ? <LoadingIndicator size="sm" text="Generating..." /> : 'Generate Roadmap'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {roadmap && !isLoading && (
          <div className="mt-6 space-y-6">
            <Card className="bg-secondary/30 p-4 rounded-lg">
              <p className="text-sm text-foreground">{roadmap.introduction}</p>
            </Card>
            
            <ReactFlowProvider>
              <RoadmapFlow roadmap={roadmap} analysisResult={analysisResult} />
            </ReactFlowProvider>
            
            <div className="grid md:grid-cols-2 gap-6">
                <AdditionalInfoSection title="Potential Certifications" icon={<Award className="w-5 h-5" />} items={roadmap.potentialCertifications} badgeVariant="secondary" />
                <AdditionalInfoSection title="Project Ideas for Portfolio" icon={<Lightbulb className="w-5 h-5" />} items={roadmap.projectIdeas} />
            </div>

            {roadmap.estimatedSalaryRange && (
              <AdditionalInfoSection title="Estimated Salary Range (General)" icon={<BadgeDollarSign className="w-5 h-5" />}>
                <p className="text-lg font-semibold text-accent">{roadmap.estimatedSalaryRange}</p>
                <p className="text-xs text-muted-foreground">Note: Actual salaries vary by location, experience, and company.</p>
              </AdditionalInfoSection>
            )}
            
            <Separator className="my-6"/>

            <CardFooter className="p-0">
                <p className="text-sm text-center w-full text-muted-foreground italic">{roadmap.closingMotivation}</p>
            </CardFooter>
            
             <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold text-blue-800 dark:text-blue-200">Roadmap Disclaimer</AlertTitle>
                <AlertDescription className="text-sm">
                    This visual roadmap is AI-generated based on common career paths (including structures similar to those on roadmap.sh) and your resume. It's a guide, not a guarantee.
                    Node border colors indicate skill coverage: Green (Covered based on resume), Stage-specific color (New skill).
                    Always research specific job requirements and adapt your plan as you learn and grow.
                </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
