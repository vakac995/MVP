import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, User, MessageSquare, Target } from "lucide-react";
import { 
  timelineServiceGetTimelineItemById,
  commentServiceGetTimelineItemComments,
  projectServiceGetProjectById
} from "@/lib/sdk";
import { TimelineItem, Comment, Project } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";
import CommentSection from "../components/CommentSection";

export default function ThreadPage() {
  const { timelineItemId } = useParams<{ timelineItemId: string }>();
  const { toast } = useToast();
  
  const [timelineItem, setTimelineItem] = useState<TimelineItem | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (timelineItemId) {
      fetchThreadData();
    }
  }, [timelineItemId]);

  const fetchThreadData = async () => {
    if (!timelineItemId) return;
    
    try {
      setLoading(true);
      
      // Fetch timeline item
      const timelineResponse = await timelineServiceGetTimelineItemById({
        body: { timeline_item_id: timelineItemId }
      });
      
      if (!timelineResponse.data) {
        toast({
          title: "Error",
          description: "Discussion thread not found.",
          variant: "destructive",
        });
        return;
      }
      
      setTimelineItem(timelineResponse.data);

      // Fetch related project
      const projectResponse = await projectServiceGetProjectById({
        body: { project_id: timelineResponse.data.project_id }
      });
      setProject(projectResponse.data || null);

      // Fetch comments for this timeline item
      const commentsResponse = await commentServiceGetTimelineItemComments({
        body: { timeline_item_id: timelineItemId }
      });
      setComments(commentsResponse.data || []);

    } catch (error) {
      console.error("Error fetching thread data:", error);
      toast({
        title: "Error",
        description: "Failed to load discussion thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "planning":
        return "📋";
      case "milestone":
        return "🎯";
      case "update":
        return "📊";
      case "completion":
        return "✅";
      default:
        return "💬";
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "milestone":
        return "bg-blue-100 text-blue-800";
      case "update":
        return "bg-purple-100 text-purple-800";
      case "completion":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!timelineItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Diskusija nije pronađena.</p>
        <Button asChild className="mt-4">
          <Link to="/forum">Povratak na forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/forum">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Povratak na forum
          </Link>
        </Button>
        <div className="text-sm text-gray-500">
          Diskusija • {new Date(timelineItem.created_at!).toLocaleDateString('sr-RS')}
        </div>
      </div>

      {/* Project Context */}
      {project && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projekat:</p>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h3>
              </div>
              <Badge variant="secondary">{project.category}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Item Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">
                  {getMilestoneIcon(timelineItem.milestone_type)}
                </span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{timelineItem.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <Badge className={getMilestoneColor(timelineItem.milestone_type)}>
                    {timelineItem.milestone_type}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(timelineItem.created_at!).toLocaleDateString('sr-RS')}</span>
                  </div>
                  {timelineItem.target_date && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Cilj: {new Date(timelineItem.target_date).toLocaleDateString('sr-RS')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {timelineItem.is_completed && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✅ Završeno
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {timelineItem.description}
          </p>
          
          {timelineItem.completed_date && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Završeno:</strong> {new Date(timelineItem.completed_date).toLocaleDateString('sr-RS')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussion Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Diskusija ({comments.length})
          </h2>
        </div>
        
        <CommentSection 
          projectId={timelineItem.project_id}
          timelineItemId={timelineItem.id}
          comments={comments}
          onCommentAdded={fetchThreadData}
        />
      </div>
    </div>
  );
}