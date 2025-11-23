import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddClientFormProps {
  onSuccess: () => void;
}

export function AddClientForm({ onSuccess }: AddClientFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    monthly_retainer: "",
    service_type: "",
    contract_end_date: "",
    account_manager: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("clients_health").insert({
        user_id: user?.id,
        company_name: formData.company_name,
        monthly_retainer: parseFloat(formData.monthly_retainer),
        service_type: formData.service_type,
        contract_end_date: formData.contract_end_date,
        account_manager: formData.account_manager,
      });

      if (error) throw error;

      toast.success("Client added successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="monthly_retainer">Monthly Retainer ($)</Label>
        <Input
          id="monthly_retainer"
          type="number"
          step="0.01"
          value={formData.monthly_retainer}
          onChange={(e) => setFormData({ ...formData, monthly_retainer: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="service_type">Service Type</Label>
        <Input
          id="service_type"
          value={formData.service_type}
          onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="contract_end_date">Contract End Date</Label>
        <Input
          id="contract_end_date"
          type="date"
          value={formData.contract_end_date}
          onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="account_manager">Account Manager</Label>
        <Input
          id="account_manager"
          value={formData.account_manager}
          onChange={(e) => setFormData({ ...formData, account_manager: e.target.value })}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add Client"}
      </Button>
    </form>
  );
}
