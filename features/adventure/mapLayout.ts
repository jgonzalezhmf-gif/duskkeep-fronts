import { ADVENTURE_MAP_CHAPTER_1_PROPS } from "./mapChapterOneProps";
import type { AdventureMapChapterLayout } from "./mapSchema";
export {
  ADVENTURE_MAP_DESIGN,
  ADVENTURE_MAP_INTERACTION_KINDS,
  ADVENTURE_MAP_NODE_STATUSES,
  ADVENTURE_MAP_NODE_TYPES,
  ADVENTURE_MAP_PROP_TYPES,
} from "./mapSchema";
export type {
  AdventureMapChapterLayout,
  AdventureMapNodeStatus,
  AdventureMapNodeType,
  AdventureMapPartyMarkerLayout,
  AdventureMapPropEffectLayout,
  AdventureMapPropLayout,
  AdventureMapPropType,
  AdventureMapRouteLayout,
  AdventureMapRouteState,
  AdventureNodeLayout,
} from "./mapSchema";

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
    props: ADVENTURE_MAP_CHAPTER_1_PROPS,
    partyMarker: {
      x: 1106,
      y: 466,
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
