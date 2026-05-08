import type { AdventureMapPropLayout } from "./adventureMapSchema";

export const ADVENTURE_MAP_CHAPTER_1_PROPS: AdventureMapPropLayout[] = [
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
    x: 953,
    y: 860,
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
    x: 593,
    y: 631,
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
    x: 1194,
    y: 723,
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
    }
  },
  {
    id: "key_chest-mouenvk8",
    type: "key_chest",
    x: 1671,
    y: 964,
    width: 219,
    height: 204,
    rotation: 5,
    rotationX: 0,
    rotationY: -16,
    zIndex: 20,
    opacity: 1,
    enabled: true,
    interaction: {
      id: "c1-lower-cache",
      kind: "keyChest",
      keyCost: 1,
      unlockAfter: [
        "c1l2"
      ],
      rewardId: "c1-lower-cache",
      enabled: true
    }
  }
];
