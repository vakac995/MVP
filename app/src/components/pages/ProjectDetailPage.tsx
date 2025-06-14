import { Heart, Euro, Calendar, User, MessageSquare, Share, Flag, Clock, Target, Pencil, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { 
  projectServiceGetProjectById,
  projectServiceGetProjectStatistics,
  timelineServiceGetProjectTimeline,
  commentServiceGetProjectComments,
  votingServiceVoteForProject,
  votingServiceRemoveVoteForProject,
  votingServiceHasUserVoted,
  donationServiceCreateDonation
} from "@/lib/sdk";
import { Project, TimelineItem, Comment } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import CommentSection from "../components/CommentSection";
import DonationDialog from "../components/DonationDialog";
import ShareDialog from "../components/ShareDialog";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, userDetails } = useAuthContext();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && isLoggedIn) {
      checkVoteStatus();
    }
  }, [projectId, isLoggedIn]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const projectResponse = await projectServiceGetProjectById({
        body: { project_id: projectId }
      });
      
      if (!projectResponse.data) {
        toast({
          title: "Error",
          description: "Project not found.",
          variant: "destructive",
        });
        navigate("/projects");
        return;
      }
      
      setProject(projectResponse.data);

      // Fetch project statistics
      const statsResponse = await projectServiceGetProjectStatistics({
        body: { project_id: projectId }
      });
      setStatistics(statsResponse.data);

      // Fetch timeline
      const timelineResponse = await timelineServiceGetProjectTimeline({
        body: { project_id: projectId }
      });
      setTimeline(timelineResponse.data || []);

      // Fetch comments
      const commentsResponse = await commentServiceGetProjectComments({
        body: { project_id: projectId }
      });
      setComments(commentsResponse.data || []);

    } catch (error) {
      console.error("Error fetching project data:", error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    if (!projectId) return;
    
    try {
      const response = await votingServiceHasUserVoted({
        body: { project_id: projectId }
      });
      setHasVoted(response.data || false);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const handleVote = async () => {
    if (!projectId || !isLoggedIn) return;
    
    try {
      setVotingLoading(true);
      
      if (hasVoted) {
        await votingServiceRemoveVoteForProject({
          body: { project_id: projectId }
        });
        setHasVoted(false);
        toast({
          title: "Uspešno",
          description: "Glas je uklonjen.",
        });
      } else {
        await votingServiceVoteForProject({
          body: { project_id: projectId }
        });
        setHasVoted(true);
        toast({
          title: "Uspešno",
          description: "Uspešno ste glasali za projekat!",
        });
      }
      
      // Refresh project data to get updated vote count
      fetchProjectData();
      
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVotingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Završen";
      case "in_progress":
        return "U toku";
      case "planning":
        return "Planiranje";
      default:
        return status;
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "planning":
        return <Clock className="h-4 w-4" />;
      case "milestone":
        return <Target className="h-4 w-4" />;
      case "update":
        return <MessageSquare className="h-4 w-4" />;
      case "completion":
        return <CircleCheck className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const isOwner = project && userDetails && project.user_id === userDetails.user_uuid;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Projekat nije pronađen.</p>
        <Button asChild className="mt-4">
          <Link to="/projects">Povratak na projekte</Link>
        </Button>
      </div>
    );
  }

  const fundingPercentage = project.budget > 0 ? 
    ((project.current_funding || 0) / project.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
                {project.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isLoggedIn && (
              <>
                <Button 
                  onClick={handleVote}
                  disabled={votingLoading}
                  variant={hasVoted ? "secondary" : "default"}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
                  {hasVoted ? 'Glasano' : 'Glasaj'}
                  {votingLoading && '...'}
                </Button>
                
                <Button 
                  onClick={() => setShowDonationDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Euro className="h-4 w-4" />
                  Doniraj
                </Button>
              </>
            )}

            <Button 
              onClick={() => setShowShareDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Podeli
            </Button>

            {isOwner && (
              <Button asChild variant="outline">
                <Link to={`/projects/${project.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Izmeni
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Project Stats Card */}
        <Card className="lg:w-80">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Funding Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Prikupljeno</span>
                  <span>{fundingPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(100, fundingPercentage)} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">€{project.current_funding?.toFixed(2) || '0.00'}</span>
                  <span className="text-gray-500">od €{project.budget.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Statistics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Glasovi</span>
                  </div>
                  <span className="font-medium">{statistics?.vote_count || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Donacija</span>
                  </div>
                  <span className="font-medium">{statistics?.donation_count || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Komentari</span>
                  </div>
                  <span className="font-medium">{statistics?.comment_count || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Kreiran</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(project.created_at!).toLocaleDateString('sr-RS')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tok Projekta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getMilestoneIcon(item.milestone_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.milestone_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {item.target_date && (
                        <span>Cilj: {new Date(item.target_date).toLocaleDateString('sr-RS')}</span>
                      )}
                      {item.completed_date && (
                        <span>Završeno: {new Date(item.completed_date).toLocaleDateString('sr-RS')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <CommentSection 
        projectId={project.id!}
        comments={comments}
        onCommentAdded={fetchProjectData}
      />

      {/* Dialogs */}
      <DonationDialog
        open={showDonationDialog}
        onOpenChange={setShowDonationDialog}
        project={project}
        onDonationComplete={fetchProjectData}
      />

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        project={project}
      />
    </div>
  );
}