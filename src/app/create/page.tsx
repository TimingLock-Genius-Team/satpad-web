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
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Please upload a PNG, JPG, WebP, or GIF image." }));
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
    <div className="w-full min-h-screen relative flex flex-col items-center pt-8 md:pt-16 px-4 pb-20 overflow-hidden font-sans">
      {/* Full Page Decorative Background Elements (Homepage Style) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-accent-success/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent-primary/5 rounded-full blur-[150px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-[900px] w-full relative z-10">
        {/* Header */}
        <div className="mb-10 text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-surface-highlight border border-border/50 text-[10px] font-mono font-bold tracking-widest text-content-secondary mb-6 opacity-0 animate-fade-in-up uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            DEPLOYMENT_PROTOCOL // INIT
          </div>
          <h1 className="text-[3rem] md:text-[4.5rem] leading-[1.05] font-bold tracking-tighter mb-4 text-content-primary opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Launch a <span className="text-accent-primary italic pr-2">token</span>
          </h1>
          <p className="text-content-secondary text-lg md:text-xl font-mono tracking-tight opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Permanent. Public. Powered by math.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 relative opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute left-0 top-6 w-full h-[1px] bg-border z-0" />
          <div
            className={cn(
              "absolute left-0 top-6 h-[2px] bg-accent-primary z-0 transition-all duration-500 shadow-[0_0_10px_rgba(46,232,144,0.5)]",
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
                  "relative z-10 flex flex-col gap-3",
                  i === 0 && "items-start",
                  i === STEPS.length - 1 && "items-end",
                  i !== 0 && i !== STEPS.length - 1 && "items-center",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-[10px] flex items-center justify-center font-mono font-bold text-[14px] border-2 transition-all duration-300 transform relative overflow-hidden",
                    isActive && "bg-[#0A0A0A] border-accent-primary text-accent-primary shadow-[0_0_20px_rgba(46,232,144,0.4)] scale-110 rotate-3",
                    isCompleted && "bg-accent-primary border-accent-primary text-surface-base shadow-[0_0_15px_rgba(46,232,144,0.3)]",
                    !isActive && !isCompleted && "bg-[#0A0A0A] border-border text-content-tertiary",
                  )}
                >
                  {isActive && <div className="absolute inset-0 bg-accent-primary/20" />}
                  <span className="relative z-10">
                    {isCompleted ? (
                      <svg
                        width="18"
                        height="18"
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
                      `0${step.id}`
                    )}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-mono tracking-widest uppercase transition-colors duration-300 bg-surface-base/80 px-1.5 py-0.5 rounded backdrop-blur-sm",
                    isActive && "text-accent-primary font-bold shadow-[0_0_10px_rgba(46,232,144,0.2)]",
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
        <div className="bg-surface/60 backdrop-blur-xl border border-border/50 rounded-[12px] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group/form opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-primary/20 rounded-full blur-[100px] opacity-0 group-hover/form:opacity-100 transition-opacity duration-700 pointer-events-none" />
          {/* ============ Step 1: Basics ============ */}
          {currentStep === 1 && (
            <>
              {/* Image Upload */}
              <div className="relative z-10">
                <label className="block text-[10px] font-mono tracking-widest uppercase font-bold text-content-secondary mb-3">
                  Image_Source <span className="text-content-tertiary font-normal lowercase">(optional)</span>
                </label>
                <div className="flex items-center gap-6">
                  <div
                    className={cn(
                      "w-[90px] h-[90px] flex-shrink-0 rounded-[12px] bg-[#0A0A0A] border border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] group/upload",
                      store.image
                        ? "border-border/50"
                        : "border-border/50 hover:border-accent-primary hover:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
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
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-surface/90 backdrop-blur rounded-[6px] flex items-center justify-center hover:bg-accent-danger/20 hover:text-accent-danger transition-colors border border-border/50"
                        >
                          <X className="w-3 h-3 text-content-primary transition-colors" />
                        </button>
                      </>
                    ) : (
                      <Plus className="w-8 h-8 text-content-tertiary group-hover/upload:text-accent-primary transition-colors group-hover/upload:scale-110" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-content-primary text-[13px] font-medium mb-1.5">
                      Drag and drop, or click to choose
                    </p>
                    <p className="text-content-tertiary text-[11px] font-mono">
                      PNG / JPG / WebP / GIF - 512x512 max 1MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {errors.image && (
                  <div className="mt-3 px-3 py-2.5 bg-accent-danger/10 border border-accent-danger/30 rounded-[8px] flex items-center gap-2.5 text-accent-danger transition-all duration-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[12px] font-mono">{errors.image}</p>
                  </div>
                )}
              </div>

              {/* Token Name */}
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-mono tracking-widest uppercase font-bold text-content-secondary">
                    Token_Name <span className="text-accent-warning">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-content-tertiary">
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
                    "w-full bg-[#0A0A0A] border rounded-[12px] px-4 py-3 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none transition-all duration-300",
                    errors.name ? "border-accent-danger/50 focus:border-accent-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-border/50 focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
                  )}
                />
                {errors.name && (
                  <p className="text-accent-danger text-[11px] font-mono mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Symbol */}
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-mono tracking-widest uppercase font-bold text-content-secondary">
                    Ticker_Symbol <span className="text-accent-warning">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-content-tertiary">
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
                    "w-full bg-[#0A0A0A] border rounded-[12px] px-4 py-3 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none transition-all duration-300 font-mono font-bold tracking-wider",
                    errors.symbol ? "border-accent-danger/50 focus:border-accent-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-border/50 focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
                  )}
                />
                {errors.symbol && (
                  <p className="text-accent-danger text-[11px] font-mono mt-1.5">{errors.symbol}</p>
                )}
                <p className="text-[10px] font-mono text-content-tertiary mt-2">
                  Auto-uppercased. Letters and numbers only, max 8 characters.
                </p>
              </div>

              {/* Description */}
              <div className="relative z-10">
                <label className="block text-[10px] font-mono tracking-widest uppercase font-bold text-content-secondary mb-2">
                  Metadata_Desc
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
                    className="w-full bg-[#0A0A0A] border border-border/50 rounded-[12px] px-4 py-3 pb-8 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)] transition-all duration-300 resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-mono text-content-tertiary">
                    {store.description.length}/280
                  </span>
                </div>
                <p className="text-[10px] font-mono text-content-tertiary mt-2">
                  A short pitch (max 280 chars).
                </p>
              </div>
            </>
          )}

          {/* ============ Step 2: Socials ============ */}
          {currentStep === 2 && (
            <div className="relative z-10">
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase font-bold text-content-secondary mb-3">
                  Social_Links <span className="text-content-tertiary font-normal lowercase">(optional)</span>
                </label>
                <p className="text-[10px] font-mono text-content-tertiary -mt-2 mb-6">
                  Add links to your community channels. All fields are optional.
                </p>
                <div className="space-y-5">
                  {/* Twitter / X */}
                  <div className="group/input">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <X className="w-4 h-4 text-content-tertiary group-focus-within/input:text-accent-primary transition-colors" />
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
                          "w-full bg-[#0A0A0A] border rounded-[12px] pl-11 pr-4 py-3 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none transition-all duration-300",
                          errors.twitter ? "border-accent-danger/50 focus:border-accent-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-border/50 focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
                        )}
                      />
                    </div>
                    {errors.twitter && (
                      <p className="text-accent-danger text-[11px] font-mono mt-1.5">{errors.twitter}</p>
                    )}
                  </div>

                  {/* Telegram */}
                  <div className="group/input">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Send className="w-4 h-4 text-content-tertiary group-focus-within/input:text-accent-primary transition-colors" />
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
                          "w-full bg-[#0A0A0A] border rounded-[12px] pl-11 pr-4 py-3 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none transition-all duration-300",
                          errors.telegram ? "border-accent-danger/50 focus:border-accent-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-border/50 focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
                        )}
                      />
                    </div>
                    {errors.telegram && (
                      <p className="text-accent-danger text-[11px] font-mono mt-1.5">{errors.telegram}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="group/input">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Globe className="w-4 h-4 text-content-tertiary group-focus-within/input:text-accent-primary transition-colors" />
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
                          "w-full bg-[#0A0A0A] border rounded-[12px] pl-11 pr-4 py-3 text-content-primary placeholder:text-content-tertiary text-[14px] shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] focus:outline-none transition-all duration-300",
                          errors.website ? "border-accent-danger/50 focus:border-accent-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-border/50 focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)]",
                        )}
                      />
                    </div>
                    {errors.website && (
                      <p className="text-accent-danger text-[11px] font-mono mt-1.5">{errors.website}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ Step 3: Curve ============ */}
          {currentStep === 3 && (
            <div className="space-y-5 relative z-10">
              <div className="bg-[#0A0A0A] rounded-[12px] border border-border/50 p-6 space-y-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                <h3 className="text-content-primary text-[10px] font-mono tracking-widest uppercase font-bold mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_5px_rgba(46,232,144,0.8)] animate-pulse" />
                  Bonding_Curve_Config
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-1.5">
                      Curve S_Param
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
                      className="w-full bg-[#111] border border-border/50 rounded-[8px] px-3 py-2 text-content-primary font-mono text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-[0_0_10px_rgba(46,232,144,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-1.5">
                      Total Supply
                    </p>
                    <p className="text-content-primary text-[14px] font-medium font-mono bg-[#111] border border-border/20 rounded-[8px] px-3 py-2 opacity-80">
                      21,000,000 tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-1.5">
                      Curve Type
                    </p>
                    <p className="text-content-primary text-[14px] font-medium font-mono bg-[#111] border border-border/20 rounded-[8px] px-3 py-2 opacity-80">
                      Exponential
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-1.5">
                      Graduation Threshold
                    </p>
                    <p className="text-content-primary text-[14px] font-medium font-mono bg-[#111] border border-border/20 rounded-[8px] px-3 py-2 opacity-80">
                      100,000 OKB
                    </p>
                  </div>
                </div>
              </div>

              {/* Curve Preview */}
              <div className="rounded-[12px] overflow-hidden border border-border/50 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                <CurvePreview
                  curveS={curveSNormalized}
                  feeBps={feeBps}
                  launchBuyNative={store.initialBuyEth}
                  onLaunchBuyNativeChange={(v) => store.setField("initialBuyEth", v)}
                />
              </div>

              <div className="bg-[#0A0A0A] rounded-[12px] border border-border/50 p-6 space-y-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-[50px] pointer-events-none" />
                <h3 className="text-content-primary text-[10px] font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_5px_rgba(46,232,144,0.8)]" />
                  Initial_Purchase <span className="text-content-tertiary font-normal lowercase tracking-normal">(optional)</span>
                </h3>
                <p className="text-[11px] font-mono text-content-tertiary leading-relaxed">
                  One atomic transaction: create token + buy on curve. Uses native gas token.
                </p>
                <p className="text-[11px] font-mono text-content-tertiary leading-relaxed">
                  Launch buy can mint at most {LAUNCH_BUY_MAX_MINT_BPS / 100}% of supply. Max is{" "}
                  <span className="font-bold text-accent-primary">{launchBuyMaxNative} native</span>.
                </p>
                <div className="mt-2 relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider">Amount (Native)</p>
                    <button
                      type="button"
                      onClick={() => store.setField("initialBuyEth", formatEther(launchBuyMaxWei))}
                      className="text-[10px] font-mono font-bold text-accent-primary hover:text-accent-primary/80 transition-colors bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/30"
                    >
                      MAX
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
                    className="w-full bg-[#111] border border-border/50 rounded-[8px] px-4 py-2.5 text-content-primary font-mono text-[14px] focus:outline-none focus:border-accent-primary/50 focus:shadow-[0_0_15px_rgba(46,232,144,0.15)] transition-all"
                  />
                  {initialBuyValidationError && (
                    <p className="mt-2 text-[11px] font-mono text-accent-danger">
                      {initialBuyValidationError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ Step 4: Deploy ============ */}
          {currentStep === 4 && (
            <div className="relative z-10">
              {!isConnected && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full border border-accent-warning/30 bg-accent-warning/10 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-accent-warning animate-pulse" />
                  </div>
                  <p className="text-content-tertiary text-[12px] font-mono uppercase tracking-widest">
                    Wallet connection required
                  </p>
                </div>
              )}

              {isConnected && deployStatus === "idle" && (
                <div className="space-y-4">
                  <h3 className="text-content-primary text-[10px] font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_5px_rgba(46,232,144,0.8)] animate-pulse" />
                    Review_Payload
                  </h3>

                  {/* Summary Card */}
                  <div className="bg-[#0A0A0A] rounded-[12px] border border-border/50 p-6 space-y-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-primary/5 rounded-full blur-[40px] pointer-events-none" />
                    
                    {/* Image + Name/Symbol */}
                    <div className="flex items-center gap-4 relative z-10 border-b border-border/30 pb-5">
                      {store.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={store.image}
                          alt="Token"
                          className="w-16 h-16 rounded-[10px] object-cover flex-shrink-0 border border-border/50 shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-[10px] bg-[#111] border border-border/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                          <span className="text-content-tertiary text-xl font-bold font-mono">
                            {store.symbol.slice(0, 2) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-content-primary text-[16px] font-bold tracking-tight">
                          {store.name || "Unnamed Token"}
                        </p>
                        <p className="text-accent-primary text-[12px] font-mono font-bold mt-1 tracking-wider bg-accent-primary/10 px-2 py-0.5 rounded w-fit border border-accent-primary/20">
                          ${store.symbol || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {store.description && (
                      <div className="relative z-10">
                        <p className="text-[10px] text-content-tertiary font-mono uppercase tracking-widest mb-1.5">
                          Description
                        </p>
                        <p className="text-content-secondary text-[13px] leading-relaxed">
                          {store.description}
                        </p>
                      </div>
                    )}

                    {/* Socials */}
                    {(store.twitter || store.telegram || store.website) && (
                      <div className="relative z-10">
                        <p className="text-[10px] text-content-tertiary font-mono uppercase tracking-widest mb-2">
                          Socials
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {store.twitter && (
                            <a
                              href={store.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] text-accent-primary hover:text-accent-primary/80 transition-colors font-mono"
                            >
                              <X className="w-3 h-3" />
                              [X]
                            </a>
                          )}
                          {store.telegram && (
                            <a
                              href={store.telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] text-accent-primary hover:text-accent-primary/80 transition-colors font-mono"
                            >
                              <Send className="w-3 h-3" />
                              [TG]
                            </a>
                          )}
                          {store.website && (
                            <a
                              href={store.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] text-accent-primary hover:text-accent-primary/80 transition-colors font-mono"
                            >
                              <Globe className="w-3 h-3" />
                              [WEB]
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Curve Summary */}
                    <div className="relative z-10 bg-[#111] p-4 rounded-[8px] border border-border/30">
                      <p className="text-[10px] text-content-tertiary font-mono uppercase tracking-widest mb-3">
                        Curve Parameters
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <span className="text-content-tertiary text-[11px] font-mono">Total Supply</span>
                        <span className="text-content-primary text-[11px] font-mono text-right">21,000,000</span>
                        <span className="text-content-tertiary text-[11px] font-mono">Curve Type</span>
                        <span className="text-content-primary text-[11px] font-mono text-right">Exponential</span>
                        <span className="text-content-tertiary text-[11px] font-mono">Curve S</span>
                        <span className="text-accent-primary text-[11px] font-mono font-bold text-right">{store.curveS}</span>
                      </div>
                    </div>

                    {store.initialBuyEth.trim().length > 0 && (
                      <div className="relative z-10 bg-accent-primary/5 p-4 rounded-[8px] border border-accent-primary/20">
                        <p className="text-[10px] text-accent-primary font-mono uppercase tracking-widest mb-2">
                          Initial_Purchase
                        </p>
                        <p className="text-content-primary text-[13px] font-mono font-bold">
                          {store.initialBuyEth.trim()} native{" "}
                          <span className="text-content-tertiary font-normal text-[11px]">(atomic tx)</span>
                        </p>
                        {initialBuyValidationError && (
                          <p className="mt-2 text-[11px] font-mono text-accent-danger">
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
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-accent-primary/30 animate-[spin_3s_linear_infinite]" />
                    <div className="w-12 h-12 rounded-full border border-accent-primary/50 border-t-transparent animate-[spin_2s_linear_infinite_reverse] absolute" />
                    <div className="w-2 h-2 bg-accent-primary shadow-[0_0_10px_rgba(46,232,144,0.8)] absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-accent-primary text-[13px] font-mono font-bold tracking-widest uppercase">
                      {deployStatus === "uploading" ? "Uploading_Metadata..." : "Building_Tx..."}
                    </p>
                    <p className="text-content-tertiary text-[11px] font-mono">
                      DO NOT CLOSE THIS PAGE
                    </p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {deployStatus === "success" && (
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="w-16 h-16 rounded-full bg-accent-success/10 border border-accent-success/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(var(--accent-success-rgb),0.2)]">
                    <div className="absolute inset-0 rounded-full border border-accent-success animate-ping opacity-20 [animation-duration:2s]" />
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-accent-success drop-shadow-[0_0_8px_rgba(var(--accent-success-rgb),0.8)]"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-accent-success text-[16px] font-mono font-bold tracking-widest uppercase">
                      DEPLOYMENT_SUCCESS
                    </p>
                    <p className="text-content-tertiary text-[12px] font-mono max-w-sm leading-relaxed">
                      {store.initialBuyEth.trim()
                        ? "Token created and initial buy complete. Propagating to explore..."
                        : "Token created successfully. Propagating to explore..."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="mt-4 inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-surface-base font-bold rounded-[8px] hover:bg-accent-primary/90 transition-all hover:-translate-y-0.5 text-[12px] uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(46,232,144,0.3)] hover:shadow-[0_0_30px_rgba(46,232,144,0.5)]"
                  >
                    View Explore
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error State */}
              {deployStatus === "error" && (
                <div className="flex flex-col items-center py-12 w-full animate-in fade-in zoom-in-95 duration-400">
                  <div className="w-16 h-16 rounded-full bg-accent-danger/10 border border-accent-danger/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative">
                    <div className="absolute inset-0 rounded-full border border-accent-danger animate-ping opacity-20 [animation-duration:2s]" />
                    <X className="w-8 h-8 text-accent-danger relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </div>
                  
                  <h3 className="text-accent-danger text-[16px] font-mono font-bold tracking-widest uppercase mb-2">
                    DEPLOYMENT_FAILED
                  </h3>
                  
                  <p className="text-content-tertiary text-[12px] font-mono mb-8 text-center max-w-md">
                    Process terminated unexpectedly. See diagnostic log.
                  </p>

                  <div className="w-full bg-[#0A0A0A] border border-accent-danger/30 rounded-[12px] overflow-hidden mb-8 relative shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
                    <div className="bg-accent-danger/10 px-4 py-2.5 border-b border-accent-danger/20 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-danger shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      <span className="text-[10px] font-mono text-accent-danger/90 font-bold uppercase tracking-widest">Diagnostic_Log</span>
                    </div>
                    <div className="p-5 max-h-[200px] overflow-y-auto custom-scrollbar">
                      <p className="text-accent-danger text-[12px] font-mono leading-relaxed break-words whitespace-pre-wrap select-text opacity-90">
                        {deployError || "ERR_UNKNOWN_EXCEPTION"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#111] border border-border/50 text-content-primary font-bold font-mono text-[12px] tracking-widest uppercase rounded-[8px] hover:bg-surface-highlight hover:border-content-tertiary transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Retry_Process
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============ Navigation ============ */}
          {!isLoading && deployStatus !== "success" && (
            <div
              className={cn(
                "pt-6 flex relative z-10 border-t border-border/30 mt-4",
                currentStep > 1 ? "justify-between" : "justify-end",
              )}
            >
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-border/50 text-content-primary font-mono font-bold text-[11px] uppercase tracking-widest rounded-[8px] hover:bg-surface-highlight transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-surface-base font-mono font-bold text-[12px] uppercase tracking-widest rounded-[8px] hover:bg-accent-primary/90 transition-all hover:-translate-y-0.5 shadow-[0_0_15px_rgba(46,232,144,0.3)] hover:shadow-[0_0_25px_rgba(46,232,144,0.5)]"
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
                    "inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-surface-base font-mono font-bold text-[12px] uppercase tracking-widest rounded-[8px] transition-all",
                    isLoading || initialBuyValidationError
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-accent-primary/90 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(46,232,144,0.4)] hover:shadow-[0_0_30px_rgba(46,232,144,0.6)]"
                  )}
                >
                  Execute_Deploy
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
