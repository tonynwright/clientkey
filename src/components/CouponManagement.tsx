import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Loader2, Tag, Percent, DollarSign, Calendar, Users, Archive } from "lucide-react";
import { z } from "zod";

const couponSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Coupon name is required")
    .max(50, "Coupon name must be less than 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Only uppercase letters, numbers, hyphens and underscores allowed"),
  discountType: z.enum(["percent", "amount"]),
  percentOff: z.string().optional(),
  amountOff: z.string().optional(),
  duration: z.enum(["once", "repeating", "forever"]),
  durationInMonths: z.string().optional(),
  maxRedemptions: z.string().optional(),
  expiresAt: z.string().optional(),
}).refine(
  (data) => data.percentOff || data.amountOff,
  { message: "Either percent off or amount off is required" }
);

export function CouponManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    name: "",
    discountType: "percent",
    percentOff: "",
    amountOff: "",
    duration: "once",
    durationInMonths: "",
    maxRedemptions: "",
    expiresAt: "",
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-coupons");
      if (error) throw error;
      return data;
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (couponData: any) => {
      const { data, error } = await supabase.functions.invoke("create-coupon", {
        body: couponData,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Coupon created",
        description: "The coupon code has been created successfully.",
      });
      setCouponForm({
        name: "",
        discountType: "percent",
        percentOff: "",
        amountOff: "",
        duration: "once",
        durationInMonths: "",
        maxRedemptions: "",
        expiresAt: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const deactivateCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      const { data, error } = await supabase.functions.invoke("deactivate-coupon", {
        body: { coupon_id: couponId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Coupon deactivated",
        description: "The coupon can no longer be redeemed by customers.",
      });
      setDeactivateDialogOpen(false);
      setSelectedCoupon(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate coupon",
        variant: "destructive",
      });
    },
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with zod schema
    const validationResult = couponSchema.safeParse(couponForm);
    if (!validationResult.success) {
      toast({
        title: "Validation error",
        description: validationResult.error.errors[0]?.message || "Please check your input",
        variant: "destructive",
      });
      return;
    }

    const couponData: any = {
      name: couponForm.name.toUpperCase().trim(),
      duration: couponForm.duration,
    };

    if (couponForm.discountType === "percent") {
      const percentOff = parseFloat(couponForm.percentOff);
      if (!percentOff || percentOff <= 0 || percentOff > 100) {
        toast({
          title: "Validation error",
          description: "Percent off must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }
      couponData.percent_off = percentOff;
    } else {
      const amountOff = parseFloat(couponForm.amountOff);
      if (!amountOff || amountOff <= 0) {
        toast({
          title: "Validation error",
          description: "Amount off must be greater than 0",
          variant: "destructive",
        });
        return;
      }
      couponData.amount_off = Math.round(amountOff * 100); // Convert to cents
      couponData.currency = "usd";
    }

    if (couponForm.duration === "repeating") {
      const months = parseInt(couponForm.durationInMonths);
      if (!months || months <= 0 || months > 36) {
        toast({
          title: "Validation error",
          description: "Duration must be between 1 and 36 months",
          variant: "destructive",
        });
        return;
      }
      couponData.duration_in_months = months;
    }

    // Add usage limit if provided
    if (couponForm.maxRedemptions) {
      const maxRedemptions = parseInt(couponForm.maxRedemptions);
      if (maxRedemptions <= 0 || maxRedemptions > 10000) {
        toast({
          title: "Validation error",
          description: "Max redemptions must be between 1 and 10,000",
          variant: "destructive",
        });
        return;
      }
      couponData.max_redemptions = maxRedemptions;
    }

    // Add expiration date if provided
    if (couponForm.expiresAt) {
      const expiresAt = new Date(couponForm.expiresAt);
      const now = new Date();
      if (expiresAt <= now) {
        toast({
          title: "Validation error",
          description: "Expiration date must be in the future",
          variant: "destructive",
        });
        return;
      }
      couponData.redeem_by = Math.floor(expiresAt.getTime() / 1000);
    }

    createCoupon.mutate(couponData);
  };

  const handleDeactivateCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = () => {
    if (selectedCoupon) {
      deactivateCoupon.mutate(selectedCoupon.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Coupon Management
          </CardTitle>
          <CardDescription>
            Create and manage discount coupon codes for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Coupon</TabsTrigger>
              <TabsTrigger value="list">Existing Coupons</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Coupon Code Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., LAUNCH50, HOLIDAY2024"
                    value={couponForm.name}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, name: e.target.value.toUpperCase() })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be the code customers enter at checkout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={couponForm.discountType}
                    onValueChange={(value) =>
                      setCouponForm({ ...couponForm, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Percentage Discount
                        </div>
                      </SelectItem>
                      <SelectItem value="amount">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fixed Amount Discount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {couponForm.discountType === "percent" ? (
                  <div className="space-y-2">
                    <Label htmlFor="percentOff">Percent Off</Label>
                    <Input
                      id="percentOff"
                      type="number"
                      placeholder="e.g., 50"
                      min="0"
                      max="100"
                      step="0.01"
                      value={couponForm.percentOff}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, percentOff: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter percentage between 0 and 100
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="amountOff">Amount Off (USD)</Label>
                    <Input
                      id="amountOff"
                      type="number"
                      placeholder="e.g., 10.00"
                      min="0"
                      step="0.01"
                      value={couponForm.amountOff}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, amountOff: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter dollar amount to discount
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={couponForm.duration}
                    onValueChange={(value) =>
                      setCouponForm({ ...couponForm, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time discount</SelectItem>
                      <SelectItem value="repeating">Repeating for X months</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {couponForm.duration === "repeating" && (
                  <div className="space-y-2">
                    <Label htmlFor="durationInMonths">Duration in Months</Label>
                    <Input
                      id="durationInMonths"
                      type="number"
                      placeholder="e.g., 3"
                      min="1"
                      max="36"
                      value={couponForm.durationInMonths}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, durationInMonths: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum 36 months
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Optional Limits
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxRedemptions" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Maximum Redemptions
                      </Label>
                      <Input
                        id="maxRedemptions"
                        type="number"
                        placeholder="Unlimited if empty"
                        min="1"
                        max="10000"
                        value={couponForm.maxRedemptions}
                        onChange={(e) =>
                          setCouponForm({ ...couponForm, maxRedemptions: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for unlimited uses
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiresAt" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Expiration Date
                      </Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={couponForm.expiresAt}
                        onChange={(e) =>
                          setCouponForm({ ...couponForm, expiresAt: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for no expiration
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={createCoupon.isPending} className="w-full">
                  {createCoupon.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Coupon"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : coupons?.data?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No coupons created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {coupons?.data?.map((coupon: any) => (
                    <Card key={coupon.id} className={!coupon.valid ? "opacity-60" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-lg font-mono font-semibold bg-muted px-2 py-1 rounded">
                                {coupon.name || coupon.id}
                              </code>
                              {coupon.valid ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">
                                  Deactivated
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {coupon.percent_off && (
                                <span>{coupon.percent_off}% off</span>
                              )}
                              {coupon.amount_off && (
                                <span>${(coupon.amount_off / 100).toFixed(2)} off</span>
                              )}
                              <span className="capitalize">{coupon.duration}</span>
                              {coupon.duration_in_months && (
                                <span>({coupon.duration_in_months} months)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              {coupon.times_redeemed !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {coupon.times_redeemed}
                                  {coupon.max_redemptions && ` / ${coupon.max_redemptions}`} uses
                                </span>
                              )}
                              {coupon.redeem_by && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {new Date(coupon.redeem_by * 1000).toLocaleDateString()}
                                </span>
                              )}
                              {!coupon.max_redemptions && !coupon.redeem_by && coupon.valid && (
                                <span className="text-green-600 dark:text-green-500">No limits</span>
                              )}
                            </div>
                          </div>
                          {coupon.valid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateCoupon(coupon)}
                              className="shrink-0 gap-2"
                            >
                              <Archive className="h-4 w-4" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent new customers from using the coupon code{" "}
              <code className="font-mono font-semibold bg-muted px-2 py-1 rounded">
                {selectedCoupon?.name || selectedCoupon?.id}
              </code>
              . Existing redemption history will be preserved, but the coupon can no longer be applied to new checkouts.
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              disabled={deactivateCoupon.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivateCoupon.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Coupon"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
