import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";

import { useAuth } from "@/shared/hooks/use-auth";
import {
  changePassword,
  disableTwoFactor,
  enableTwoFactor,
  setPassword,
  verifyTwoFactor,
} from "../service";

function SecuritySettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function refreshMe() {
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  async function handlePasswordSubmit() {
    setMessage(null);
    if (user?.hasPassword) {
      await changePassword({ currentPassword, newPassword });
      setMessage("Password updated");
    } else {
      await setPassword(newPassword);
      setMessage("Password set");
    }
    setCurrentPassword("");
    setNewPassword("");
    await refreshMe();
  }

  async function handleEnableTfa() {
    const result = await enableTwoFactor(setupPassword);
    setTotpUri(result.totpURI);
    setMessage("Scan the QR code, then verify the OTP");
  }

  async function handleVerifyTfa() {
    await verifyTwoFactor(otp);
    setTotpUri("");
    setOtp("");
    setSetupPassword("");
    setMessage("Two-factor authentication enabled");
    await refreshMe();
  }

  async function handleDisableTfa() {
    await disableTwoFactor(setupPassword);
    setSetupPassword("");
    setMessage("Two-factor authentication disabled");
    await refreshMe();
  }

  const qrUrl = totpUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpUri)}`
    : "";

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl">Security settings</h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium text-base">
          {user?.hasPassword ? "Change password" : "Set password"}
        </h2>
        {user?.hasPassword ? (
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        ) : null}
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <Button type="button" onClick={handlePasswordSubmit}>
          Save password
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-base">Authenticator app</h2>
        <Input
          type="password"
          placeholder="Password"
          value={setupPassword}
          onChange={(event) => setSetupPassword(event.target.value)}
        />
        {user?.twoFactorEnabled ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDisableTfa}
          >
            Disable two-factor
          </Button>
        ) : (
          <Button type="button" onClick={handleEnableTfa}>
            Enable two-factor
          </Button>
        )}
        {qrUrl ? (
          <div className="space-y-3">
            <img
              src={qrUrl}
              alt="Authenticator QR code"
              className="size-[180px]"
            />
            <Input
              inputMode="numeric"
              placeholder="Verification code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
            <Button type="button" onClick={handleVerifyTfa}>
              Verify OTP
            </Button>
          </div>
        ) : null}
      </section>

      {message ? (
        <p className="text-muted-foreground text-sm">{message}</p>
      ) : null}
    </main>
  );
}

export default SecuritySettingsPage;
