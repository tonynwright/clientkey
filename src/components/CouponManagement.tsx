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
import { Loader2, Tag, Percent, DollarSign } from "lucide-react";

export function CouponManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponForm, setCouponForm] = useState({
    name: "",
    discountType: "percent",
    percentOff: "",
    amountOff: "",
    duration: "once",
    durationInMonths: "",
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

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponForm.name) {
      toast({
        title: "Validation error",
        description: "Coupon name is required",
        variant: "destructive",
      });
      return;
    }

    const couponData: any = {
      name: couponForm.name,
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
      if (!months || months <= 0) {
        toast({
          title: "Validation error",
          description: "Duration in months is required for repeating coupons",
          variant: "destructive",
        });
        return;
      }
      couponData.duration_in_months = months;
    }

    createCoupon.mutate(couponData);
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
                      value={couponForm.durationInMonths}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, durationInMonths: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                <Button type="submit" disabled={createCoupon.isPending}>
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
                    <Card key={coupon.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="text-lg font-mono font-semibold bg-muted px-2 py-1 rounded">
                                {coupon.name || coupon.id}
                              </code>
                              {coupon.valid && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Active
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
                            {coupon.times_redeemed !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Redeemed {coupon.times_redeemed} times
                              </p>
                            )}
                          </div>
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
    </div>
  );
}
