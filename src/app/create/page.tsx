"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Plus, ChevronRight, ArrowLeft, Globe, X, Send } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCreateTokenStore } from "@/store/createToken";
import { useMetadataUpload, useCreateBuild } from "@/lib/api-hooks";
import { getDefaultNetwork } from "@/lib/api";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Socials" },
  { id: 3, label: "Curve" },
  { id: 4, label: "Deploy" },
] as const;

function isValidUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; symbol?: string; twitter?: string; telegram?: string; website?: string }>({});
  const [deployStatus, setDeployStatus] = useState<"idle" | "uploading" | "building" | "success" | "error">("idle");
  const [deployError, setDeployError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useCreateTokenStore();

  const metadataUpload = useMetadataUpload();
  const createBuild = useCreateBuild();

  const progressWidth =
    currentStep === 1
      ? "w-[0%]"
      : currentStep === 2
        ? "w-[33%]"
        : currentStep === 3
          ? "w-[66%]"
          : "w-[100%]";

  const nextStep = () => {
    if (currentStep === 1) {
      const newErrors: { name?: string; symbol?: string } = {};
      if (!store.name.trim()) newErrors.name = "Token name is required";
      if (!store.symbol.trim()) newErrors.symbol = "Symbol is required";
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    if (currentStep === 2) {
      const newErrors: { twitter?: string; telegram?: string; website?: string } = {};
      if (store.twitter.trim() && !isValidUrl(store.twitter.trim())) {
        newErrors.twitter = "Must be a valid URL starting with http:// or https://";
      }
      if (store.telegram.trim() && !isValidUrl(store.telegram.trim())) {
        newErrors.telegram = "Must be a valid URL starting with http:// or https://";
      }
      if (store.website.trim() && !isValidUrl(store.website.trim())) {
        newErrors.website = "Must be a valid URL starting with http:// or https://";
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const handleImageFile = (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Please upload a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("Image must be less than 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      store.setField("image", (e.target?.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const clearImage = () => {
    store.setField("image", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeploy = async () => {
    const network = getDefaultNetwork();

    try {
      // Step 1: Upload metadata
      setDeployStatus("uploading");
      setDeployError("");

      let metadataURI = store.metadataURI;

      if (!metadataURI) {
        const metadataResult = await metadataUpload.mutateAsync({
          name: store.name,
          symbol: store.symbol,
          description: store.description,
          image: store.image || "",
          website: store.website,
          twitter: store.twitter,
          telegram: store.telegram,
        });
        metadataURI = metadataResult.metadataURI;
        store.setField("metadataURI", metadataURI);
      }

      // Step 2: Build transaction
      setDeployStatus("building");

      const buildResult = await createBuild.mutateAsync({
        network,
        name: store.name,
        symbol: store.symbol,
        description: store.description,
        metadataURI,
        socialURI: store.website || store.twitter || store.telegram || "",
        curveS: store.curveS,
      });

      setDeployStatus("success");

      // Navigate after a short delay to the success state
      setTimeout(() => {
        store.reset();
      }, 3000);

    } catch (err) {
      console.error("Deploy failed:", err);
      setDeployStatus("error");
      setDeployError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleRetry = () => {
    setDeployStatus("idle");
    setDeployError("");
  };

  const isLoading = deployStatus === "uploading" || deployStatus === "building";

  return (
    <div className="w-full min-h-screen bg-surface-base flex flex-col items-center pt-8 md:pt-12 px-4 pb-20">
      <div className="max-w-[900px] w-full">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl md:text-[32px] font-bold tracking-tight mb-2 text-content-primary">
            Launch a token
          </h1>
          <p className="text-content-secondary text-sm md:text-base">
            Permanent. Public. Powered by math.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-4 w-full h-0.5 bg-border z-0" />
          <div
            className={cn(
              "absolute left-0 top-4 h-0.5 bg-accent-primary z-0 transition-all duration-300",
              progressWidth,
            )}
          />

          {STEPS.map((step, i) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  "relative z-10 flex flex-col gap-2 bg-surface-base",
                  i === 0 && "items-start pr-4",
                  i === STEPS.length - 1 && "items-end pl-4",
                  i !== 0 && i !== STEPS.length - 1 && "items-center px-2 md:px-4",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm border transition-colors duration-300",
                    isActive && "bg-accent-primary/20 border-accent-primary text-accent-primary",
                    isCompleted && "bg-accent-primary border-accent-primary text-surface-base",
                    !isActive && !isCompleted && "bg-surface border-border text-content-tertiary",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isActive && "text-accent-primary font-medium",
                    isCompleted && "text-accent-primary",
                    !isActive && !isCompleted && "text-content-tertiary",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 space-y-6">
          {/* ============ Step 1: Basics ============ */}
          {currentStep === 1 && (
            <>
              {/* Image Upload */}
              <div>
                <label className="block text-[13px] font-medium text-content-secondary mb-3">
                  Image (optional)
                </label>
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "w-[90px] h-[90px] flex-shrink-0 rounded-2xl bg-surface-highlight border border-dashed flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                      store.image
                        ? "border-border"
                        : "border-border hover:border-accent-primary/50",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {store.image ? (
                      <>
                        <img
                          src={store.image}
                          alt="Token preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-surface/90 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                        >
                          <X className="w-3 h-3 text-content-primary" />
                        </button>
                      </>
                    ) : (
                      <Plus className="w-8 h-8 text-content-tertiary" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-content-primary text-[13px] font-medium mb-1.5">
                      Drag and drop, or click to choose
                    </p>
                    <p className="text-content-tertiary text-[11px]">
                      PNG / JPG / WebP - 512x512 recommended - max 1MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Token Name */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[13px] font-medium text-content-secondary">
                    Token name <span className="text-accent-warning">*</span>
                  </label>
                  <span className="text-[11px] text-content-tertiary">
                    {store.name.length}/32
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="PEPE 2099"
                  value={store.name}
                  onChange={(e) => {
                    store.setField("name", e.target.value);
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  maxLength={32}
                  className={cn(
                    "w-full bg-surface-highlight border rounded-lg px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors",
                    errors.name ? "border-accent-danger" : "border-border",
                  )}
                />
                {errors.name && (
                  <p className="text-accent-danger text-[11px] mt-1">{errors.name}</p>
                )}
              </div>

              {/* Symbol */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[13px] font-medium text-content-secondary">
                    Symbol <span className="text-accent-warning">*</span>
                  </label>
                  <span className="text-[11px] text-content-tertiary">
                    {store.symbol.length}/8
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="PEPE"
                  value={store.symbol}
                  onChange={(e) => {
                    const filtered = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    store.setField("symbol", filtered);
                    if (errors.symbol)
                      setErrors((prev) => ({ ...prev, symbol: undefined }));
                  }}
                  maxLength={8}
                  className={cn(
                    "w-full bg-surface-highlight border rounded-lg px-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors",
                    errors.symbol ? "border-accent-danger" : "border-border",
                  )}
                />
                {errors.symbol && (
                  <p className="text-accent-danger text-[11px] mt-1">{errors.symbol}</p>
                )}
                <p className="text-[11px] text-content-tertiary mt-2">
                  Auto-uppercased. Letters and numbers only, max 8 characters.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-medium text-content-secondary mb-2">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    placeholder="A frog token from the future, deployed on XLayer..."
                    rows={4}
                    value={store.description}
                    onChange={(e) =>
                      store.setField("description", e.target.value)
                    }
                    maxLength={280}
                    className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 pb-8 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] text-content-tertiary">
                    {store.description.length}/280
                  </span>
                </div>
                <p className="text-[11px] text-content-tertiary mt-2">
                  A short pitch (max 280 chars).
                </p>
              </div>
            </>
          )}

          {/* ============ Step 2: Socials ============ */}
          {currentStep === 2 && (
            <>
              <div>
                <label className="block text-[13px] font-medium text-content-secondary mb-3">
                  Social links (optional)
                </label>
                <p className="text-[11px] text-content-tertiary -mt-2 mb-4">
                  Add links to your community channels. All fields are optional.
                </p>
                <div className="space-y-4">
                  {/* Twitter / X */}
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <X className="w-4 h-4 text-content-tertiary" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://x.com/yourtoken"
                        value={store.twitter}
                        onChange={(e) => {
                          store.setField("twitter", e.target.value);
                          if (errors.twitter)
                            setErrors((prev) => ({ ...prev, twitter: undefined }));
                        }}
                        className={cn(
                          "w-full bg-surface-highlight border rounded-lg pl-10 pr-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors",
                          errors.twitter ? "border-accent-danger" : "border-border",
                        )}
                      />
                    </div>
                    {errors.twitter && (
                      <p className="text-accent-danger text-[11px] mt-1">{errors.twitter}</p>
                    )}
                  </div>

                  {/* Telegram */}
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Send className="w-4 h-4 text-content-tertiary" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://t.me/yourtoken"
                        value={store.telegram}
                        onChange={(e) => {
                          store.setField("telegram", e.target.value);
                          if (errors.telegram)
                            setErrors((prev) => ({ ...prev, telegram: undefined }));
                        }}
                        className={cn(
                          "w-full bg-surface-highlight border rounded-lg pl-10 pr-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors",
                          errors.telegram ? "border-accent-danger" : "border-border",
                        )}
                      />
                    </div>
                    {errors.telegram && (
                      <p className="text-accent-danger text-[11px] mt-1">{errors.telegram}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Globe className="w-4 h-4 text-content-tertiary" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://yourtoken.com"
                        value={store.website}
                        onChange={(e) => {
                          store.setField("website", e.target.value);
                          if (errors.website)
                            setErrors((prev) => ({ ...prev, website: undefined }));
                        }}
                        className={cn(
                          "w-full bg-surface-highlight border rounded-lg pl-10 pr-4 py-2.5 text-content-primary placeholder:text-content-tertiary text-[13px] focus:outline-none focus:border-accent-primary/50 transition-colors",
                          errors.website ? "border-accent-danger" : "border-border",
                        )}
                      />
                    </div>
                    {errors.website && (
                      <p className="text-accent-danger text-[11px] mt-1">{errors.website}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============ Step 3: Curve ============ */}
          {currentStep === 3 && (
            <div className="bg-surface-highlight rounded-xl border border-border p-5 space-y-4">
              <h3 className="text-content-primary text-[14px] font-semibold mb-1">
                Bonding Curve Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-1">
                    Curve S
                  </p>
                  <input
                    type="number"
                    value={store.curveS}
                    onChange={(e) => store.setField("curveS", Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-content-primary font-mono text-sm"
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-1">
                    Total Supply
                  </p>
                  <p className="text-content-primary text-[14px] font-medium font-mono">
                    21,000,000 tokens
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-1">
                    Curve Type
                  </p>
                  <p className="text-content-primary text-[14px] font-medium">
                    Exponential Bonding Curve
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-1">
                    Graduation Threshold
                  </p>
                  <p className="text-content-primary text-[14px] font-medium font-mono">
                    100,000 OKB reserve
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============ Step 4: Deploy ============ */}
          {currentStep === 4 && (
            <>
              {!isConnected && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <p className="text-content-tertiary text-[14px]">
                    Please connect your wallet to deploy
                  </p>
                </div>
              )}

              {isConnected && deployStatus === "idle" && (
                <div className="space-y-4">
                  <h3 className="text-content-primary text-[14px] font-semibold">
                    Review your token
                  </h3>

                  {/* Summary Card */}
                  <div className="bg-surface-highlight rounded-xl border border-border p-5 space-y-4">
                    {/* Image + Name/Symbol */}
                    <div className="flex items-center gap-4">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt="Token"
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                          <span className="text-content-tertiary text-xl font-bold">
                            {store.symbol.slice(0, 2) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-content-primary text-[15px] font-semibold">
                          {store.name || "Unnamed Token"}
                        </p>
                        <p className="text-content-tertiary text-[13px] font-mono">
                          ${store.symbol || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {store.description && (
                      <div>
                        <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-1">
                          Description
                        </p>
                        <p className="text-content-secondary text-[13px]">
                          {store.description}
                        </p>
                      </div>
                    )}

                    {/* Socials */}
                    {(store.twitter || store.telegram || store.website) && (
                      <div>
                        <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-2">
                          Socials
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {store.twitter && (
                            <a
                              href={store.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] text-accent-primary hover:underline"
                            >
                              <X className="w-3.5 h-3.5" />
                              X / Twitter
                            </a>
                          )}
                          {store.telegram && (
                            <a
                              href={store.telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] text-accent-primary hover:underline"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Telegram
                            </a>
                          )}
                          {store.website && (
                            <a
                              href={store.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13px] text-accent-primary hover:underline"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Curve Summary */}
                    <div>
                      <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-2">
                        Curve Parameters
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        <span className="text-content-tertiary text-[12px]">Total Supply</span>
                        <span className="text-content-secondary text-[12px] font-mono">21,000,000</span>
                        <span className="text-content-tertiary text-[12px]">Curve Type</span>
                        <span className="text-content-secondary text-[12px]">Exponential</span>
                        <span className="text-content-tertiary text-[12px]">Curve S</span>
                        <span className="text-content-secondary text-[12px] font-mono">{store.curveS}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                  <p className="text-content-secondary text-[14px] font-medium">
                    {deployStatus === "uploading" ? "Uploading metadata..." : "Building transaction..."}
                  </p>
                  <p className="text-content-tertiary text-[12px]">
                    Please do not close this page.
                  </p>
                </div>
              )}

              {/* Success State */}
              {deployStatus === "success" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-success/20 border border-accent-success flex items-center justify-center">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-accent-success"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-accent-success text-[16px] font-semibold">
                    Token created successfully!
                  </p>
                  <p className="text-content-tertiary text-[13px] text-center max-w-sm">
                    Your transaction has been submitted. The token will appear on the explore page shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-[13px]"
                  >
                    View Explore
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error State */}
              {deployStatus === "error" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-danger/20 border border-accent-danger flex items-center justify-center">
                    <X className="w-6 h-6 text-accent-danger" />
                  </div>
                  <p className="text-accent-danger text-[16px] font-semibold">
                    Deployment failed
                  </p>
                  <p className="text-content-tertiary text-[13px] text-center max-w-sm">
                    {deployError || "Something went wrong. Please try again."}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-[13px]"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}

          {/* ============ Navigation ============ */}
          {!isLoading && deployStatus !== "success" && (
            <div
              className={cn(
                "pt-4 flex",
                currentStep > 1 ? "justify-between" : "justify-end",
              )}
            >
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent border border-border text-content-primary font-semibold rounded-lg hover:bg-surface-highlight transition-all text-[13px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-[13px]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {currentStep === 4 && isConnected && (
                <button
                  type="button"
                  onClick={handleDeploy}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5 text-[13px]"
                >
                  Deploy
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
