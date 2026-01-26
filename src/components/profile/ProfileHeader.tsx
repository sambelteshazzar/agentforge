import { User } from "@supabase/supabase-js";
import { Mail, Calendar, Shield } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";

interface ProfileHeaderProps {
  user: User;
  displayName: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
}

export const ProfileHeader = ({ 
  user, 
  displayName, 
  avatarUrl, 
  onAvatarChange 
}: ProfileHeaderProps) => {
  const createdAt = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : 'Unknown';

  return (
    <div className="glass-card p-8 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={avatarUrl}
          userEmail={user.email || ''}
          onAvatarChange={onAvatarChange}
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{displayName || user.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Member since:</span>
          <span>{createdAt}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Auth provider:</span>
          <span className="capitalize">{user.app_metadata?.provider || 'Email'}</span>
        </div>
      </div>
    </div>
  );
};
