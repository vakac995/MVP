import { User, FolderOpen, Heart, Euro, MessageSquare, Calendar, TrendingUp, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  projectServiceGetAllProjects,
  votingServiceGetUserVotes,
  donationServiceGetUserDonations,
  donationServiceGetUserDonationTotal,
  commentServiceGetUserComments
} from "@/lib/sdk";
import { Project, Vote, Donation, Comment } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { BadgeShowcase } from "@/components/badge/BadgeShowcase";

export default function ProfilePage() {
  const { userDetails } = useAuthContext();
  const { toast } = useToast();
  
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [totalDonated, setTotalDonated] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userBadgeCount, setUserBadgeCount] = useState<number>(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch all projects to filter user's projects
      const allProjectsResponse = await projectServiceGetAllProjects();
      const allProjects = allProjectsResponse.data || [];
      const userOwnedProjects = allProjects.filter(
        project => project.user_id === userDetails?.user_uuid
      );
      setUserProjects(userOwnedProjects);

      // Fetch user votes
      const votesResponse = await votingServiceGetUserVotes();
      setUserVotes(votesResponse.data || []);

      // Fetch user donations
      const donationsResponse = await donationServiceGetUserDonations();
      setUserDonations(donationsResponse.data || []);

      // Fetch total donated amount
      const totalResponse = await donationServiceGetUserDonationTotal();
      setTotalDonated(totalResponse.data || 0);

      // Fetch user comments
      const commentsResponse = await commentServiceGetUserComments();
      setUserComments(commentsResponse.data || []);

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {userDetails?.email ? getUserInitials(userDetails.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {userDetails?.email || "Korisnik"}
                </h1>
                <p className="text-gray-600 mb-2">
                  Član zaJedno Caribrod zajednice
                </p>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Pridružen {userDetails?.created_at ? 
                      new Date(userDetails.created_at).toLocaleDateString('sr-RS') : 
                      'nedavno'
                    }
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Izmeni profil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projekti</p>
                <p className="text-2xl font-bold">{userProjects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Glasovi</p>
                <p className="text-2xl font-bold">{userVotes.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Donacije</p>
                <p className="text-2xl font-bold">€{totalDonated.toFixed(2)}</p>
              </div>
              <Euro className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Komentari</p>
                <p className="text-2xl font-bold">{userComments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Značke</p>
                <p className="text-2xl font-bold">{userBadgeCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Moji Projekti ({userProjects.length})</TabsTrigger>
          <TabsTrigger value="votes">Glasovi ({userVotes.length})</TabsTrigger>
          <TabsTrigger value="donations">Donacije ({userDonations.length})</TabsTrigger>
          <TabsTrigger value="comments">Komentari ({userComments.length})</TabsTrigger>
          <TabsTrigger value="badges">Značke</TabsTrigger>
        </TabsList>

        {/* User Projects */}
        <TabsContent value="projects" className="space-y-4">
          {userProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nemate kreiranih projekata
                </h3>
                <p className="text-gray-600 mb-4">
                  Predložite projekat koji će poboljšati našu zajednicu.
                </p>
                <Button asChild>
                  <Link to="/projects/create">Kreiraj novi projekat</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userProjects.map((project) => (
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
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Prikupljeno:</span>
                        <span className="font-medium">€{project.current_funding?.toFixed(2) || '0.00'}</span>
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
                      <div className="space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/projects/${project.id}/edit`}>Izmeni</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link to={`/projects/${project.id}`}>Pogledaj</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Votes */}
        <TabsContent value="votes" className="space-y-4">
          {userVotes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Niste glasali ni za jedan projekat
                </h3>
                <p className="text-gray-600 mb-4">
                  Pregledajte projekte i glasajte za one koji vam se sviđaju.
                </p>
                <Button asChild>
                  <Link to="/projects">Pregledaj projekte</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userVotes.map((vote) => (
                <Card key={vote.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                        <div>
                          <p className="font-medium">Glasano za projekat</p>
                          <p className="text-sm text-gray-500">
                            {new Date(vote.created_at!).toLocaleDateString('sr-RS')}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/projects/${vote.project_id}`}>Pogledaj projekat</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Donations */}
        <TabsContent value="donations" className="space-y-4">
          {userDonations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Euro className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Niste donirali ni jednom projektu
                </h3>
                <p className="text-gray-600 mb-4">
                  Finansijski podržite projekte koji vam se sviđaju.
                </p>
                <Button asChild>
                  <Link to="/projects">Pregledaj projekte</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userDonations.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Euro className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">
                            Donacija €{donation.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(donation.created_at!).toLocaleDateString('sr-RS')}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-1">"{donation.message}"</p>
                          )}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/projects/${donation.project_id}`}>Pogledaj projekat</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Comments */}
        <TabsContent value="comments" className="space-y-4">
          {userComments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Niste ostavili komentare
                </h3>
                <p className="text-gray-600 mb-4">
                  Učestvujte u diskusijama o projektima.
                </p>
                <Button asChild>
                  <Link to="/forum">Posetite forum</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Komentar</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at!).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-3">
                        {comment.content}
                      </p>
                      
                      <div className="flex justify-end">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/projects/${comment.project_id}`}>
                            Pogledaj projekat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges">
          <BadgeShowcase userId={userDetails?.id || ''} isOwner={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}