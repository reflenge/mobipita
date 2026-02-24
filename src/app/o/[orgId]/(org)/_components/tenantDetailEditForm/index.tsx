"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import * as z from "zod";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/** テナント詳細編集用のスキーマ */
const tenantDetailSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみで入力してください")
    .max(20, "20文字以内で入力してください")
    .optional()
    .or(z.literal("")),
});

type TenantDetailFormValues = z.infer<typeof tenantDetailSchema>;

type TenantDetailEditFormProps = {
  orgId: string;
  tenantId: Id<"Tenants">;
};

export function TenantDetailEditForm({
  orgId,
  tenantId,
}: TenantDetailEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const tenant = useQuery(api.tenants.getByIdInOrg, {
    clerkOrgId: orgId,
    tenantId,
  });

  const updateTenantDetail = useMutation(api.tenants.updateDetail);

  const form = useForm<TenantDetailFormValues>({
    resolver: zodResolver(tenantDetailSchema),
    defaultValues: {
      phoneNumber: "",
    },
    values: {
      phoneNumber: tenant?.phoneNumber ?? "",
    },
  });

  const onSubmit = async (values: TenantDetailFormValues) => {
    startTransition(async () => {
      try {
        await updateTenantDetail({
          clerkOrgId: orgId,
          tenantId,
          phoneNumber: values.phoneNumber === "" ? undefined : values.phoneNumber,
        });

        toast.success("テナント詳細情報を更新しました");
        router.refresh();
      } catch (error) {
        console.error("[UPDATE_DETAIL_ERROR]:", error);
        toast.error("更新に失敗しました");
      }
    });
  };

  if (tenant === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>テナント詳細情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tenant === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>テナント詳細情報</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            テナントが見つかりません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>テナント詳細情報</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>連絡先電話番号</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例: 090-1234-5678 または 03-1234-5678"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    任意。テナントの連絡先電話番号を入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? "保存中..." : "保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
