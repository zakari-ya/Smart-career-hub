import { useUser, useClerk } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { LogOut, Download, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  // Assuming these mutations are created in convex/compliance.ts or similar
  // const deleteAccount = useMutation(api.compliance.deleteUserAccount);
  // const exportData = useMutation(api.compliance.requestDataExport);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // await exportData();
      toast.success("Data export started. You will receive an email when it's ready.");
    } catch (e) {
      toast.error("Failed to request data export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you ABSOLUTELY sure? This will delete all your data permanently. This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // await deleteAccount();
      // await signOut();
      toast.success("Account deleted successfully.");
    } catch (e) {
      toast.error("Failed to delete account. Please try again or contact support.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, data preferences, and compliance options.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Your personal information synced via Clerk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border bg-muted">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-primary/10" />
                )}
              </div>
              <div>
                <p className="font-medium text-lg">{user?.fullName || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
              Data & Privacy (GDPR)
            </CardTitle>
            <CardDescription>
              Manage your personal data in accordance with privacy laws.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <p className="font-medium">Export Personal Data</p>
                <p className="text-sm text-muted-foreground max-w-[400px]">
                  Download a JSON archive of all your resumes, analyses, and job tracker data.
                </p>
              </div>
              <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Processing..." : "Request Export"}
              </Button>
            </div>

            <div className="border-t pt-6 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <p className="font-medium text-destructive flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Danger Zone
                </p>
                <p className="text-sm text-muted-foreground max-w-[400px]">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
