import { ArrowLeft, Save, Trash, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  projectServiceGetProjectById,
  projectServiceUpdateProject,
  projectServiceDeleteProject
} from "@/lib/sdk";
import { Project } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

// Available project categories
const categories = [
  "Infrastructure", 
  "Community",
  "Education",
  "Environment",
  "Culture",
  "Sport",
  "Technology",
  "Health"
];

const statusOptions = [
  { value: "planning", label: "Planiranje" },
  { value: "in_progress", label: "U toku" },
  { value: "completed", label: "Završen" }
];

export default function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { userDetails } = useAuthContext();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    status: "",
    tags: [] as string[],
  });
  
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      const response = await projectServiceGetProjectById({
        body: { project_id: projectId }
      });
      
      if (!response.data) {
        toast({
          title: "Error",
          description: "Project not found.",
          variant: "destructive",
        });
        navigate("/projects");
        return;
      }

      const projectData = response.data;
      
      // Check if user owns the project
      if (projectData.user_id !== userDetails?.user_uuid) {
        toast({
          title: "Nemate dozvolu",
          description: "Možete uređivati samo vlastite projekte.",
          variant: "destructive",
        });
        navigate(`/projects/${projectId}`);
        return;
      }

      setProject(projectData);
      setFormState({
        title: projectData.title,
        description: projectData.description,
        budget: projectData.budget.toString(),
        category: projectData.category,
        status: projectData.status,
        tags: projectData.tags || []
      });

    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project. Please try again.",
        variant: "destructive",
      });
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.title.trim()) {
      newErrors.title = "Naziv projekta je obavezan";
    }

    if (!formState.description.trim()) {
      newErrors.description = "Opis projekta je obavezan";
    }

    if (!formState.budget.trim()) {
      newErrors.budget = "Budžet projekta je obavezan";
    } else {
      const budgetValue = parseFloat(formState.budget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        newErrors.budget = "Budžet mora biti pozitivan broj";
      }
    }

    if (!formState.category) {
      newErrors.category = "Kategorija projekta je obavezna";
    }

    if (!formState.status) {
      newErrors.status = "Status projekta je obavezan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects value
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    
    if (!formState.tags.includes(tag)) {
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !projectId) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva obavezna polja.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await projectServiceUpdateProject({
        body: {
          project_id: projectId,
          title: formState.title,
          description: formState.description,
          budget: parseFloat(formState.budget),
          status: formState.status,
          category: formState.category,
          tags: formState.tags
        }
      });

      toast({
        title: "Uspešno",
        description: "Projekat je uspešno ažuriran!",
      });

      navigate(`/projects/${projectId}`);
      
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri ažuriranju projekta. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj projekat? Ova akcija se ne može poništiti.")) {
      return;
    }

    try {
      setDeleting(true);
      
      await projectServiceDeleteProject({
        body: { project_id: projectId }
      });

      toast({
        title: "Uspešno",
        description: "Projekat je uspešno obrisan.",
      });

      navigate("/projects");
      
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri brisanju projekta. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Projekat nije pronađen.</p>
        <Button asChild className="mt-4">
          <a href="/projects">Povratak na projekte</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uredi Projekat</h1>
          <p className="text-gray-600">Ažurirajte detalje vašeg projekta</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nazad na projekat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalji Projekta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Naziv projekta *</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleChange}
                placeholder="Npr. Renoviranje parka u centru grada"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Opis projekta *</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                placeholder="Opišite detaljno projekat, njegove ciljeve i očekivane rezultate..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Category and Status in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorija *</Label>
                <Select value={formState.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger 
                    id="category" 
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Izaberite kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formState.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger 
                    id="status" 
                    className={errors.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Izaberite status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Budget Field */}
            <div className="space-y-2">
              <Label htmlFor="budget">Potreban budžet (€) *</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                min="0"
                value={formState.budget}
                onChange={handleChange}
                placeholder="Npr. 5000"
                className={errors.budget ? "border-red-500" : ""}
              />
              {errors.budget ? (
                <p className="text-sm text-red-500">{errors.budget}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Trenutno prikupljeno: €{project.current_funding?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>

            {/* Tags Field */}
            <div className="space-y-2">
              <Label htmlFor="tags">Oznake</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Dodajte oznaku i pritisnite Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Dodaj
                </Button>
              </div>
              
              {/* Tags Display */}
              {formState.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formState.tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center bg-blue-50 text-blue-700 rounded-lg px-3 py-1 text-sm"
                    >
                      <span>{tag}</span>
                      <button 
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 text-blue-700 hover:text-blue-900"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting || deleting}
                className="flex items-center gap-2"
              >
                <TriangleAlert className="h-4 w-4" />
                {deleting ? "Briše se..." : "Obriši projekat"}
              </Button>
              
              <Button 
                type="submit" 
                disabled={submitting || deleting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {submitting ? "Čuvanje..." : "Sačuvaj izmene"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}