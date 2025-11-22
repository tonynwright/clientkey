import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { ClientTagInput } from "./ClientTagInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TagPreset {
  id: string;
  name: string;
  tags: string[];
  created_at: string;
}

interface TagPresetsManagementProps {
  onSelectPreset?: (tags: string[]) => void;
  showQuickSelect?: boolean;
}

export const TagPresetsManagement = ({ onSelectPreset, showQuickSelect = false }: TagPresetsManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetTags, setNewPresetTags] = useState<string[]>([]);
  const [deletePresetId, setDeletePresetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: presets, isLoading } = useQuery({
    queryKey: ["tag-presets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tag_presets")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as TagPreset[];
    },
  });

  const handleCreatePreset = async () => {
    if (!newPresetName.trim() || newPresetTags.length === 0) {
      toast({
        title: "Invalid preset",
        description: "Please enter a name and at least one tag",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create presets",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("tag_presets")
        .insert({
          user_id: user.id,
          name: newPresetName.trim(),
          tags: newPresetTags,
        });

      if (error) throw error;

      toast({
        title: "Preset created",
        description: `"${newPresetName}" has been saved`,
      });

      setNewPresetName("");
      setNewPresetTags([]);
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["tag-presets"] });
    } catch (error) {
      console.error("Error creating preset:", error);
      toast({
        title: "Failed to create preset",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = async () => {
    if (!deletePresetId) return;

    try {
      const { error } = await supabase
        .from("tag_presets")
        .delete()
        .eq("id", deletePresetId);

      if (error) throw error;

      toast({
        title: "Preset deleted",
        description: "Tag preset has been removed",
      });

      queryClient.invalidateQueries({ queryKey: ["tag-presets"] });
    } catch (error) {
      console.error("Error deleting preset:", error);
      toast({
        title: "Failed to delete preset",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setDeletePresetId(null);
    }
  };

  const handleSelectPreset = (tags: string[]) => {
    if (onSelectPreset) {
      onSelectPreset(tags);
      toast({
        title: "Preset applied",
        description: `${tags.length} tag(s) loaded`,
      });
    }
  };

  if (showQuickSelect && presets && presets.length > 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Quick Apply Preset</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handleSelectPreset(preset.tags)}
              className="text-xs"
            >
              <Tag className="h-3 w-3 mr-1" />
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tag Presets</h3>
        {!isCreating && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Preset
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
          <Input
            placeholder="Preset name (e.g., 'VIP Clients')"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="text-sm"
          />
          <ClientTagInput
            tags={newPresetTags}
            onTagsChange={setNewPresetTags}
            placeholder="Add tags to this preset..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreatePreset}
              disabled={isSaving || !newPresetName.trim() || newPresetTags.length === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Save Preset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setNewPresetName("");
                setNewPresetTags([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {presets && presets.length > 0 ? (
        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">{preset.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  {onSelectPreset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectPreset(preset.tags)}
                      title="Apply this preset"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletePresetId(preset.id)}
                    title="Delete preset"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No tag presets yet. Create one to save common tag combinations.
        </p>
      )}

      <AlertDialog open={deletePresetId !== null} onOpenChange={(open) => !open && setDeletePresetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag preset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePreset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
