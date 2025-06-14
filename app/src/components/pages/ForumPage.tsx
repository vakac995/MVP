import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MessageSquare, Calendar, User, TrendingUp } from "lucide-react";
import { 
  timelineServiceGetRecentTimelineActivity,
  commentServiceGetRecentComments,
  projectServiceGetAllProjects
} from "@/lib/sdk";
import { TimelineItem, Comment, Project } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";

const sortOptions = [
  { value: "newest", label: "Najnovije" },
  { value: "oldest", label: "Najstarije" },
  { value: "most_active", label: "Najaktivnije" }
];

interface ForumItem {
  id: string;
  type: 'timeline' | 'project';
  title: string;
  description: string;
  projectId: string;
  projectTitle?: string;
  created_at: string;
  commentCount?: number;
  milestone_type?: string;
}

export default function ForumPage() {
  const { toast } = useToast();
  const [forumItems, setForumItems] = useState<ForumItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Fetch timeline items (main forum content)
      const timelineResponse = await timelineServiceGetRecentTimelineActivity({
        body: { limit: 50 }
      });
      
      // Fetch projects for context
      const projectsResponse = await projectServiceGetAllProjects();
      const projectsData = projectsResponse.data || [];
      setProjects(projectsData);

      // Transform timeline items to forum items
      const timelineItems: ForumItem[] = (timelineResponse.data || []).map(item => ({
        id: item.id!,
        type: 'timeline' as const,
        title: item.title,
        description: item.description,
        projectId: item.project_id,
        projectTitle: projectsData.find(p => p.id === item.project_id)?.title,
        created_at: item.created_at!,
        milestone_type: item.milestone_type
      }));

      // Add general project discussions
      const projectItems: ForumItem[] = projectsData.map(project => ({
        id: `project-${project.id}`,
        type: 'project' as const,
        title: `Diskusija: ${project.title}`,
        description: project.description,
        projectId: project.id!,
        projectTitle: project.title,
        created_at: project.created_at!
      }));

      setForumItems([...timelineItems, ...projectItems]);

    } catch (error) {
      console.error("Error fetching forum data:", error);
      toast({
        title: "Error",
        description: "Failed to load forum discussions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = forumItems
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query) ||
             item.description.toLowerCase().includes(query) ||
             (item.projectTitle && item.projectTitle.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most_active":
          return (b.commentCount || 0) - (a.commentCount || 0);
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
          <p className="text-gray-600">Diskusije o projektima zajednice</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>{forumItems.length} aktivnih diskusija</span>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pretražite diskusije..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sortiranje" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Forum Items */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Nema diskusija za prikaz</p>
          <Button asChild>
            <Link to="/projects">Pogledajte projekte</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon/Avatar */}
                  <div className="flex-shrink-0">
                    {item.type === 'timeline' ? (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {getMilestoneIcon(item.milestone_type || '')}
                        </span>
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          <MessageSquare className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          <Link 
                            to={item.type === 'timeline' 
                              ? `/forum/${item.id}` 
                              : `/projects/${item.projectId}`
                            }
                          >
                            {item.title}
                          </Link>
                        </h3>
                        
                        {item.projectTitle && item.type === 'timeline' && (
                          <p className="text-sm text-blue-600 mb-1">
                            <Link to={`/projects/${item.projectId}`} className="hover:underline">
                              {item.projectTitle}
                            </Link>
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {item.milestone_type && (
                          <Badge className={getMilestoneColor(item.milestone_type)}>
                            {item.milestone_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.created_at).toLocaleDateString('sr-RS')}</span>
                        </div>
                        {item.commentCount !== undefined && (
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{item.commentCount} komentara</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link 
                          to={item.type === 'timeline' 
                            ? `/forum/${item.id}` 
                            : `/projects/${item.projectId}`
                          }
                        >
                          {item.type === 'timeline' ? 'Diskusija' : 'Pogledaj projekat'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}