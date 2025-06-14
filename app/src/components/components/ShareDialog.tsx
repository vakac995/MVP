import { Share, Copy, Facebook, Twitter, Mail, MessageCircle, CircleCheck } from "lucide-react";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Project } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export default function ShareDialog({ open, onOpenChange, project }: ShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const projectUrl = `${window.location.origin}/projects/${project.id}`;
  
  const shareText = `Pogledajte ovaj projekat: ${project.title} - ${project.description.slice(0, 100)}${project.description.length > 100 ? '...' : ''}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast({
        title: "Kopirano!",
        description: "Link je kopiran u clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće kopirati link.",
        variant: "destructive",
      });
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(projectUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = `Projekat: ${project.title}`;
    const body = `${shareText}\n\nPogledajte detalje: ${projectUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  const shareViaWhatsApp = () => {
    const text = `${shareText}\n${projectUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      action: shareOnFacebook
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600 text-white",
      action: shareOnTwitter
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700 text-white",
      action: shareViaWhatsApp
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700 text-white",
      action: shareViaEmail
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Podelite projekat
          </DialogTitle>
          <DialogDescription>
            Podelite "{project.title}" sa prijateljima i rodbinom.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Copy Section */}
          <div className="space-y-2">
            <Label htmlFor="project-url">Link projekta</Label>
            <div className="flex gap-2">
              <Input 
                id="project-url"
                value={projectUrl} 
                readOnly 
                className="flex-1 text-sm"
              />
              <Button 
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <CircleCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Kopirano" : "Kopiraj"}
              </Button>
            </div>
          </div>

          {/* Social Media Share Buttons */}
          <div className="space-y-2">
            <Label>Podelite na društvenim mrežama</Label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.name}
                    variant="outline"
                    onClick={option.action}
                    className={`flex items-center gap-2 ${option.color} border-0`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Project Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">{project.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Kategorija: {project.category}</span>
              <span>Glasovi: {project.vote_count || 0}</span>
            </div>
          </div>

          {/* Sharing Tips */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <h5 className="font-medium mb-1">Zašto podeliti?</h5>
            <p>
              Širenje informacija o projektima pomaže u privlačenju veće podrške 
              i doprinosi uspešnoj realizaciji ideja za bolju zajednicu.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}