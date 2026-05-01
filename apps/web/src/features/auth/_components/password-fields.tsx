import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import type { Control, FieldValues, Path } from "react-hook-form";

type PasswordFieldValues = FieldValues & {
  password: string;
  confirmPassword: string;
};

type PasswordFieldsProps<T extends PasswordFieldValues> = {
  control: Control<T>;
};

function PasswordFields<T extends PasswordFieldValues>({
  control,
}: PasswordFieldsProps<T>) {
  return (
    <>
      <FormField
        control={control}
        name={"password" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col justify-between gap-2">
              <FormLabel className="text-[12px]">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                placeholder="Minimum 8 characters"
                className="h-9 text-[13px]"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-[12px]" />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"confirmPassword" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col justify-between gap-2">
            <FormLabel className="text-[12px]">Confirm password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Re-enter password"
                className="h-9 text-[13px]"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-[12px]" />
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

export { PasswordFields, type PasswordFieldValues };
