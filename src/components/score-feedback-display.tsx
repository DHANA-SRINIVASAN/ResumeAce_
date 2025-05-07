"use client";

import type { AnalyzeResumeAndScoreOutput } from '@/ai/flows/resume-score';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, TrendingUp, Award } from 'lucide-react';

interface ScoreFeedbackDisplayProps {
  scoreData: AnalyzeResumeAndScoreOutput;
}

export function ScoreFeedbackDisplay({ scoreData }: ScoreFeedbackDisplayProps) {
  const { score, feedback } = scoreData;
  const isStrongResume = score > 50;

  const scoreColor = isStrongResume ? 'text-accent' : score > 30 ? 'text-yellow-500' : 'text-destructive';
  const Icon = isStrongResume ? Award : score > 30 ? TrendingUp : AlertTriangle;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4"
          style={{borderColor: isStrongResume ? 'hsl(var(--accent))' : score > 30 ? 'hsl(var(--yellow-500))' : 'hsl(var(--destructive))'}}>
      <CardHeader className="text-center pb-4">
         <div className={cn("inline-block p-3 rounded-full mx-auto mb-3", isStrongResume ? "bg-accent/10" : "bg-muted")}>
            <Icon className={cn("w-10 h-10", scoreColor)} />
        </div>
        <CardTitle className="text-2xl font-bold">Resume Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className={cn("text-7xl font-extrabold mb-2", scoreColor)}>
          {score}
          <span className="text-3xl text-muted-foreground">/100</span>
        </p>
        <CardDescription className={cn("text-lg font-medium", isStrongResume ? "text-accent" : "text-muted-foreground")}>
          {feedback}
        </CardDescription>
        {isStrongResume && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 mr-2"/> Great job! Your resume looks strong.
            </p>
        )}
        {score <= 50 && score > 30 && (
             <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-2"/> There's room for improvement. Keep refining!
            </p>
        )}
         {score <= 30 && (
             <p className="mt-4 text-sm text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 mr-2"/> Your resume needs significant improvement.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
