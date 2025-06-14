import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, FolderOpen, TrendingUp } from "lucide-react";
import { 
  projectServiceSearchProjects,
  commentServiceSearchComments
} from "@/lib/sdk";
import { Project, Comment } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setHasSearched(true);

      // Search projects
      const projectsResponse = await projectServiceSearchProjects({
        body: { query: query.trim() }
      });
      setProjects(projectsResponse.data || []);

      // Search comments
      const commentsResponse = await commentServiceSearchComments({
        body: { query: query.trim() }
      });
      setComments(commentsResponse.data || []);

    } catch (error) {
      console.error("Error performing search:", error);
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setProjects([]);
    setComments([]);
    setHasSearched(false);
  };

  const totalResults = projects.length + comments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pretraga</h1>
        <p className="text-gray-600">Pretražite projekte i diskusije</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Unesite pojam za pretragu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!searchQuery.trim() || loading}>
                {loading ? "Pretražujem..." : "Pretraži"}
              </Button>
              {hasSearched && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Obriši
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : totalResults === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nema rezultata
                </h3>
                <p className="text-gray-600 mb-4">
                  Nismo pronašli rezultate za "{searchParams.get("q")}".
                </p>
                <p className="text-sm text-gray-500">
                  Pokušajte sa drugim pojmovima ili proverite da li je reč napisana ispravno.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">
                  Pronađeno {totalResults} rezultata za "{searchParams.get("q")}"
                </span>
              </div>

              {/* Results Tabs */}
              <Tabs defaultValue="projects" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="projects" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projekti ({projects.length})
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Diskusije ({comments.length})
                  </TabsTrigger>
                </TabsList>

                {/* Projects Results */}
                <TabsContent value="projects" className="space-y-4">
                  {projects.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">Nema pronađenih projekata.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg line-clamp-2">
                                <Link to={`/projects/${project.id}`} className="hover:text-blue-600">
                                  {project.title}
                                </Link>
                              </CardTitle>
                              <div className="flex flex-col gap-1">
                                <Badge variant="secondary">{project.category}</Badge>
                                <Badge variant="outline">{project.status}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {project.description}
                            </p>
                            
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{project.vote_count || 0} glasova</span>
                              <span>€{project.current_funding?.toFixed(2) || '0.00'} / €{project.budget.toFixed(2)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Comments Results */}
                <TabsContent value="discussions" className="space-y-4">
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">Nema pronađenih diskusija.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
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
                              
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-xs text-gray-500">
                                  Projekat ID: {comment.project_id}
                                </span>
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
              </Tabs>
            </>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saveti za pretragu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              • Koristite konkretne pojmove koji se odnose na projekte ili diskusije
            </p>
            <p className="text-sm text-gray-600">
              • Probajte sa različitim sinonimima ako ne dobijate rezultate
            </p>
            <p className="text-sm text-gray-600">
              • Pretraguje se kroz nazive, opise i komentare
            </p>
            <p className="text-sm text-gray-600">
              • Možete pretražiti po kategorijama kao što su "infrastruktura", "kultura", itd.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}