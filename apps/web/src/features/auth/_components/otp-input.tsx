import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod";

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

type OtpTabProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  onSubmit: (values: OtpFormValues) => Promise<void> | void;
};

function OtpTab({
  title = "Verify OTP",
  description = "Enter the 6-digit code sent to your email.",
  submitLabel = "Verify OTP",
  onSubmit,
}: OtpTabProps) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function handleSubmit(values: OtpFormValues) {
    await onSubmit(values);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-medium text-[15px]">{title}</h2>
        <p className="text-[12px] text-muted-foreground">{description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    pattern="^[0-9]*$"
                    inputMode="numeric"
                    onChange={(value) => {
                      field.onChange(value.replace(/\D/g, ""));
                    }}
                  >
                    <InputOTPGroup className="w-full justify-center gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="size-10 w-full border border-input border-r text-center text-[13px]"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-[12px]" />
              </FormItem>
            )}
          />

          <Button type="submit" className="h-9 w-full text-[13px]">
            {form.formState.isSubmitting ? "Verifying..." : submitLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export { OtpTab };
export type { OtpFormValues, OtpTabProps };
