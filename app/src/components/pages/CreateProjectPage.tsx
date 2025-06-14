import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft, 
  Plus, 
  Save,
  Clock,
  Trash
} from "lucide-react";
import { projectServiceCreateProject } from "@/lib/sdk";
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

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    tags: [] as string[],
  });
  
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleCategoryChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      category: value
    }));
    
    // Clear error when user selects category
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ""
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
    
    if (!validateForm()) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva obavezna polja.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await projectServiceCreateProject({
        body: {
          title: formState.title,
          description: formState.description,
          budget: parseFloat(formState.budget),
          category: formState.category,
          tags: formState.tags
        }
      });

      toast({
        title: "Uspešno",
        description: "Projekat je uspešno kreiran!",
      });

      navigate(`/projects/${response.data.id}`);
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri kreiranju projekta. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kreiraj Novi Projekat</h1>
          <p className="text-gray-600">Predložite projekat koji će poboljšati našu zajednicu</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nazad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Detalji Projekta
          </CardTitle>
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

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategorija *</Label>
              <Select value={formState.category} onValueChange={handleCategoryChange}>
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
                  Unesite ukupan iznos potreban za realizaciju projekta
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
              <p className="text-sm text-gray-500">
                Oznake pomažu u kategorizaciji projekta (npr. park, deca, priroda...)
              </p>
              
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

            {/* Status Note */}
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Napomena o statusu projekta</p>
                <p>Novi projekti se automatski postavljaju u status "Planiranje". 
                Kasnije možete ažurirati status kako projekat napreduje.</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {submitting ? "Čuvanje..." : "Kreiraj projekat"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}