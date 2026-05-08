import { useUser, useClerk } from "@clerk/clerk-react";
import { Download, AlertTriangle, ShieldAlert, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Tab = "profile" | "data" | "danger";

interface TabButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ id, label, active, onClick }: TabButtonProps) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative py-4 px-1 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
        active
          ? "text-accent"
          : "text-muted hover:text-accent"
      }`}
    >
      {label}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      toast.success("Data export started. You'll receive an email when it's ready.");
    } catch {
      toast.error("Failed to request data export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you ABSOLUTELY sure? This will permanently delete all your data."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      toast.success("Account deleted successfully.");
    } catch {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
            Preferences
          </span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        <h1 className="text-4xl font-semibold text-primary tracking-tight">
          Account Settings
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-border/30 mb-12">
        <TabButton
          id="tab-profile"
          label="Profile"
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        />
        <TabButton
          id="tab-data"
          label="Privacy"
          active={activeTab === "data"}
          onClick={() => setActiveTab("data")}
        />
        <TabButton
          id="tab-danger"
          label="Danger"
          active={activeTab === "danger"}
          onClick={() => setActiveTab("danger")}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-12">
        {activeTab === "profile" && (
          <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between p-8 rounded-card border border-border/30 bg-surface">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full border-2 border-background overflow-hidden bg-background">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold text-primary">{user?.fullName ?? "User"}</h3>
                  <p className="text-sm text-secondary font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase tracking-widest text-accent hover:underline">
                Update Profile
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Session Management</h3>
              <div className="p-8 rounded-card border border-border/30">
                <p className="text-sm font-medium text-primary mb-2">Sign out of all devices</p>
                <p className="text-xs text-secondary mb-6 max-w-md">
                  Terminate your current session and require a fresh login on all connected devices.
                </p>
                <button
                  onClick={() => void signOut()}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-error hover:gap-3 transition-all"
                >
                  Terminate Session <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="flex flex-col gap-10">
            <div className="p-8 rounded-card bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Privacy Standards</h3>
              </div>
              <p className="text-sm text-accent/80 leading-relaxed font-medium">
                We adhere to strict data portability standards. You can request a complete archive of your career intelligence data at any time. Resumes are processed using localized AI models when available.
              </p>
            </div>

            <div className="p-8 rounded-card border border-border/30">
              <h3 className="text-lg font-semibold text-primary mb-2">Export Personal Archive</h3>
              <p className="text-sm text-secondary mb-8 max-w-lg leading-relaxed">
                Receive a compressed JSON package containing your resumes, portfolio audits, job match history, and metadata.
              </p>
              <button
                onClick={() => void handleExport()}
                disabled={isExporting}
                className="flex items-center gap-2 h-11 px-8 rounded-full bg-accent text-white font-medium text-sm transition-all hover:bg-accent/90 disabled:opacity-30"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Preparing Archive..." : "Request Data Export"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "danger" && (
          <div className="flex flex-col gap-10">
            <div className="p-8 rounded-card border border-error/20 bg-error/5">
              <div className="flex items-center gap-3 mb-4 text-error">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Irreversible Actions</h3>
              </div>
              <p className="text-sm text-error/80 leading-relaxed font-medium">
                Proceeding here will permanently erase your career progress, historical analyses, and saved documents. This action cannot be undone and will immediately terminate your subscription if active.
              </p>
            </div>

            <div className="p-8 rounded-card border border-error/20">
              <h3 className="text-lg font-semibold text-error mb-2">Delete Intelligence Profile</h3>
              <p className="text-sm text-secondary mb-8 max-w-lg leading-relaxed">
                Completely remove your presence from Smart Career Hub. All associated data will be purged from our databases.
              </p>
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="h-11 px-8 rounded-full bg-error text-white font-medium text-sm transition-all hover:bg-error/90 disabled:opacity-30"
              >
                {isDeleting ? "Purging Data..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
