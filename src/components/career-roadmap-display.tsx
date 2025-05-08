// src/components/career-roadmap-display.tsx
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { generateCareerRoadmap, type CareerRoadmapOutput, type RoadmapStep } from '@/ai/flows/career-roadmap-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { DraftingCompass, TrendingUp, Lightbulb, Award, BadgeDollarSign, CheckSquare, ExternalLink, Clock3, Info, Brain, BookOpen, Download, CircleHelp, CircleCheck, CircleDotDashed } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface CareerRoadmapDisplayProps {
  analysisResult: AnalyzeResumeOutput | null;
}

const calculateSkillCoverage = (resumeSkills: string[] = [], roadmapSkills: string[] = []): number => {
  if (!resumeSkills.length || !roadmapSkills.length) return 0;
  const lowerResumeSkills = new Set(resumeSkills.map(s => s.toLowerCase().trim()));
  const lowerRoadmapSkills = roadmapSkills.map(s => s.toLowerCase().trim());
  
  const matchedSkills = lowerRoadmapSkills.filter(rs => lowerResumeSkills.has(rs));
  return (matchedSkills.length / lowerRoadmapSkills.length) * 100;
};

const CustomNode = ({ data }: { data: any }) => {
  let NodeIcon = CircleHelp;
  let iconColor = "text-muted-foreground";
  let borderColor = "border-border";

  if (data.coverageStatus === 'covered') {
    NodeIcon = CircleCheck;
    iconColor = "text-green-500";
    borderColor = "border-green-500";
  } else if (data.coverageStatus === 'partial') {
    NodeIcon = CircleDotDashed;
    iconColor = "text-yellow-500";
    borderColor = "border-yellow-500";
  }


  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow w-72 ${borderColor} border-2`}>
      <CardHeader className="p-3">
        <div className="flex items-start space-x-2">
          <NodeIcon className={`w-5 h-5 mt-0.5 ${iconColor} shrink-0`} />
          <CardTitle className="text-base font-semibold text-primary">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-xs space-y-1">
        <p className="text-muted-foreground line-clamp-3">{data.description}</p>
        {data.timeline && <p className="flex items-center"><Clock3 className="w-3 h-3 mr-1" />{data.timeline}</p>}
        {data.skills && data.skills.length > 0 && (
          <div>
            <p className="font-medium text-foreground/90 flex items-center"><Brain className="w-3 h-3 mr-1 text-primary" /> Skills:</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {data.skills.slice(0, 3).map((skill:string, i:number) => <Badge key={i} variant="secondary" className="text-xs px-1 py-0.5">{skill}</Badge>)}
              {data.skills.length > 3 && <Badge variant="outline" className="text-xs px-1 py-0.5">+{data.skills.length - 3} more</Badge>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const nodeTypes = { custom: CustomNode };

const RoadmapFlow = ({ roadmap, analysisResult }: { roadmap: CareerRoadmapOutput, analysisResult: AnalyzeResumeOutput | null }) => {
  const { getNodes, getEdges, toPng } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    if (roadmap && roadmap.steps) {
      const initialNodes: Node[] = roadmap.steps.map((step, index) => {
        const coverage = calculateSkillCoverage(analysisResult?.skills, step.keySkillsToDevelop);
        let coverageStatus = 'new';
        if (coverage >= 75) coverageStatus = 'covered';
        else if (coverage >= 25) coverageStatus = 'partial';

        return {
          id: `step-${index}`,
          type: 'custom',
          data: { 
            label: step.title, 
            description: step.description,
            skills: step.keySkillsToDevelop,
            timeline: step.estimatedTimeline,
            resources: step.resources,
            coverageStatus: coverageStatus,
          },
          position: { x: 0, y: index * 200 }, // Adjust Y for vertical layout
        };
      });

      const initialEdges: Edge[] = roadmap.steps.slice(0, -1).map((_, index) => ({
        id: `edge-${index}-${index + 1}`,
        source: `step-${index}`,
        target: `step-${index + 1}`,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      }));
      
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [roadmap, analysisResult, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const handleDownloadImage = useCallback(() => {
    toPng().then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "career_roadmap.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(err => console.error("Failed to download image", err));
  }, [toPng]);


  return (
    <div style={{ height: '600px', width: '100%' }} className="mt-6 border rounded-lg shadow-inner bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="rounded-lg"
      >
        <Controls className="[&_button]:bg-background [&_button]:border-border [&_button_path]:fill-foreground" />
        <Background color="hsl(var(--border))" gap={16} />
      </ReactFlow>
      <div className="p-2 flex justify-end">
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
        resumeAnalysis: analysisResult,
        currentRole: currentRole,
        targetRole: targetRole,
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
            <CardDescription>Enter your target role to get a personalized step-by-step visual plan, inspired by <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">roadmap.sh</a>.</CardDescription>
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
                    This visual roadmap is AI-generated based on common career paths (inspired by sites like roadmap.sh) and your resume. It's a guide, not a guarantee.
                    Always research specific job requirements and adapt your plan as you learn and grow. Node colors indicate skill coverage: Green (Covered), Yellow (Partial), Grey (New).
                </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
