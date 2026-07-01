import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  NMOS_DIM,
  NMOS_COLORS,
  srcPos,
  drnPos,
  chPos,
  oxPos,
  gatePos,
} from "../../data/transistor";

const ELECTRON_COUNT = 15;

function makeLabelTex(text: string, color: string, fontSize = 40): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const pLabelTex = makeLabelTex("P-", "#aaaacc");
const nLabelTex = makeLabelTex("N+", "#4af0ff");
const sLabelTex = makeLabelTex("S", "#eee");
const gLabelTex = makeLabelTex("G", "#eee");
const dLabelTex = makeLabelTex("D", "#eee");
const depLabelTex = makeLabelTex("Depletion", "#ff6666", 28);

function makeBarrierTex(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 128, 0, 32, 128, 120);
  grad.addColorStop(0, "rgba(255,60,60,0.3)");
  grad.addColorStop(0.5, "rgba(255,40,40,0.1)");
  grad.addColorStop(1, "rgba(255,20,20,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}
const barrierTex = makeBarrierTex();

function makeHoleTex(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#88bbff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(16, 16, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(16, 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 16);
  ctx.lineTo(24, 16);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}
const holeTex = makeHoleTex();

function genHolePositions(): [number, number, number][] {
  const p: [number, number, number][] = [];
  while (p.length < 40) {
    const side = Math.random();
    let x: number, y: number, z: number;
    if (side < 0.7) {
      // Majority near Source side (left half, junction region)
      x = -3.2 + Math.random() * 2.4;
      y = -0.8 + Math.random() * 1.3;
    } else if (side < 0.9) {
      // Channel interface holes (visible for drift)
      x = -0.8 + Math.random() * 2.6;
      y = 0.15 + Math.random() * 0.5;
    } else {
      // Rest spread across substrate
      x = -3.4 + Math.random() * 6.8;
      y = -1.6 + Math.random() * 2.2;
    }
    z = -2 + Math.random() * 4;
    if (x > -3.3 && x < -1.7 && y > -0.7 && y < 0.7) continue;
    if (x > 1.7 && x < 3.3 && y > -0.7 && y < 0.7) continue;
    p.push([x, y, z]);
  }
  return p;
}
const holePositions = genHolePositions();

const SEEK_COUNT = 10;

// Pick 10 holes closest to Source right edge as seek targets
function selectSeekTargets(): { idx: number; pos: [number, number, number] }[] {
  const srcEdge = srcPos()[0] + NMOS_DIM.srcW / 2;
  const scored = holePositions.map((pos, i) => ({
    idx: i,
    pos,
    dist: Math.abs(pos[0] - srcEdge) + Math.abs(pos[1]) * 0.5,
  }));
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, SEEK_COUNT);
}
const seekTargets = selectSeekTargets();
const seekTargetIndices = seekTargets.map((t) => t.idx);
const seekTargetPositions: [number, number, number][] = seekTargets.map((t) => t.pos);

// Emission points across Source right face
const seekStartY = Array.from({ length: SEEK_COUNT }, () => -0.5 + Math.random());
const seekStartZ = Array.from({ length: SEEK_COUNT }, () => -1.5 + Math.random() * 3);

const holeOrigY = holePositions.map((p) => p[1]);

// Gate-interface positions (inversion layer targets)
function genGatePositions(): [number, number, number][] {
  const p: [number, number, number][] = [];
  for (let i = 0; i < SEEK_COUNT; i++) {
    const t = (i + 0.5) / SEEK_COUNT;
    p.push([-0.7 + t * 1.4, 0.7, -0.4 + Math.random() * 0.8]);
  }
  return p;
}
const gatePositions = genGatePositions();

export function ChipView({
  vgs,
  vds,
  showDepletion,
}: {
  vgs: number;
  vds: number;
  showDepletion: boolean;
}) {
  const electronRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const chRef = useRef<THREE.Mesh>(null!);
  const flowStart = useRef(0);
  const prevHasFlow = useRef(false);
  const accRefs = useRef<(THREE.Mesh | null)[]>([]);
  const seekRefs = useRef<(THREE.Mesh | null)[]>([]);
  const seekPhase = useRef<number[]>(Array.from({ length: SEEK_COUNT }, () => 0));
  const prevDepleted = useRef(true);
  const holeRefs = useRef<(THREE.Sprite | null)[]>([]);
  const gateRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const isOn = vgs >= 2;
    const hasFlow = isOn && vds > 0;
    const depleted = vgs < 2;

    if (hasFlow && !prevHasFlow.current) {
      flowStart.current = state.clock.elapsedTime;
    }
    prevHasFlow.current = hasFlow;

    const elapsed = hasFlow ? state.clock.elapsedTime - flowStart.current : 0;
    const speed = hasFlow ? 0.5 + vds * 0.3 : 0;
    const tick = elapsed * speed;

    const sp = srcPos();
    const dp = drnPos();
    const cp = chPos();
    const srcEdge = sp[0] + NMOS_DIM.srcW / 2;
    const drainEdge = dp[0] - NMOS_DIM.drnW / 2;

    for (let i = 0; i < ELECTRON_COUNT; i++) {
      const m = electronRefs.current[i];
      const g = glowRefs.current[i];
      if (!m) continue;

      const active = hasFlow && tick >= i / ELECTRON_COUNT;
      m.visible = active;
      if (g) g.visible = active;

      if (active) {
        const p = (tick - i / ELECTRON_COUNT) % 1;
        m.position.x = srcEdge + p * (drainEdge - srcEdge);
        m.position.y = cp[1];
        m.position.z = 0;
        if (g) {
          g.position.copy(m.position);
        }
      }
    }

    if (chRef.current) {
      const intensity = isOn ? Math.min(1, (vgs - 2) / 3) : 0;
      const mat = chRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = intensity * 0.8;
      mat.opacity = 0.3 + intensity * 0.7;
    }
    // Gate glow: ramps with Vgs
    if (gateRef.current) {
      const gMat = gateRef.current.material as THREE.MeshStandardMaterial;
      gMat.emissiveIntensity = Math.min(1, vgs / 3) * 0.6;
    }

    prevDepleted.current = depleted;

    // Trapped charge dots pulse
    for (let i = 0; i < 6; i++) {
      const m = accRefs.current[i];
      if (!m) continue;
      m.visible = depleted;
      if (depleted) {
        (m.material as THREE.MeshBasicMaterial).opacity =
          0.3 + 0.5 * Math.sin(state.clock.elapsedTime * 2.5 + i * 1.0);
      }
    }

    // Seeking electrons: recycle between holes (Vgs<Vth) ↔ gate (Vgs≥Vth)
    const seekSpeed = 1.05;
    const threeSrcEdge = srcEdge;
    for (let i = 0; i < SEEK_COUNT; i++) {
      const m = seekRefs.current[i];
      if (!m) continue;
      const p = seekPhase.current[i];
      const [hx, hy, hz] = seekTargetPositions[i];
      const [gx, gy, gz] = gatePositions[i];

      if (p < 1 && depleted) {
        // Source → hole (initial fill)
        seekPhase.current[i] = Math.min(1, p + delta * seekSpeed * (0.6 + i * 0.04));
      } else if (p >= 1 && depleted) {
        // Gate → hole (recycle direction)
        seekPhase.current[i] = Math.max(1, p - delta * seekSpeed * (0.6 + i * 0.04));
      } else if (!depleted) {
        // Hole → gate (inversion layer)
        if (p >= 1) {
          seekPhase.current[i] = Math.min(2, p + delta * seekSpeed * (0.6 + i * 0.04));
        }
      }

      const np = seekPhase.current[i];
      if (np <= 0) {
        m.visible = false;
        continue;
      }

      if (np < 1) {
        // Source → hole
        const t = np;
        m.position.x = threeSrcEdge + (hx - threeSrcEdge) * t;
        m.position.y = seekStartY[i] + (hy - seekStartY[i]) * t;
        m.position.z = seekStartZ[i] + (hz - seekStartZ[i]) * t;
        (m.material as THREE.MeshBasicMaterial).opacity = 0.3 + 0.7 * t;
      } else {
        // hole ↔ gate (lerp works both directions)
        const t = Math.min(1, np - 1);
        m.position.x = hx + (gx - hx) * t;
        m.position.y = hy + (gy - hy) * t;
        m.position.z = hz + (gz - hz) * t;
        (m.material as THREE.MeshBasicMaterial).opacity = 0.85;
      }
      m.visible = true;
    }

    // Hole visibility: hide holes filled by seeking electrons
    const filledHoles = new Set<number>();
    if (depleted) {
      for (let i = 0; i < SEEK_COUNT; i++) {
        if (seekPhase.current[i] >= 0.5) {
          filledHoles.add(seekTargetIndices[i]);
        }
      }
    }
    for (let i = 0; i < holePositions.length; i++) {
      const s = holeRefs.current[i];
      if (!s) continue;
      const [hx] = holePositions[i];
      const mat = s.material as THREE.SpriteMaterial;
      // All holes drift downward, scaled by height above substrate bottom
      const gateField = Math.max(0, vgs - 0.3) * 0.5;
      const height = Math.max(0, Math.min(1, (holeOrigY[i] + 1.4) / 2.0));
      const drift = gateField * height;
      s.position.y = holeOrigY[i] - drift;
      if (filledHoles.has(i)) {
        mat.opacity = 0;
      } else if (!depleted) {
        const inChannel = hx > -1.0 && hx < 1.0 && holeOrigY[i] > 0.1;
        mat.opacity = inChannel ? 0 : 0.5;
      } else {
        mat.opacity = 0.3 + 0.2 * Math.sin(state.clock.elapsedTime * 1.5 + i * 0.5);
      }
      s.visible = mat.opacity > 0;
    }
  });

  const sp = srcPos();
  const dp = drnPos();
  const cp = chPos();
  const op = oxPos();
  const gp = gatePos();

  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[NMOS_DIM.subW, NMOS_DIM.subH, NMOS_DIM.subD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.substrate}
          transparent
          opacity={0.75}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[NMOS_DIM.subW, NMOS_DIM.subH, NMOS_DIM.subD]} />
        <meshBasicMaterial color={NMOS_COLORS.substrateEdge} wireframe />
      </mesh>

      {/* P- label */}
      <sprite position={[-2.8, -0.8, 2.35]} scale={[1.2, 0.6, 1]}>
        <spriteMaterial map={pLabelTex} transparent depthTest={false} />
      </sprite>

      <mesh position={sp}>
        <boxGeometry args={[NMOS_DIM.srcW, NMOS_DIM.srcH, NMOS_DIM.srcD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.sourceDrain}
          emissive={NMOS_COLORS.sourceDrainEmissive}
          emissiveIntensity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={dp}>
        <boxGeometry args={[NMOS_DIM.drnW, NMOS_DIM.drnH, NMOS_DIM.drnD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.sourceDrain}
          emissive={NMOS_COLORS.sourceDrainEmissive}
          emissiveIntensity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* N+ labels */}
      <sprite
        position={[sp[0], sp[1] + 1.1, NMOS_DIM.srcD / 2 + 0.35]}
        scale={[1, 0.5, 1]}
      >
        <spriteMaterial map={nLabelTex} transparent depthTest={false} />
      </sprite>
      <sprite
        position={[dp[0], dp[1] + 1.1, NMOS_DIM.drnD / 2 + 0.35]}
        scale={[1, 0.5, 1]}
      >
        <spriteMaterial map={nLabelTex} transparent depthTest={false} />
      </sprite>
      {/* S, G, D labels */}
      <sprite
        position={[sp[0], sp[1] - 0.9, NMOS_DIM.subD / 2 + 0.3]}
        scale={[0.7, 0.35, 1]}
      >
        <spriteMaterial map={sLabelTex} transparent depthTest={false} />
      </sprite>
      <sprite
        position={[gp[0], gp[1] + 0.8, NMOS_DIM.subD / 2 + 0.3]}
        scale={[0.7, 0.35, 1]}
      >
        <spriteMaterial map={gLabelTex} transparent depthTest={false} />
      </sprite>
      <sprite
        position={[dp[0], dp[1] - 0.9, NMOS_DIM.subD / 2 + 0.3]}
        scale={[0.7, 0.35, 1]}
      >
        <spriteMaterial map={dLabelTex} transparent depthTest={false} />
      </sprite>

      <mesh ref={chRef} position={cp}>
        <boxGeometry args={[NMOS_DIM.chW, NMOS_DIM.chH, NMOS_DIM.chD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.channelOn}
          emissive={NMOS_COLORS.channelOn}
          emissiveIntensity={0}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Channel depletion wall — visible when Vgs < Vth */}
      <mesh
        position={[cp[0], cp[1] - 0.2, cp[2]]}
        visible={vgs < 2}
      >
        <boxGeometry
          args={[NMOS_DIM.chW * 1.1, NMOS_DIM.chH + 0.4, NMOS_DIM.chD]}
        />
        <meshStandardMaterial
          color="#ff4444"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
      {/* Depletion label */}
      <sprite
        position={[cp[0], cp[1] - 0.15, NMOS_DIM.subD / 2 + 0.3]}
        scale={[1.5, 0.5, 1]}
        visible={vgs < 2}
      >
        <spriteMaterial map={depLabelTex} transparent depthTest={false} />
      </sprite>
      {/* Barrier plane — repelling field at Source/P-sub junction */}
      <sprite
        position={[sp[0] + NMOS_DIM.srcW / 2 + 0.25, 0.3, 0]}
        scale={[1.5, 2.5, 1]}
        visible={vgs < 2}
      >
        <spriteMaterial map={barrierTex} transparent depthTest={false} />
      </sprite>
      {/* Trapped accumulated electrons at P- border */}
      {Array.from({ length: 6 }).map((_, i) => {
        const z = -1.5 + i * 0.6;
        return (
          <mesh
            key={`acc-${i}`}
            ref={(el) => { accRefs.current[i] = el; }}
            position={[sp[0] + NMOS_DIM.srcW / 2 + 0.15, 0.4, z]}
            visible={false}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0} />
          </mesh>
        );
      })}
      {/* Seeking electrons: Source → holes → Drain */}
      {Array.from({ length: SEEK_COUNT }).map((_, i) => (
        <mesh
          key={`seek-${i}`}
          ref={(el) => { seekRefs.current[i] = el; }}
          visible={false}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={NMOS_COLORS.electron} transparent opacity={0} depthWrite={false} depthTest={false} />
        </mesh>
      ))}
      {/* Holes in P-substrate (empty sockets) */}
      {holePositions.map((pos, i) => (
        <sprite
          key={`hole-${i}`}
          ref={(el) => { holeRefs.current[i] = el; }}
          position={pos}
          scale={[0.25, 0.25, 1]}
        >
          <spriteMaterial map={holeTex} transparent depthWrite={false} opacity={0.5} />
        </sprite>
      ))}

      <mesh position={op}>
        <boxGeometry args={[NMOS_DIM.oxW, NMOS_DIM.oxH, NMOS_DIM.oxD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.oxide}
          transparent
          opacity={NMOS_COLORS.oxideOpacity}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      <mesh ref={gateRef} position={gp}>
        <boxGeometry args={[NMOS_DIM.gateW, NMOS_DIM.gateH, NMOS_DIM.gateD]} />
        <meshStandardMaterial
          color={NMOS_COLORS.gate}
          emissive="#ffd93d"
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      <mesh position={gp}>
        <boxGeometry args={[NMOS_DIM.gateW, NMOS_DIM.gateH, NMOS_DIM.gateD]} />
        <meshBasicMaterial color={NMOS_COLORS.gateEdge} wireframe />
      </mesh>

      {showDepletion && (
        <>
          <mesh position={[sp[0], sp[1], sp[2]]}>
            <boxGeometry
              args={[
                NMOS_DIM.srcW * 1.3,
                NMOS_DIM.srcH * 1.2,
                NMOS_DIM.srcD * 1.1,
              ]}
            />
            <meshStandardMaterial
              color={NMOS_COLORS.depletion}
              transparent
              opacity={NMOS_COLORS.depletionOpacity}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[dp[0], dp[1], dp[2]]}>
            <boxGeometry
              args={[
                NMOS_DIM.drnW * 1.3,
                NMOS_DIM.drnH * 1.2,
                NMOS_DIM.drnD * 1.1,
              ]}
            />
            <meshStandardMaterial
              color={NMOS_COLORS.depletion}
              transparent
              opacity={NMOS_COLORS.depletionOpacity}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Electron stream: core + glow per particle */}
      {Array.from({ length: ELECTRON_COUNT }).map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              glowRefs.current[i] = el;
            }}
            visible={false}
          >
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshBasicMaterial
              color={NMOS_COLORS.electron}
              transparent
              opacity={0.15}
              depthWrite={false}
            />
          </mesh>
          <mesh
            ref={(el) => {
              electronRefs.current[i] = el;
            }}
            visible={false}
          >
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color={NMOS_COLORS.electron} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
