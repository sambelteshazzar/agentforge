import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  email: string;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
}

export const ProfileForm = ({ 
  email, 
  displayName, 
  onDisplayNameChange 
}: ProfileFormProps) => {
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: localDisplayName }
      });

      if (error) throw error;

      onDisplayNameChange(localDisplayName);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-xl">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <UserIcon className="w-5 h-5" />
        Edit Profile
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={localDisplayName}
            onChange={(e) => setLocalDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="bg-secondary/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="bg-secondary/30 opacity-60"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <Button 
          onClick={handleUpdateProfile} 
          disabled={isSaving || localDisplayName === displayName}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};
