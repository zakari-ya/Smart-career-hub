import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ResumeList } from "../components/resume/ResumeList";
import { Activity, FileText, Briefcase, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export function Dashboard() {
  const resumes = useQuery(api.resumes.getMyResumes);

  // undefined = Convex loading; null = no auth token yet (safe to show 0)
  const resumeCount = resumes?.length ?? 0;
  const activeJobsCount = 0;
  const avgScore = 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/resume-scanner">
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumeCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {resumeCount === 0 ? "Upload your first resume" : "Manage in Resume Scanner"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Tracked across your kanban board
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore > 0 ? `${avgScore}%` : "--"}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Based on recent job match analyses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Resumes</CardTitle>
            <CardDescription>
              Recently uploaded resumes ready for AI review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeList />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest AI analyses and tracking updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
              Activity feed placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
