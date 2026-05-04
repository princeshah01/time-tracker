import { useMemo, useState } from "react";
import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";
import { Input } from "@workspace/ui/components/input";
import { getInitials } from "@/shared/lib/string";
import { User } from "@/shared/types";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { AppIcon } from "@/shared/components/app-icon";
import { setUser, useAppDispatch, useAppSelector } from "@/app/store";
import { userService } from "@/features/user/user.service";
import { toast } from "@workspace/ui/components/sonner";

const ProfileSectionContent = () => {
  const { user } = useAppSelector((s) => s.user);
  const dispatch = useAppDispatch();
  const onSubmit = async (data: FormData) => {
    const results = await userService.updateProfile(data);
    if (results.success) {
      dispatch(
        setUser({
          ...results.data,
          user: {
            ...results.data.user,
            image: `${results.data.user.image}?updatedAt=${Date.now()}`,
          },
        })
      );
      toast.success("Profile updated successfully.");
      return;
    }
    toast.error("Failed to update profile. Please try again.");
  };
  return (
    <TabsContent value="profile" className="m-0">
      <SettingsSection
        title="Profile"
        description="Manage your personal information."
      >
        <ProfileInfoForm user={user!} onSubmit={onSubmit} />
      </SettingsSection>
    </TabsContent>
  );
};

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileInfoFormProps = {
  user: User;
  onSubmit: (data: FormData) => Promise<void>;
};

export function ProfileInfoForm({ user, onSubmit }: ProfileInfoFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  const imagePreview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : user?.image || "";

  const initials = getInitials(user?.name);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
  }

  async function handleSubmit(values: ProfileFormValues) {
    const formData = new FormData();

    formData.append("name", values.name);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      setSaving(true);
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="divide-y divide-border">
      <div className="py-4 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mb-4 flex items-center gap-3">
              <div className="group relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={imagePreview} className="object-cover" />
                  <AvatarFallback className="text-[12px]">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>

                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {saving ? (
                    <AppIcon
                      name="Loader"
                      className="h-3.5 w-3.5 animate-spin text-white"
                    />
                  ) : (
                    <AppIcon name="Camera" className="h-3.5 w-3.5 text-white" />
                  )}
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={saving}
                />
              </div>

              <div>
                <p className="text-[13px] font-medium">
                  {form.watch("name") || "Your Name"}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid max-w-lg gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex flex-col gap-1">
                      <FormLabel className="text-[12px]">Full Name</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Baburao Ganpatrao Apte"
                        className="h-8 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              size="sm"
              className="mt-3 h-7 text-[12px]"
            >
              {saving && (
                <AppIcon
                  name="Loader"
                  className="mr-2 h-3.5 w-3.5 animate-spin text-white"
                />
              )}
              Save
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export { ProfileSectionContent };
