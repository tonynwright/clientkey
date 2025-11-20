import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Mail, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Database } from "@/integrations/supabase/types";

type DISCScores = { D: number; I: number; S: number; C: number };

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  disc_type: string | null;
  disc_scores: DISCScores | null;
  created_at: string;
}

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(2, "Role must be at least 2 characters"),
});

const discTypeColors: Record<string, string> = {
  D: "bg-red-100 text-red-800 border-red-200",
  I: "bg-yellow-100 text-yellow-800 border-yellow-200",
  S: "bg-green-100 text-green-800 border-green-200",
  C: "bg-blue-100 text-blue-800 border-blue-200",
};

export function StaffManagement() {
  const { toast } = useToast();
  const { user, isDemoAccount } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data.map(member => ({
        ...member,
        disc_scores: member.disc_scores as DISCScores | null
      })) as Staff[];
    },
  });

  const addStaff = useMutation({
    mutationFn: async (values: z.infer<typeof staffSchema>) => {
      if (isDemoAccount) {
        throw new Error("Demo account is read-only. Sign up for your own account to add staff!");
      }

      const { data, error } = await supabase
        .from("staff")
        .insert([{ 
          name: values.name,
          email: values.email,
          role: values.role,
          user_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Staff member added",
        description: `${data.name} has been added to your team.`,
      });
      form.reset();
      setShowAddDialog(false);
      
      // Prompt to send assessment
      toast({
        title: "Send DISC Assessment?",
        description: "Send an assessment invitation to complete their profile.",
        action: (
          <Button
            size="sm"
            onClick={() => {
              // This would trigger the assessment invitation flow
              toast({
                title: "Feature coming soon",
                description: "Assessment invitations for staff will be available soon.",
              });
            }}
          >
            Send Invite
          </Button>
        ),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding staff:", error);
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (staffId: string) => {
      if (isDemoAccount) {
        throw new Error("Demo account is read-only. Sign up for your own account to delete staff!");
      }

      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Staff member removed",
        description: "The staff member has been removed from your team.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove staff member. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting staff:", error);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage your staff members and their DISC profiles
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your organization
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => addStaff.mutate(values))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Account Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={addStaff.isPending}>
                  {addStaff.isPending ? "Adding..." : "Add Staff Member"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!staff || staff.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No staff members yet. Add your first team member to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {staff.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {member.name}
                      {member.disc_type && (
                        <Badge className={discTypeColors[member.disc_type]}>
                          {member.disc_type}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        {member.role}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteStaff.mutate(member.id)}
                    disabled={deleteStaff.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {member.disc_scores && (
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{member.disc_scores.D}</div>
                      <div className="text-xs text-muted-foreground">Dominance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{member.disc_scores.I}</div>
                      <div className="text-xs text-muted-foreground">Influence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{member.disc_scores.S}</div>
                      <div className="text-xs text-muted-foreground">Steadiness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{member.disc_scores.C}</div>
                      <div className="text-xs text-muted-foreground">Compliance</div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
