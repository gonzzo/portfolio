import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const paper = "#f5f4ef";
const ink = "#728797";
const blue = "#384e6b";

// Every motion completes an integer number of cycles for a seamless loop.
const traces = [
  "M 520 210 H 710 L 788 288 H 976",
  "M 600 158 H 792 L 858 224 H 928 L 952 248 V 312 H 976",
  "M 480 378 H 708 L 770 316 H 976",
  "M 630 480 H 780 L 864 396 H 924 L 952 368 H 976",
  "M 740 570 H 850 L 1000 420 V 394",
  "M 1018 264 V 210 L 960 152 V 102",
  "M 1042 264 V 174 L 1082 134 H 1190",
  "M 1104 288 H 1204 L 1264 228 H 1340 V 184",
  "M 1104 312 H 1260 L 1320 372 H 1510",
  "M 1104 340 H 1192 L 1240 388 H 1440",
  "M 1104 366 H 1160 L 1220 426 V 496",
  "M 1066 394 V 442 L 1104 480 V 542 H 1158",
  "M 1042 394 V 488 L 1010 520 V 612",
  "M 1018 394 V 450 L 930 538 V 610",
];

const TraceField = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {traces.map((d, index) => {
        const progress =
          ((frame / durationInFrames) * (index % 2 === 0 ? 3 : 2) +
            index / traces.length) %
          1;
        return (
          <g key={d}>
            <path d={d} stroke={ink} strokeWidth="1.3" opacity=".42" />
            <path
              d={d}
              pathLength={1}
              stroke={blue}
              strokeWidth="3"
              strokeDasharray=".065 .935"
              strokeDashoffset={-progress}
              opacity={interpolate(
                progress,
                [0, 0.12, 0.83, 1],
                [0, 0.85, 0.85, 0],
              )}
            />
          </g>
        );
      })}
    </g>
  );
};

const Processor = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <g>
      <rect
        x="960"
        y="248"
        width="160"
        height="162"
        rx="10"
        fill={paper}
        stroke={ink}
        strokeWidth="1"
        opacity=".45"
      />
      {Array.from({ length: 8 }, (_, index) => (
        <g key={index} stroke={ink} strokeWidth="2" opacity=".7">
          <path
            d={`M 976 ${278 + index * 14} h -16 M 1104 ${278 + index * 14} h 16`}
          />
          <path
            d={`M ${990 + index * 14} 264 v -16 M ${990 + index * 14} 394 v 16`}
          />
        </g>
      ))}
      <rect
        x="976"
        y="264"
        width="128"
        height="130"
        rx="6"
        fill="#e8ebe7"
        stroke={ink}
        strokeWidth="1.8"
      />
      <rect
        x="987"
        y="275"
        width="106"
        height="108"
        rx="3"
        fill={paper}
        stroke={ink}
        strokeWidth=".7"
      />
      <path
        d="M 1006 310 h 15 v -15 h 38 v 15 h 15 v 38 h -15 v 15 h -38 v -15 h -15 Z"
        fill="none"
        stroke={blue}
        strokeWidth="1.2"
        opacity=".6"
      />
      <rect
        x="1021"
        y="310"
        width="38"
        height="38"
        rx="2"
        fill={blue}
        opacity={interpolate(
          Math.cos((frame / durationInFrames) * Math.PI * 8),
          [-1, 1],
          [0.035, 0.16],
        )}
      />
      <circle cx="1081" cy="287" r="3" fill={blue} opacity=".65" />
    </g>
  );
};

const Sensor = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const phase = (frame / durationInFrames) * Math.PI * 12;
  const waveform = Array.from({ length: 241 }, (_, index) => {
    const envelope = Math.sin((index / 240) * Math.PI) ** 2;
    const y =
      546 +
      (Math.sin(index / 24 - phase) * 17 +
        Math.sin(index / 10 - phase * 2) * 5) *
        envelope;
    return `${index === 0 ? "M" : "L"} ${1174 + index} ${y.toFixed(3)}`;
  }).join(" ");
  return (
    <g>
      <rect
        x="1158"
        y="496"
        width="274"
        height="100"
        rx="8"
        fill={paper}
        stroke={ink}
        opacity=".4"
      />
      <path
        d="M 1174 546 H 1414 M 1234 512 V 580 M 1294 512 V 580 M 1354 512 V 580"
        fill="none"
        stroke={ink}
        strokeWidth=".6"
        opacity=".2"
      />
      <path
        d={waveform}
        fill="none"
        stroke={blue}
        strokeWidth="1.8"
        opacity=".72"
      />
    </g>
  );
};

const Connectivity = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <g fill="none" stroke={blue}>
      <circle
        cx="1340"
        cy="176"
        r="5"
        fill={paper}
        strokeWidth="1.5"
        opacity=".75"
      />
      {[0, 1, 2].map((index) => {
        const phase = ((frame / durationInFrames) * 3 + index / 3) % 1;
        const radius = 12 + phase * 62;
        return (
          <path
            key={index}
            d={`M ${1340 - radius * 0.72} ${176 - radius * 0.7} A ${radius} ${radius} 0 0 1 ${1340 + radius * 0.72} ${176 - radius * 0.7}`}
            strokeWidth="1.3"
            opacity={interpolate(phase, [0, 0.2, 1], [0, 0.65, 0])}
          />
        );
      })}
    </g>
  );
};

const EmbeddedSystems = () => (
  <AbsoluteFill style={{ backgroundColor: paper }}>
    <svg width="100%" height="100%" viewBox="0 0 1600 900" fill="none">
      <defs>
        <pattern
          id="board-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".8" fill={ink} opacity=".18" />
        </pattern>
        <linearGradient
          id="board-fade"
          x1="500"
          x2="1500"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset=".35" stopColor="white" />
          <stop offset=".96" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="board-mask">
          <rect width="1600" height="900" fill="url(#board-fade)" />
        </mask>
      </defs>
      <g mask="url(#board-mask)">
        <rect
          x="480"
          y="72"
          width="1050"
          height="580"
          fill="url(#board-grid)"
        />
        <path
          d="M 582 104 H 1420 L 1480 164 V 558 L 1418 620 H 660 L 582 542 Z"
          stroke={ink}
          strokeWidth="1"
          opacity=".2"
        />
        {[
          [618, 140],
          [1438, 188],
          [1404, 584],
          [660, 548],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} stroke={ink} opacity=".35">
            <circle cx={x} cy={y} r="10" />
            <path
              d={`M ${x - 16} ${y} h 32 M ${x} ${y - 16} v 32`}
              strokeWidth=".7"
            />
          </g>
        ))}
        <TraceField />
        <Processor />
        <Sensor />
        <Connectivity />
        {[
          [710, 210],
          [600, 158],
          [708, 378],
          [780, 480],
          [850, 570],
          [1190, 134],
          [1260, 312],
          [1440, 388],
          [1010, 612],
          [930, 610],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r="5"
              fill={paper}
              stroke={ink}
              strokeWidth="1.2"
              opacity=".65"
            />
            <circle cx={x} cy={y} r="1.5" fill={blue} opacity=".5" />
          </g>
        ))}
        <g stroke={ink} opacity=".5">
          <rect x="818" y="207" width="24" height="12" rx="2" fill={paper} />
          <path d="M 826 207 v 12 M 834 207 v 12" />
          <rect x="1181" y="377" width="24" height="12" rx="2" fill={paper} />
          <path d="M 1189 377 v 12 M 1197 377 v 12" />
          <path d="M 908 530 l 8 8 M 912 526 l 8 8" strokeWidth="2" />
        </g>
      </g>
    </svg>
  </AbsoluteFill>
);

export const HeroComposition = () => (
  <Composition
    id="EmbeddedSystems"
    component={EmbeddedSystems}
    durationInFrames={360}
    fps={30}
    width={1600}
    height={900}
  />
);
