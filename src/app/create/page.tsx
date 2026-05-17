"use client";

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient, usePublicClient, useSwitchChain, useChainId } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther, parseEther } from "viem";
import { Plus, ChevronRight, ArrowLeft, Globe, X, Send } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCreateTokenStore } from "@/store/createToken";
import { useMetadataUpload, useCreateBuild, useConfig } from "@/lib/api-hooks";
import { chainForSatpadNetwork } from "@/config/chains";
import { sendPreparedTransactions } from "@/lib/wallet-txs";
import { buildMetadataSigningMessage, randomMetadataNonce } from "@/lib/metadata-sign";
import { getDefaultNetwork } from "@/lib/api";
import { uploadImageToIPFS, isPinataConfigured } from "@/lib/ipfs";
import {
  CREATE_FLOW_CURVE_S_MIN,
  CREATE_FLOW_CURVE_S_MAX,
  LAUNCH_BUY_MAX_MINT_BPS,
  clampCurveSForCreateFlow,
  maxLaunchBuyGrossWei,
  validateOptionalInitialBuyNativeInput,
} from "@/lib/launch-buy-limits";
import { CurvePreview } from "@/components/create/CurvePreview";
import type { ApiCreateBuildRequest } from "@/lib/api-types";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Socials" },
  { id: 3, label: "Curve" },
  { id: 4, label: "Deploy" },
] as const;

const INITIAL_BUY_SLIPPAGE_BPS = 100;

function isValidUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function normLink(s: string): string | null {
  const t = s.trim();
  return t.length > 0 ? t : null;
}

function firstSocialUri(twitter: string, telegram: string, website: string): string {
  return normLink(website) || normLink(twitter) || normLink(telegram) || "";
}

export default function CreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ image?: string; name?: string; symbol?: string; twitter?: string; telegram?: string; website?: string }>({});
  const [deployStatus, setDeployStatus] = useState<"idle" | "uploading" | "building" | "success" | "error">("idle");
  const [deployError, setDeployError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const curveSInputRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);
  const store = useCreateTokenStore();
  const network = getDefaultNetwork();

  const metadataUpload = useMetadataUpload();
  const createBuild = useCreateBuild();
  const config = useConfig(network);
  const feeBps = config.data?.deployment.curve.feeBps ?? 30;
  const curveSNormalized = clampCurveSForCreateFlow(store.curveS);
  const launchBuyMaxWei = maxLaunchBuyGrossWei(curveSNormalized, feeBps);
  const launchBuyMaxNative = Number(formatEther(launchBuyMaxWei)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
  const initialBuyValidationError = validateOptionalInitialBuyNativeInput(store.initialBuyEth.trim(), store.curveS, feeBps);

  useEffect(() => {
    if (currentStep !== 3) return;
    const el = curveSInputRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el) return;
      if (e.ctrlKey) return;
      e.preventDefault();

      const { curveS: raw, setField } = useCreateTokenStore.getState();
      const base =
        typeof raw === "number" &&
        Number.isFinite(raw) &&
        raw >= CREATE_FLOW_CURVE_S_MIN &&
        raw <= CREATE_FLOW_CURVE_S_MAX
          ? Math.trunc(raw)
          : 0;
      const delta = e.deltaY < 0 ? 1 : -1;
      const next = Math.max(
        CREATE_FLOW_CURVE_S_MIN,
        Math.min(CREATE_FLOW_CURVE_S_MAX, base + delta),
      );
      if (next !== raw) setField("curveS", next);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [currentStep]);

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
    if (currentStep === 3) {
      const s = clampCurveSForCreateFlow(store.curveS);
      if (s !== store.curveS) {
        store.setField("curveS", s);
      }
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
      setErrors((prev) => ({ ...prev, image: "Please upload a PNG, JPG, or WebP image." }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 1MB." }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    imageFileRef.current = file;
    store.setField("imageIpfsUri", null);
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
    store.setField("imageIpfsUri", null);
    imageFileRef.current = null;
    setErrors((prev) => ({ ...prev, image: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeploy = async () => {
    const chain = chainForSatpadNetwork(network);

    if (!walletAddress || !walletClient || !publicClient) return;

    try {
      setDeployStatus("uploading");
      setDeployError("");

      const curveSForTx = clampCurveSForCreateFlow(store.curveS);
      const initialBuyPreflight = store.initialBuyEth.trim();
      if (initialBuyPreflight.length > 0) {
        const preflightErr = validateOptionalInitialBuyNativeInput(initialBuyPreflight, curveSForTx, feeBps);
        if (preflightErr) throw new Error(preflightErr);
      }

      let metadataURI = store.metadataURI;

      if (!metadataURI) {
        const hasPinata = isPinataConfigured();

        let imageForMetadata: string | null = store.imageIpfsUri;

        if (!imageForMetadata && imageFileRef.current && hasPinata) {
          const result = await uploadImageToIPFS(imageFileRef.current);
          imageForMetadata = result.ipfsUri;
          store.setField("imageIpfsUri", result.ipfsUri);
        }

        if (!imageForMetadata) {
          imageForMetadata = store.image;
        }

        const nonce = randomMetadataNonce();
        const expiresAt = Math.floor(Date.now() / 1000) + 900;
        const payload = {
          name: store.name.trim(),
          symbol: store.symbol.trim(),
          description: store.description.trim(),
          image: imageForMetadata,
          website: normLink(store.website),
          twitter: normLink(store.twitter),
          telegram: normLink(store.telegram),
        };
        const message = buildMetadataSigningMessage({
          ...payload,
          wallet: walletAddress as `0x${string}`,
          nonce,
          expiresAt,
        });
        const signature = await walletClient.signMessage({
          account: walletAddress as `0x${string}`,
          message,
        });

        const metadataResult = await metadataUpload.mutateAsync({
          ...payload,
          wallet: walletAddress,
          signature,
          message,
          nonce,
          expiresAt,
        });
        metadataURI = metadataResult.metadataURI;
        store.setField("metadataURI", metadataURI);
      }

      setDeployStatus("building");

      let buyWei = BigInt(0);
      if (initialBuyPreflight.length > 0) {
        buyWei = parseEther(initialBuyPreflight as `${string}`);
      }

      const buildRequest: ApiCreateBuildRequest = {
        network,
        name: store.name,
        symbol: store.symbol,
        description: store.description,
        metadataURI,
        socialURI: firstSocialUri(store.twitter, store.telegram, store.website),
        curveS: curveSForTx,
      };
      if (buyWei > BigInt(0)) {
        buildRequest.initialBuyWei = buyWei.toString();
        buildRequest.recipient = walletAddress as string;
        buildRequest.slippageBps = INITIAL_BUY_SLIPPAGE_BPS;
      }

      const buildResult = await createBuild.mutateAsync(buildRequest);

      if (switchChainAsync && chainId !== chain.id) {
        await switchChainAsync({ chainId: chain.id });
      }

      await sendPreparedTransactions(walletClient, publicClient, [buildResult.tx]);

      await queryClient.invalidateQueries({ queryKey: ["tokens"] });
      setDeployStatus("success");

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                {errors.image && (
                  <div className="mt-3 px-3 py-2.5 bg-accent-danger/10 border border-accent-danger/20 rounded-lg flex items-center gap-2.5 text-accent-danger transition-all duration-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[13px] font-medium">{errors.image}</p>
                  </div>
                )}
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
            <div className="space-y-5">
              <div className="bg-surface-highlight rounded-xl border border-border p-5 space-y-4">
                <h3 className="text-content-primary text-[14px] font-semibold mb-1">
                  Bonding Curve Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-content-tertiary mb-1">
                      Curve S
                    </p>
                    <input
                      ref={curveSInputRef}
                      type="text"
                      inputMode="numeric"
                      value={store.curveS || ""}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, ""); // 移除非数字字符
                        val = val.replace(/^0+/, ""); // 移除前导零
                        if (val === "") {
                          store.setField("curveS", 0);
                        } else {
                          const num = Number(val);
                          if (num <= CREATE_FLOW_CURVE_S_MAX) {
                            store.setField("curveS", num);
                          }
                        }
                      }}
                      onBlur={() => {
                        // 失去焦点时，确保值在 1–CREATE_FLOW_CURVE_S_MAX 之间
                        const finalVal = Math.max(1, Math.min(CREATE_FLOW_CURVE_S_MAX, store.curveS));
                        store.setField("curveS", finalVal);
                      }}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-content-primary font-mono text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-content-tertiary mb-1">
                      Total Supply
                    </p>
                    <p className="text-content-primary text-[14px] font-medium font-mono">
                      21,000,000 tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-content-tertiary mb-1">
                      Curve Type
                    </p>
                    <p className="text-content-primary text-[14px] font-medium">
                      Exponential Bonding Curve
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-content-tertiary mb-1">
                      Graduation Threshold
                    </p>
                    <p className="text-content-primary text-[14px] font-medium font-mono">
                      100,000 OKB reserve
                    </p>
                  </div>
                </div>
              </div>

              {/* Curve Preview */}
              <CurvePreview
                curveS={curveSNormalized}
                feeBps={feeBps}
                launchBuyNative={store.initialBuyEth}
                onLaunchBuyNativeChange={(v) => store.setField("initialBuyEth", v)}
              />

              <div className="bg-surface-highlight rounded-xl border border-border p-5 space-y-3">
                <h3 className="text-content-primary text-[14px] font-semibold">
                  Initial purchase (optional)
                </h3>
                <p className="text-[11px] text-content-tertiary leading-relaxed">
                  One atomic transaction: create the token and buy on the curve (Four.meme-style). Uses native gas
                  token ( OKB on X Layer).
                </p>
                <p className="text-[11px] text-content-tertiary leading-relaxed">
                  Launch buy can mint at most {LAUNCH_BUY_MAX_MINT_BPS / 100}% of supply. Current max is{" "}
                  <span className="font-mono text-content-secondary">{launchBuyMaxNative} native</span> for this curve.
                </p>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[11px] text-content-tertiary">Amount (native)</p>
                    <button
                      type="button"
                      onClick={() => store.setField("initialBuyEth", formatEther(launchBuyMaxWei))}
                      className="text-[11px] font-semibold text-accent-primary hover:text-accent-primary/85 transition-colors tabular-nums"
                    >
                      Max
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Leave empty for create-only"
                    value={store.initialBuyEth}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      store.setField("initialBuyEth", v);
                    }}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-content-primary font-mono text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                  />
                  {initialBuyValidationError && (
                    <p className="mt-2 text-[11px] text-accent-danger">
                      {initialBuyValidationError}
                    </p>
                  )}
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
                        /* eslint-disable-next-line @next/next/no-img-element */
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

                    {store.initialBuyEth.trim().length > 0 && (
                      <div>
                        <p className="text-[11px] text-content-tertiary uppercase tracking-wider mb-2">
                          Initial purchase
                        </p>
                        <p className="text-content-secondary text-[13px] font-mono">
                          {store.initialBuyEth.trim()} native{" "}
                          <span className="text-content-tertiary">(single tx via factory)</span>
                        </p>
                        {initialBuyValidationError && (
                          <p className="mt-2 text-[11px] text-accent-danger">
                            {initialBuyValidationError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                  <p className="text-content-secondary text-[14px] font-medium">
                    {deployStatus === "uploading" ? "Uploading to IPFS & signing metadata..." : "Building transaction..."}
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
                    {store.initialBuyEth.trim()
                      ? "Launch and purchase are complete in one transaction. The token may take a moment to appear on Explore."
                      : "Your transaction has been submitted. The token will appear on the explore page shortly."}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all hover:-translate-y-0.5 text-[13px]"
                  >
                    View Explore
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error State */}
              {deployStatus === "error" && (
                <div className="flex flex-col items-center py-8 w-full animate-in fade-in zoom-in-95 duration-400">
                  <div className="w-14 h-14 rounded-full bg-accent-danger/10 border border-accent-danger/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
                    <div className="absolute inset-0 rounded-full border border-accent-danger/40 animate-ping opacity-20 [animation-duration:2s]" />
                    <X className="w-6 h-6 text-accent-danger relative z-10" />
                  </div>
                  
                  <h3 className="text-content-primary text-xl font-bold mb-2">
                    Deployment failed
                  </h3>
                  
                  <p className="text-content-tertiary text-[13px] mb-6 text-center max-w-md">
                    We encountered an error while trying to deploy your token. See the details below.
                  </p>

                  <div className="w-full bg-[#1A1112] border border-accent-danger/20 rounded-xl overflow-hidden mb-8 relative shadow-inner">
                    <div className="bg-accent-danger/10 px-4 py-2 border-b border-accent-danger/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-danger shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                      <span className="text-[10px] font-mono text-accent-danger/90 font-semibold uppercase tracking-widest">Error Log</span>
                    </div>
                    <div className="p-4 max-h-[180px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                      <p className="text-accent-danger/80 text-[12px] font-mono leading-relaxed break-words whitespace-pre-wrap select-text">
                        {deployError || "Something went wrong. Please try again."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-surface border border-border text-content-primary font-semibold rounded-lg hover:bg-surface-highlight hover:border-content-tertiary transition-all text-[13px]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg hover:bg-accent-primary/90 transition-all hover:-translate-y-0.5 text-[13px]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {currentStep === 4 && isConnected && deployStatus !== "error" && (
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={isLoading || Boolean(initialBuyValidationError)}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-surface-base font-semibold rounded-lg transition-all text-[13px]",
                    isLoading || initialBuyValidationError
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-accent-primary/90 hover:-translate-y-0.5"
                  )}
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
