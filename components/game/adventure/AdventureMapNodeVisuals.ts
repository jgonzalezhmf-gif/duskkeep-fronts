import type { AdventureNodeAssetId } from "@/lib/adventureMapAssets";
import type { AdventureVisualNode } from "./AdventureCampaignTypes";

export function getNodeAssetId(node: AdventureVisualNode): AdventureNodeAssetId {
  if (node.status === "locked") return "locked";
  if (node.status === "claimed" || node.status === "completed") return "cleared";
  if (node.type === "hidden") return "secret";
  return node.type === "locked" ? "locked" : node.type;
}

export function getNodeVisualScale(node: AdventureVisualNode, active: boolean) {
  if (active || node.status === "current") return node.type === "boss" ? 1.38 : 1.34;
  if (node.type === "boss") return 1.28;
  if (node.type === "chest") return 1.22;
  if (node.type === "elite") return 1.18;
  if (node.status === "locked") return 0.86;
  if (node.status === "cleared" || node.status === "claimed" || node.status === "completed") return 1.1;
  return 1.18;
}

export function getNodeAssetScale(node: AdventureVisualNode, active: boolean) {
  if (active || node.status === "current") return 1.08;
  if (node.type === "boss") return 1.08;
  if (node.type === "chest") return 1.06;
  if (node.status === "locked") return 0.96;
  return 1.04;
}

export function getNodeIcon(node: AdventureVisualNode): "battle" | "rewards" | "shield" | "adventure" {
  if (node.status === "locked") return "shield";
  if (node.type === "chest" || node.status === "cleared") return "rewards";
  if (node.type === "boss" || node.type === "elite") return "battle";
  return "adventure";
}

export function getNodeTheme(node: AdventureVisualNode, active: boolean, accent: string) {
  if (node.status === "locked") {
    return {
      border: "rgba(156,163,175,0.24)",
      innerBorder: "rgba(255,255,255,0.1)",
      background: "radial-gradient(circle at 42% 32%, rgba(93,103,118,0.34), rgba(13,16,22,0.94) 68%)",
      glow: "0 0 0 rgba(0,0,0,0)",
    };
  }
  if (node.status === "cleared" || node.status === "claimed" || node.status === "completed") {
    return {
      border: "rgba(152,209,174,0.28)",
      innerBorder: "rgba(152,209,174,0.18)",
      background: "radial-gradient(circle at 42% 32%, rgba(130,180,145,0.24), rgba(18,24,18,0.94) 70%)",
      glow: "0 0 14px rgba(99,180,121,0.12)",
    };
  }
  if (node.type === "boss") {
    return {
      border: "rgba(255,184,117,0.5)",
      innerBorder: "rgba(255,133,84,0.34)",
      background: "radial-gradient(circle at 42% 30%, rgba(255,147,84,0.36), rgba(47,17,14,0.96) 70%)",
      glow: active ? "0 0 24px rgba(255,147,84,0.34)" : "0 0 16px rgba(255,147,84,0.18)",
    };
  }
  if (node.type === "chest") {
    return {
      border: "rgba(245,212,152,0.48)",
      innerBorder: "rgba(245,196,81,0.3)",
      background: "radial-gradient(circle at 42% 30%, rgba(245,196,81,0.34), rgba(48,32,12,0.95) 70%)",
      glow: active ? "0 0 22px rgba(245,196,81,0.28)" : "0 0 13px rgba(245,196,81,0.14)",
    };
  }
  return {
    border: active ? "rgba(245,212,152,0.5)" : `${accent}80`,
    innerBorder: "rgba(145,205,255,0.24)",
    background: "radial-gradient(circle at 42% 30%, rgba(130,196,255,0.26), rgba(12,22,35,0.96) 70%)",
    glow: active ? "0 0 22px rgba(145,205,255,0.25)" : "0 0 12px rgba(145,205,255,0.12)",
  };
}
