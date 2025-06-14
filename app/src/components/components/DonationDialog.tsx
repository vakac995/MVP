import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Euro, Heart } from "lucide-react";
import { donationServiceCreateDonation } from "@/lib/sdk";
import { Project } from "@/lib/sdk";
import { useToast } from "@/hooks/use-toast";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onDonationComplete: () => void;
}

export default function DonationDialog({ 
  open, 
  onOpenChange, 
  project, 
  onDonationComplete 
}: DonationDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{amount?: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrors({ amount: "Molimo unesite ispravnu vrednost donacije" });
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      
      await donationServiceCreateDonation({
        body: {
          project_id: project.id!,
          amount: numericAmount,
          message: message.trim(),
          is_anonymous: isAnonymous,
          currency: "EUR"
        }
      });

      toast({
        title: "Uspešno",
        description: "Vaša donacija je uspešno poslata! Hvala vam na podršci.",
      });

      onOpenChange(false);
      onDonationComplete();
      
      // Reset form
      setAmount("");
      setMessage("");
      setIsAnonymous(false);

    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri slanju donacije. Molimo pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const predefinedAmounts = [5, 10, 20, 50, 100];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-green-600" />
            Donirajte projektu
          </DialogTitle>
          <DialogDescription>
            Podržite projekat "{project.title}" vašom donacijom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Iznos donacije (€)</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Unesite iznos"
                className="pl-10"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {predefinedAmounts.map((presetAmount) => (
              <Button 
                key={presetAmount}
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setAmount(presetAmount.toString())}
              >
                €{presetAmount}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Poruka (opciono)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dodajte poruku uz vašu donaciju"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/200
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="anonymous" 
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Donirajte anonimno
            </Label>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p>
              Donacije se koriste isključivo za finansiranje projekta i podležu javnom izveštavanju.
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Otkaži
            </Button>
            <Button 
              type="submit" 
              disabled={!amount.trim() || submitting}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              {submitting ? "Obrađuje se..." : "Pošalji donaciju"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}