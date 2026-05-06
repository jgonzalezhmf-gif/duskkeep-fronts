import type { HomeEffectId } from "@/lib/homeEffectAssets";

export const ADVENTURE_MAP_DESIGN = {
  width: 1920,
  height: 1080,
} as const;

export type AdventureMapNodeType =
  | "battle"
  | "elite"
  | "boss"
  | "chest"
  | "shrine"
  | "merchant"
  | "event"
  | "locked"
  | "hidden"
  | "danger";

export type AdventureMapNodeStatus = "locked" | "available" | "cleared" | "current" | "completed" | "claimed" | "hidden";

export type AdventureMapRouteState = "cleared" | "available" | "locked" | "boss";

export type AdventureNodeLayout = {
  id?: string;
  x: number;
  y: number;
  type?: AdventureMapNodeType;
  status?: AdventureMapNodeStatus;
  size?: number;
  zIndex?: number;
  connectsTo?: string[];
};

export type AdventureMapRouteLayout = {
  id: string;
  from: string;
  to: string;
  state?: AdventureMapRouteState;
  control1?: { x: number; y: number };
  control2?: { x: number; y: number };
};

export type AdventureMapPropType =
  | "campfire"
  | "small_camp"
  | "road_lantern"
  | "ruin_marker"
  | "hidden_glow"
  | "merchant_cart"
  | "hidden_glow_alt"
  | "flame_loop"
  | "flag_red_loop"
  | "portal_blue_loop"
  | "crystal_purple_loop"
  | "blue_flame_loop"
  | "purple_flame_loop"
  | "lantern_warm_loop"
  | "candle_loop"
  | "banner_red_loop"
  | "crow_fly_loop"
  | "clouds_dark_layer"
  | "chest_prop"
  | "camp_prop";

export type AdventureMapPropEffectLayout = {
  type: HomeEffectId;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  opacity?: number;
  durationMs?: number;
  enabled?: boolean;
};

export type AdventureMapPropLayout = {
  id: string;
  type: AdventureMapPropType;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
  zIndex: number;
  opacity?: number;
  enabled: boolean;
  effect?: AdventureMapPropEffectLayout;
  interaction?: {
    id: string;
    kind: "keyChest";
    keyCost?: number;
    unlockAfter?: string[];
    rewardId?: string;
    enabled?: boolean;
  };
};

export type AdventureMapPartyMarkerLayout = {
  x?: number;
  y?: number;
  size: number;
  zIndex: number;
  anchorNodeId?: string;
  style: "banner" | "token" | "camp";
};

export type AdventureMapChapterLayout = {
  nodes: AdventureNodeLayout[];
  routes?: AdventureMapRouteLayout[];
  props?: AdventureMapPropLayout[];
  partyMarker?: AdventureMapPartyMarkerLayout;
};

export const ADVENTURE_MAP_NODE_TYPES: AdventureMapNodeType[] = [
  "battle",
  "elite",
  "boss",
  "chest",
  "shrine",
  "merchant",
  "event",
  "locked",
  "hidden",
  "danger",
];

export const ADVENTURE_MAP_NODE_STATUSES: AdventureMapNodeStatus[] = [
  "locked",
  "available",
  "cleared",
  "current",
  "completed",
  "claimed",
  "hidden",
];

export const ADVENTURE_MAP_PROP_TYPES: AdventureMapPropType[] = [
  "campfire",
  "small_camp",
  "road_lantern",
  "ruin_marker",
  "hidden_glow",
  "merchant_cart",
  "hidden_glow_alt",
  "flame_loop",
  "flag_red_loop",
  "portal_blue_loop",
  "crystal_purple_loop",
  "blue_flame_loop",
  "purple_flame_loop",
  "lantern_warm_loop",
  "candle_loop",
  "banner_red_loop",
  "crow_fly_loop",
  "clouds_dark_layer",
  "chest_prop",
  "camp_prop",
];

export const ADVENTURE_MAP_INTERACTION_KINDS = ["keyChest"] as const;

export const ADVENTURE_MAP_CHAPTER_LAYOUTS: Record<number, AdventureMapChapterLayout> = {
  "1": {
    nodes: [
      {
        id: "c1l1",
        x: 865,
        y: 855,
        type: "battle",
        size: 50,
        zIndex: 20
      },
      {
        id: "c1l2",
        x: 874,
        y: 669,
        type: "battle",
        size: 46,
        zIndex: 20,
        connectsTo: ["c1l3", "c1l7"]
      },
      {
        id: "c1l3",
        x: 682,
        y: 598,
        type: "chest",
        size: 52,
        zIndex: 20
      },
      {
        id: "c1l4",
        x: 537,
        y: 529,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c1l5",
        x: 717,
        y: 494,
        type: "elite",
        size: 50,
        zIndex: 20
      },
      {
        id: "c1l6",
        x: 929,
        y: 470,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c1l7",
        x: 1065,
        y: 622,
        type: "chest",
        size: 52,
        zIndex: 20
      },
      {
        id: "c1l8",
        x: 1243,
        y: 554,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c1l9",
        x: 1223,
        y: 462,
        type: "elite",
        status: "cleared",
        size: 50,
        zIndex: 20
      },
      {
        id: "c1l10",
        x: 1104,
        y: 412,
        type: "battle",
        status: "cleared",
        size: 46,
        zIndex: 20
      },
      {
        id: "c1l11",
        x: 1256,
        y: 407,
        type: "elite",
        status: "cleared",
        size: 50,
        zIndex: 20
      },
      {
        id: "c1l12",
        x: 1443,
        y: 305,
        type: "boss",
        status: "current",
        size: 66,
        zIndex: 22
      }
    ],
    routes: [
      {
        id: "c1l1-c1l2",
        from: "c1l1",
        to: "c1l2",
        control1: {
          x: 910,
          y: 732
        },
        control2: {
          x: 1035,
          y: 765
        }
      },
      {
        id: "c1l2-c1l3",
        from: "c1l2",
        to: "c1l3",
        control1: {
          x: 801,
          y: 632
        },
        control2: {
          x: 755,
          y: 635
        }
      },
      {
        id: "c1l2-c1l7",
        from: "c1l2",
        to: "c1l7",
        control1: {
          x: 958,
          y: 656
        },
        control2: {
          x: 1011,
          y: 658
        }
      },
      {
        id: "c1l3-c1l4",
        from: "c1l3",
        to: "c1l4",
        control1: {
          x: 627,
          y: 562
        },
        control2: {
          x: 592,
          y: 565
        }
      },
      {
        id: "c1l4-c1l5",
        from: "c1l4",
        to: "c1l5",
        control1: {
          x: 605,
          y: 497
        },
        control2: {
          x: 649,
          y: 526
        }
      },
      {
        id: "c1l5-c1l6",
        from: "c1l5",
        to: "c1l6",
        control1: {
          x: 798,
          y: 463
        },
        control2: {
          x: 848,
          y: 501
        }
      },
      {
        id: "c1l7-c1l8",
        from: "c1l7",
        to: "c1l8",
        control1: {
          x: 1133,
          y: 586
        },
        control2: {
          x: 1175,
          y: 590
        }
      },
      {
        id: "c1l8-c1l9",
        from: "c1l8",
        to: "c1l9",
        control1: {
          x: 1235,
          y: 515
        },
        control2: {
          x: 1231,
          y: 501
        }
      },
      {
        id: "c1l9-c1l10",
        from: "c1l9",
        to: "c1l10",
        control1: {
          x: 1178,
          y: 420
        },
        control2: {
          x: 1149,
          y: 446
        }
      },
      {
        id: "c1l10-c1l11",
        from: "c1l10",
        to: "c1l11",
        control1: {
          x: 1162,
          y: 383
        },
        control2: {
          x: 1198,
          y: 436
        }
      },
      {
        id: "c1l11-c1l12",
        from: "c1l11",
        to: "c1l12",
        control1: {
          x: 1327,
          y: 367
        },
        control2: {
          x: 1380,
          y: 337
        }
      }
    ],
    props: [
      {
        id: "c1-camp-marker",
        type: "camp_prop",
        x: 9319,
        y: 895,
        width: 40,
        height: 40,
        zIndex: 16,
        opacity: 0.85,
        enabled: true
      },
      {
        id: "c1-hidden-glow",
        type: "hidden_glow",
        x: 1260,
        y: 470,
        size: 42,
        zIndex: 14,
        opacity: 0.45,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5",
        type: "flame_loop",
        x: 502,
        y: 528,
        size: 24,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1",
        type: "flame_loop",
        x: 762,
        y: 537,
        size: 24,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1-copy-monhbc81",
        type: "flame_loop",
        x: 896,
        y: 473,
        size: 24,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1-copy-monhbc81-copy-monhbj7j",
        type: "flame_loop",
        x: 1016,
        y: 629,
        size: 40,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1-copy-monhbc81-copy-monhbj7j-copy-monhbtme",
        type: "flame_loop",
        x: 349,
        y: 953,
        size: 100,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1-copy-monhbc81-copy-monhbj7j-copy-monhcusb",
        type: "flame_loop",
        x: 1199,
        y: 555,
        size: 38,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "flame_loop-monh29a5-copy-monhb7l1-copy-monhbc81-copy-monhbj7j-copy-monhcusb-copy-monhczp0",
        type: "flame_loop",
        x: 1304,
        y: 413,
        size: 34,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "ruin_marker-monhdmm6",
        type: "lantern_warm_loop",
        x: 1723,
        y: 854,
        size: 150,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "purple_flame_loop-moni7e6g",
        type: "purple_flame_loop",
        x: 1687,
        y: 455,
        size: 40,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "lantern_warm_loop-moni9y59",
        type: "lantern_warm_loop",
        x: 356,
        y: 813,
        width: 100,
        height: 83,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "small_camp-monl3wxg",
        type: "small_camp",
        x: 961,
        y: 857,
        width: 150,
        height: 150,
        zIndex: 35,
        opacity: 1,
        enabled: true,
        effect: {
          type: "lantern_warm_loop",
          xPercent: 49,
          yPercent: 60.5,
          widthPercent: 26,
          heightPercent: 40,
          opacity: 0.85,
          durationMs: 760,
          enabled: true
        }
      },
      {
        id: "purple_flame_loop-moo6a0q7",
        type: "purple_flame_loop",
        x: 1461,
        y: 106,
        width: 20,
        height: 60,
        zIndex: 35,
        opacity: 1,
        enabled: true
      },
      {
        id: "merchant_cart-moo7k8bk",
        type: "merchant_cart",
        x: 592,
        y: 634,
        width: 92,
        height: 74,
        zIndex: 35,
        opacity: 1,
        enabled: true,
        effect: {
          type: "lantern_warm_loop",
          xPercent: 52,
          yPercent: 38,
          widthPercent: 34,
          heightPercent: 34,
          opacity: 0.74,
          durationMs: 980,
          enabled: true
        }
      },
      {
        id: "hidden_glow-moo7kw8v",
        type: "hidden_glow",
        x: 1416,
        y: 705,
        width: 52,
        height: 52,
        zIndex: 35,
        opacity: 1,
        enabled: true,
        effect: {
          type: "purple_flame_loop",
          xPercent: 50,
          yPercent: 50,
          widthPercent: 42,
          heightPercent: 42,
          opacity: 0.5,
          durationMs: 820,
          enabled: false
        },
        interaction: {
          id: "c1-lower-cache",
          kind: "keyChest",
          keyCost: 1,
          unlockAfter: ["c1l2"],
          rewardId: "c1-lower-cache",
          enabled: true
        }
      }
    ],
    partyMarker: {
      x: 1102,
      y: 487,
      size: 80,
      zIndex: 40,
      anchorNodeId: "c1l1",
      style: "banner"
    }
  },
  "2": {
    nodes: [
      {
        id: "c2l1",
        x: 360,
        y: 788,
        type: "battle",
        size: 50,
        zIndex: 20
      },
      {
        id: "c2l2",
        x: 560,
        y: 705,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c2l3",
        x: 760,
        y: 730,
        type: "chest",
        size: 52,
        zIndex: 20
      },
      {
        id: "c2l4",
        x: 960,
        y: 610,
        type: "elite",
        size: 50,
        zIndex: 20
      },
      {
        id: "c2l5",
        x: 1160,
        y: 522,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c2l6",
        x: 1068,
        y: 394,
        type: "elite",
        size: 50,
        zIndex: 20
      },
      {
        id: "c2l7",
        x: 910,
        y: 314,
        type: "battle",
        size: 46,
        zIndex: 20
      },
      {
        id: "c2l8",
        x: 1265,
        y: 176,
        type: "boss",
        size: 66,
        zIndex: 22
      }
    ],
    props: [
      {
        id: "c2-ruin-marker",
        type: "ruin_marker",
        x: 980,
        y: 610,
        size: 52,
        zIndex: 14,
        opacity: 0.65,
        enabled: true
      }
    ],
    partyMarker: {
      anchorNodeId: "c2l1",
      size: 56,
      zIndex: 28,
      style: "banner"
    }
  }
};
