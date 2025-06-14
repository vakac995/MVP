import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Euro, MessageSquare, Plus } from "lucide-react";
import { 
  projectServiceGetFeaturedProjects,
  timelineServiceGetRecentTimelineActivity,
  donationServiceGetRecentDonations,
  commentServiceGetRecentComments 
} from "@/lib/sdk";
import { Project, TimelineItem, Donation, Comment } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { isLoggedIn } = useAuthContext();
  const { toast } = useToast();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<TimelineItem[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured projects
        const featuredResponse = await projectServiceGetFeaturedProjects({
          body: { limit: 5 }
        });
        setFeaturedProjects(featuredResponse.data || []);

        // Fetch recent timeline activity
        const activityResponse = await timelineServiceGetRecentTimelineActivity({
          body: { limit: 10 }
        });
        setRecentActivity(activityResponse.data || []);

        // Fetch recent donations
        const donationsResponse = await donationServiceGetRecentDonations({
          body: { limit: 5 }
        });
        setRecentDonations(donationsResponse.data || []);

        // Fetch recent comments
        const commentsResponse = await commentServiceGetRecentComments({
          body: { limit: 5 }
        });
        setRecentComments(commentsResponse.data || []);

      } catch (error) {
        console.error("Error fetching home page data:", error);
        toast({
          title: "Error",
          description: "Failed to load home page data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Dobrodošli u zaJedno Caribrod
        </h1>
        <p className="text-lg md:text-xl mb-6 opacity-90">
          Platforma za zajedničke projekte naše lokalne zajednice
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link to="/projects">Pregledaj Projekte</Link>
          </Button>
          {isLoggedIn && (
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link to="/projects/create" className="text-white hover:text-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Kreiraj Projekat
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivni Projekti</p>
                <p className="text-2xl font-bold">{featuredProjects.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Poslednje Donacije</p>
                <p className="text-2xl font-bold">{recentDonations.length}</p>
              </div>
              <Euro className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nova Aktivnost</p>
                <p className="text-2xl font-bold">{recentActivity.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novi Komentari</p>
                <p className="text-2xl font-bold">{recentComments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Izdvojeni Projekti</h2>
          <Button asChild variant="outline">
            <Link to="/projects">Pogledaj Sve</Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
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
                </div>
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
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Poslednja Aktivnost</h2>
          <Button asChild variant="outline">
            <Link to="/forum">Pogledaj Forum</Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.slice(0, 5).map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {activity.milestone_type}
                      </Badge>
                      <span>
                        {new Date(activity.created_at!).toLocaleDateString('sr-RS')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}