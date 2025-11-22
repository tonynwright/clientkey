import { useState } from "react";
import { ChevronDown, Mail, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  disc_type: string | null;
  tags: string[] | null;
}

interface TagGroupedViewProps {
  clients: Client[];
  onDelete: (clientId: string) => void;
  onSendInvite: (clientId: string) => void;
  onViewInsights: (clientId: string) => void;
  isReadOnly?: boolean;
}

export function TagGroupedView({
  clients,
  onDelete,
  onSendInvite,
  onViewInsights,
  isReadOnly = false,
}: TagGroupedViewProps) {
  const navigate = useNavigate();
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Group clients by tags
  const tagGroups = clients.reduce((groups, client) => {
    const clientTags = client.tags || ["Untagged"];
    
    clientTags.forEach(tag => {
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(client);
    });
    
    return groups;
  }, {} as Record<string, Client[]>);

  // Sort tags alphabetically, but keep "Untagged" last
  const sortedTags = Object.keys(tagGroups).sort((a, b) => {
    if (a === "Untagged") return 1;
    if (b === "Untagged") return -1;
    return a.localeCompare(b);
  });

  const toggleGroup = (tag: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(tag)) {
      newOpenGroups.delete(tag);
    } else {
      newOpenGroups.add(tag);
    }
    setOpenGroups(newOpenGroups);
  };

  const handleDeleteClick = (clientId: string) => {
    setDeleteClientId(clientId);
  };

  const handleDeleteConfirm = () => {
    if (deleteClientId) {
      onDelete(deleteClientId);
      setDeleteClientId(null);
    }
  };

  const getDiscTypeColor = (type: string) => {
    switch (type) {
      case "D": return "hsl(var(--chart-1))";
      case "I": return "hsl(var(--chart-2))";
      case "S": return "hsl(var(--chart-3))";
      case "C": return "hsl(var(--chart-4))";
      default: return "hsl(var(--muted))";
    }
  };

  if (sortedTags.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No clients to display
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedTags.map((tag) => {
          const clientsInTag = tagGroups[tag];
          const isOpen = openGroups.has(tag);

          return (
            <Collapsible
              key={tag}
              open={isOpen}
              onOpenChange={() => toggleGroup(tag)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                      <Badge
                        variant={tag === "Untagged" ? "outline" : "default"}
                        className="text-sm"
                      >
                        {tag}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {clientsInTag.length} {clientsInTag.length === 1 ? "client" : "clients"}
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t divide-y">
                    {clientsInTag.map((client) => (
                      <div
                        key={client.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3
                                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary"
                                onClick={() => navigate(`/dashboard?client=${client.id}`)}
                              >
                                {client.name}
                              </h3>
                              {client.disc_type && (
                                <Badge
                                  style={{
                                    backgroundColor: getDiscTypeColor(client.disc_type),
                                  }}
                                  className="text-white"
                                >
                                  {client.disc_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {client.email}
                            </p>
                            {client.company && (
                              <p className="text-sm text-muted-foreground truncate">
                                {client.company}
                              </p>
                            )}
                            {client.tags && client.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {client.tags.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-xs">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSendInvite(client.id)}
                              disabled={isReadOnly}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewInsights(client.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(client.id)}
                              disabled={isReadOnly}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
