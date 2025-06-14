import { Search, Plus, ListFilter, Import } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  projectServiceGetAllProjects,
  projectServiceSearchProjects,
  projectServiceGetProjectsByCategory,
  badgeServiceGetProjectBadges 
} from "@/lib/sdk";
import { Project } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { BadgeList } from "@/components/badge/BadgeDisplay";

const categories = [
  "All",
  "Infrastructure", 
  "Community",
  "Education",
  "Environment",
  "Culture",
  "Sport",
  "Technology",
  "Health"
];

const sortOptions = [
  { value: "newest", label: "Najnoviji" },
  { value: "votes", label: "Najviše glasova" },
  { value: "funding", label: "Najviše sredstava" },
  { value: "oldest", label: "Najstariji" }
];

export default function ProjectsPage() {
  const { isLoggedIn } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedCategory === "All") {
        response = await projectServiceGetAllProjects();
      } else {
        response = await projectServiceGetProjectsByCategory({
          body: { category: selectedCategory }
        });
      }
      
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProjects();
      return;
    }

    try {
      setLoading(true);
      const response = await projectServiceSearchProjects({
        body: { query: searchQuery.trim() }
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error searching projects:", error);
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return (b.vote_count || 0) - (a.vote_count || 0);
      case "funding":
        return (b.current_funding || 0) - (a.current_funding || 0);
      case "oldest":
        return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
      default: // newest
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
    }
  });

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Component for displaying project badges
  const ProjectBadges = ({ projectId }: { projectId: string }) => {
    const [badges, setBadges] = useState<any[]>([]);
    
    useEffect(() => {
      const loadBadges = async () => {
        try {
          const response = await badgeServiceGetProjectBadges({
            body: { project_id: projectId }
          });
          if (response.data) {
            setBadges(response.data);
          }
        } catch (error) {
          console.error('Error loading project badges:', error);
        }
      };
      
      loadBadges();
    }, [projectId]);
    
    if (badges.length === 0) return null;
    
    const badgeData = badges.map(b => b.badge);
    
    return (
      <div className="mb-3">
        <BadgeList badges={badgeData} maxDisplay={3} size="sm" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekti</h1>
          <p className="text-gray-600">Istražite projekte naše zajednice</p>
        </div>
        {isLoggedIn && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/projects/create" className="text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novi Projekat
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pretražite projekte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Kategorija" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "All" ? "Sve kategorije" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <Import className="mr-2 h-4 w-4" />
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
      </div>

      {/* Projects Grid */}
      {sortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Nema projekata za prikaz</p>
          {isLoggedIn && (
            <Button asChild>
              <Link to="/projects/create">
                <Plus className="mr-2 h-4 w-4" />
                Kreirajte prvi projekat
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                {/* Funding Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Prikupljeno:</span>
                    <span className="font-medium">€{project.current_funding?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ciljno:</span>
                    <span className="font-medium">€{project.budget.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, ((project.current_funding || 0) / project.budget) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {((project.current_funding || 0) / project.budget * 100).toFixed(1)}% od cilja
                  </div>
                </div>

                {/* Project Badges */}
                <ProjectBadges projectId={project.id!} />
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {project.vote_count || 0} glasova
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/projects/${project.id}`}>Pogledaj</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}