"use client";

import { useEffect, useRef } from "react";
import type { PlayerObject, SkinViewer } from "skinview3d";
import styles from "./FallingPlayer.module.css";

const SKIN_SRC = "/skin.png";
const TRIGGER_SELECTOR = "[data-mc-trigger]";
const FALL_SOUND = { src: "/sounds/fall.ogg", volume: 0.85 };
const HURT_SOUND = { src: "/sounds/hurt.ogg", volume: 1 };
const STEP_SOUND = { src: "/sounds/step.ogg", volume: 0.5 };

const CANVAS = { width: 220, height: 340 };

const TICK_MS = 50;
const GRAVITY = 0.08;
const DRAG = 0.98;
const FALL_ENTRY_SPEED = -1.15;
const FALL_LOOK_PITCH = 0.85;
const FALL_SPIN_SWEEP = 1.15;
const FALL_SPIN_RATE = 0.3;
const SPRINT_SPEED = 0.2806;
const JUMP_VELOCITY = 0.42;
const SPRINT_JUMP_BOOST = 0.2;
const BOOST_DECAY = 0.91;
const HURT_TICKS = 7;
const HURT_HOP = 0.26;
const UNITS_PER_BLOCK = 16;
const LOOK_TICKS = 52;
const TURN_TICKS = 6;
const ACCEL_TICKS = 4;
const JUMP_AT_TICK = 7;
const JUMP_GAP_TICKS = 2;
const HEAD_YAW_CLAMP = 1.309;
const HEAD_PITCH_CLAMP = Math.PI / 2;
const START_BODY_YAW = 0.35;
const FEET_UNITS = -18;
const SQUASH_DECAY = 0.72;
const SQUASH_Y = 0.3;
const SQUASH_XZ = 0.16;

const LOOK_MOVE_TICKS = 5;

const LOOK_TARGETS = [
  { yaw: 2, pitch: 0.1, hold: 5 },
  { yaw: -0.9, pitch: -0.12, hold: 5 },
  { yaw: 0.6, pitch: 0.22, hold: 4 },
  { yaw: 1.25, pitch: 0, hold: 4 },
];

function normalizeAngle(radians: number) {
  return ((radians + Math.PI) % (Math.PI * 2)) - Math.PI;
}

function smooth(t: number) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

type Stage = "idle" | "fall" | "hurt" | "look" | "run";

type Sim = {
  stage: Stage;
  y: number;
  vy: number;
  x: number;
  age: number;
  stageTicks: number;
  hurtTicks: number;
  limbSwing: number;
  limbSwingAmount: number;
  headYaw: number;
  headPitch: number;
  bodyYaw: number;
  moveDist: number;
  nextStep: number;
  lookIndex: number;
  lookHold: number;
  headTicks: number;
  fromYaw: number;
  fromPitch: number;
  fromBodyYaw: number;
  boost: number;
  groundTicks: number;
  squash: number;
};

type View = {
  x: number;
  y: number;
  age: number;
  limbSwing: number;
  limbSwingAmount: number;
  headYaw: number;
  headPitch: number;
  bodyYaw: number;
  squash: number;
};

const VIEW_KEYS: (keyof View)[] = [
  "x",
  "y",
  "age",
  "limbSwing",
  "limbSwingAmount",
  "headYaw",
  "headPitch",
  "bodyYaw",
  "squash",
];

type DustKind = "trail" | "land";

type Events = {
  onLand: () => void;
  onStep: () => void;
  onDust: (count: number, kind: DustKind) => void;
};

function playSound(sound: { src: string; volume: number }) {
  const audio = new Audio(sound.src);
  audio.volume = sound.volume;
  return audio.play();
}

function freshSim(startY: number): Sim {
  return {
    stage: "idle",
    y: startY,
    vy: 0,
    x: 0,
    age: 0,
    stageTicks: 0,
    hurtTicks: 0,
    limbSwing: 0,
    limbSwingAmount: 0,
    headYaw: 0.1,
    headPitch: 0,
    bodyYaw: START_BODY_YAW,
    moveDist: 0,
    nextStep: 1,
    lookIndex: 0,
    lookHold: 0,
    headTicks: 0,
    fromYaw: 0.1,
    fromPitch: 0,
    fromBodyYaw: START_BODY_YAW,
    boost: 0,
    groundTicks: 0,
    squash: 0,
  };
}

function stepSim(sim: Sim, events: Events) {
  sim.age += 1;
  sim.stageTicks += 1;
  if (sim.hurtTicks > 0) sim.hurtTicks -= 1;
  sim.squash *= SQUASH_DECAY;

  let horizontal = 0;

  if (sim.stage === "fall") {
    sim.y += sim.vy;
    sim.vy = (sim.vy - GRAVITY) * DRAG;

    const t = sim.stageTicks;
    sim.headPitch += (FALL_LOOK_PITCH - sim.headPitch) * 0.12;
    sim.bodyYaw = START_BODY_YAW + Math.sin(t * FALL_SPIN_RATE) * FALL_SPIN_SWEEP;
    sim.headYaw = 0.12 + Math.sin(t * 0.24) * 0.3;

    if (sim.y <= 0) {
      sim.y = 0;
      sim.vy = HURT_HOP;
      sim.squash = 1;
      const settled = normalizeAngle(sim.bodyYaw);
      sim.headYaw += settled - sim.bodyYaw;
      sim.bodyYaw = settled;
      sim.stage = "hurt";
      sim.stageTicks = 0;
      sim.hurtTicks = HURT_TICKS;
      events.onLand();
      events.onDust(10, "land");
    }
  } else if (sim.stage === "hurt") {
    if (sim.y > 0 || sim.vy > 0) {
      sim.y += sim.vy;
      sim.vy = (sim.vy - GRAVITY) * DRAG;
      if (sim.y <= 0) {
        sim.y = 0;
        sim.vy = 0;
      }
    }
    sim.headPitch += (0.15 - sim.headPitch) * 0.25;
    sim.headYaw += (sim.bodyYaw + 0.1 - sim.headYaw) * 0.25;
    if (sim.stageTicks >= HURT_TICKS && sim.y <= 0) {
      sim.stage = "look";
      sim.stageTicks = 0;
      sim.headTicks = 0;
      sim.fromYaw = sim.headYaw;
      sim.fromPitch = sim.headPitch;
    }
  } else if (sim.stage === "look") {
    const target = LOOK_TARGETS[sim.lookIndex];
    sim.headTicks += 1;
    const t = smooth(sim.headTicks / LOOK_MOVE_TICKS);
    sim.headYaw = sim.fromYaw + (target.yaw - sim.fromYaw) * t;
    sim.headPitch = sim.fromPitch + (target.pitch - sim.fromPitch) * t;

    const relative = sim.headYaw - sim.bodyYaw;
    if (Math.abs(relative) > HEAD_YAW_CLAMP) {
      const targetBody = sim.headYaw - Math.sign(relative) * HEAD_YAW_CLAMP;
      sim.bodyYaw += (targetBody - sim.bodyYaw) * 0.35;
    }

    if (sim.headTicks >= LOOK_MOVE_TICKS) {
      sim.lookHold += 1;
      if (sim.lookHold > target.hold && sim.lookIndex < LOOK_TARGETS.length - 1) {
        sim.lookIndex += 1;
        sim.lookHold = 0;
        sim.headTicks = 0;
        sim.fromYaw = sim.headYaw;
        sim.fromPitch = sim.headPitch;
      }
    }
    const lastTarget = sim.lookIndex === LOOK_TARGETS.length - 1;
    const settled = sim.headTicks >= LOOK_MOVE_TICKS && sim.lookHold >= target.hold;
    if ((lastTarget && settled) || sim.stageTicks >= LOOK_TICKS) {
      sim.stage = "run";
      sim.stageTicks = 0;
      sim.fromYaw = sim.headYaw;
      sim.fromPitch = sim.headPitch;
      sim.fromBodyYaw = sim.bodyYaw;
    }
  } else if (sim.stage === "run") {
    const turn = smooth(sim.stageTicks / TURN_TICKS);
    sim.bodyYaw = sim.fromBodyYaw + turn * (Math.PI / 2 - sim.fromBodyYaw);
    sim.headYaw = sim.fromYaw + (sim.bodyYaw - sim.fromYaw) * turn;
    sim.headPitch = sim.fromPitch * (1 - turn);

    const grounded = sim.y <= 0 && sim.vy <= 0;
    sim.groundTicks = grounded ? sim.groundTicks + 1 : 0;

    if (
      grounded &&
      sim.stageTicks >= JUMP_AT_TICK &&
      sim.groundTicks >= JUMP_GAP_TICKS
    ) {
      sim.vy = JUMP_VELOCITY;
      sim.boost = SPRINT_JUMP_BOOST;
      sim.groundTicks = 0;
      events.onDust(3, "trail");
    }

    const airborne = sim.y > 0 || sim.vy > 0;
    if (airborne) {
      sim.y += sim.vy;
      sim.vy = (sim.vy - GRAVITY) * DRAG;
      if (sim.y <= 0) {
        sim.y = 0;
        sim.vy = 0;
        sim.squash = 0.55;
        sim.groundTicks = 0;
        events.onStep();
        events.onDust(6, "land");
      }
    }

    sim.boost *= BOOST_DECAY;
    horizontal = SPRINT_SPEED * smooth(sim.stageTicks / ACCEL_TICKS) + sim.boost;
    sim.x += horizontal;

    if (!airborne) {
      sim.moveDist += horizontal * 0.6;
      if (sim.moveDist > sim.nextStep) {
        sim.nextStep = Math.floor(sim.moveDist) + 1;
        events.onStep();
        events.onDust(2, "trail");
      }
      if (horizontal > SPRINT_SPEED * 0.5 && sim.age % 2 === 0) {
        events.onDust(1, "trail");
      }
    }
  }

  const target = Math.min(horizontal * 4, 1);
  sim.limbSwingAmount += (target - sim.limbSwingAmount) * 0.4;
  sim.limbSwing += sim.limbSwingAmount;
}

function snapshot(sim: Sim, into: View) {
  for (const key of VIEW_KEYS) into[key] = sim[key];
  return into;
}

function interpolate(prev: View, sim: Sim, alpha: number, into: View) {
  for (const key of VIEW_KEYS) {
    into[key] = prev[key] + (sim[key] - prev[key]) * alpha;
  }
  return into;
}

function pose(player: PlayerObject, view: View) {
  const { skin } = player;
  const swing = view.limbSwing * 0.6662;
  const amount = view.limbSwingAmount;

  const squashY = 1 - SQUASH_Y * view.squash;
  const squashXZ = 1 + SQUASH_XZ * view.squash;

  player.rotation.set(0, view.bodyYaw, 0);
  player.scale.set(squashXZ, squashY, squashXZ);
  player.position.set(0, FEET_UNITS * (1 - squashY), 0);

  const pitch = Math.min(Math.max(view.headPitch, -HEAD_PITCH_CLAMP), HEAD_PITCH_CLAMP);
  const yaw = Math.min(
    Math.max(view.headYaw - view.bodyYaw, -HEAD_YAW_CLAMP),
    HEAD_YAW_CLAMP,
  );
  skin.head.rotation.set(pitch, yaw, 0);

  skin.rightArm.rotation.x = Math.cos(swing + Math.PI) * amount;
  skin.leftArm.rotation.x = Math.cos(swing) * amount;
  skin.rightLeg.rotation.x = Math.cos(swing) * 1.4 * amount;
  skin.leftLeg.rotation.x = Math.cos(swing + Math.PI) * 1.4 * amount;

  const sway = Math.cos(view.age * 0.09) * 0.05 + 0.05;
  skin.rightArm.rotation.z = -sway;
  skin.leftArm.rotation.z = sway;
  skin.rightArm.rotation.x += Math.sin(view.age * 0.067) * 0.05;
  skin.leftArm.rotation.x -= Math.sin(view.age * 0.067) * 0.05;
}


type Tintable = {
  material?: { color?: { setRGB: (r: number, g: number, b: number) => void } };
};

function tint(player: PlayerObject, strength: number) {
  const channel = 1 - 0.64 * strength;
  player.skin.traverse((node) => {
    const mesh = node as unknown as Tintable;
    if (!mesh.material?.color) return;
    mesh.material.color.setRGB(1, channel, channel);
  });
}

const DUST_TONES = ["#9a9a9a", "#868686", "#767676", "#a6a6a6"];

export default function FallingPlayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rigRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let viewer: SkinViewer | null = null;
    let detach = () => {};

    (async () => {
      const skinview3d = await import("skinview3d");
      if (disposed || !canvasRef.current) return;

      viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: CANVAS.width,
        height: CANVAS.height,
        skin: SKIN_SRC,
        enableControls: false,
        zoom: 0.62,
        fov: 42,
        renderPaused: true,
      });

      const active = viewer;
      const halfFov = ((active.fov / 180) * Math.PI) / 2;
      const visibleUnits = 2 * Math.tan(halfFov) * active.camera.position.length();
      const blockPx = (CANVAS.height / visibleUnits) * UNITS_PER_BLOCK;
      const startY = (window.innerHeight + CANVAS.height) / blockPx;

      let sim = freshSim(startY);
      const prev = snapshot(sim, {} as View);
      const view = snapshot(sim, {} as View);
      let carry = 0;
      let last = performance.now();
      let hurtShown = -1;

      const footPoint = active.camera.position.clone();

      footPoint.set(0, FEET_UNITS, 0).project(active.camera);
      const feetFromCanvasBottom =
        CANVAS.height - ((1 - footPoint.y) / 2) * CANVAS.height;
      if (rigRef.current) {
        rigRef.current.style.bottom = `${-feetFromCanvasBottom}px`;
      }

      const spawnDust = (count: number, kind: DustKind) => {
        const stage = stageRef.current;
        const rig = rigRef.current;
        if (!stage || !rig) return;
        const rect = rig.getBoundingClientRect();

        footPoint.set(0, FEET_UNITS, 0).project(active.camera);
        const footX = rect.left + ((footPoint.x + 1) / 2) * rect.width;
        const footY = rect.top + ((1 - footPoint.y) / 2) * rect.height;

        for (let i = 0; i < count; i += 1) {
          const dot = document.createElement("span");
          dot.className = styles.dust;

          if (kind === "trail") {
            const spread = Math.random();
            dot.style.left = `${footX - 12 - Math.random() * 10}px`;
            dot.style.top = `${footY - 2 - Math.random() * 4}px`;
            dot.style.setProperty("--dx", `${-16 - spread * 40}px`);
            dot.style.setProperty("--dy", `${(Math.random() - 0.5) * 10 - spread * 4}px`);
            dot.style.animationDuration = `${300 + Math.random() * 220}ms`;
          } else {
            const side = Math.random() < 0.5 ? -1 : 1;
            dot.style.left = `${footX + side * (6 + Math.random() * 12)}px`;
            dot.style.top = `${footY - Math.random() * 4}px`;
            dot.style.setProperty("--dx", `${side * (18 + Math.random() * 30)}px`);
            dot.style.setProperty("--dy", `${(Math.random() - 0.5) * 6}px`);
            dot.style.animationDuration = `${340 + Math.random() * 240}ms`;
          }

          dot.style.background = DUST_TONES[(Math.random() * DUST_TONES.length) | 0];
          dot.addEventListener("animationend", () => dot.remove(), { once: true });
          stage.appendChild(dot);
        }
      };

      const events: Events = {
        onLand: () => {
          playSound(FALL_SOUND).catch(() => {});
          playSound(HURT_SOUND).catch(() => {});
        },
        onStep: () => {
          playSound(STEP_SOUND).catch(() => {});
        },
        onDust: spawnDust,
      };

      const trigger = () => {
        if (sim.stage !== "idle") return;
        sim = freshSim(startY);
        sim.stage = "fall";
        sim.vy = FALL_ENTRY_SPEED;
        snapshot(sim, prev);
      };

      const triggers = Array.from(document.querySelectorAll(TRIGGER_SELECTOR));
      triggers.forEach((el) => el.addEventListener("mouseenter", trigger));
      detach = () => {
        triggers.forEach((el) => el.removeEventListener("mouseenter", trigger));
      };

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        carry += Math.min(now - last, 250);
        last = now;

        while (carry >= TICK_MS) {
          carry -= TICK_MS;
          snapshot(sim, prev);
          if (sim.stage !== "idle") stepSim(sim, events);
          if (sim.stage === "run" && sim.x * blockPx > window.innerWidth) {
            sim = freshSim(startY);
            snapshot(sim, prev);
          }
        }

        interpolate(prev, sim, carry / TICK_MS, view);

        const rig = rigRef.current;
        if (rig) {
          rig.style.transform = `translate3d(${view.x * blockPx}px, ${-view.y * blockPx}px, 0)`;
          rig.style.visibility = sim.stage === "idle" ? "hidden" : "visible";
        }

        const hurtStrength = sim.hurtTicks / HURT_TICKS;
        if (hurtStrength !== hurtShown) {
          hurtShown = hurtStrength;
          tint(active.playerObject, hurtStrength);
        }

        if (sim.stage !== "idle") {
          pose(active.playerObject, view);
          active.render();
        }
      };

      frame = requestAnimationFrame(tick);
    })();

    return () => {
      disposed = true;
      detach();
      cancelAnimationFrame(frame);
      viewer?.dispose();
    };
  }, []);

  return (
    <div className={styles.stage} ref={stageRef} aria-hidden="true">
      <div
        ref={rigRef}
        className={styles.rig}
        style={{ width: CANVAS.width, height: CANVAS.height }}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
}
