import { textToColumns } from '../pixelFont'

/**
 * The hero scene: one full-screen fragment shader on WebGL2.
 *
 * The subject is an LED backpack (the PIX project) drawn as a hairline
 * technical drawing. The cursor's recent path is a liquid-edged mask that
 * reveals the solid, lit device over it. The scene is only drawn during
 * pointer interaction, when it replaces the static poster.
 */

export const PARAMS = {
  subjectScale: 1,
  subjectY: -0.1,
  subjectParallax: 0.02,
  relight: 0.5,
  trailRadius: 0.46,
  trailIdleScale: 0.28,
  trailTaper: 1.9,
  trailTaperIdle: 1.6,
  trailTaperFast: 1.25,
  trailLength: 0.64,
  revealThreshold: 0.08,
  revealEdge: 0.005,
  revealWarp: 1.29,
  revealWarpScale: 2.9,
  revealSpeed: 1.25,
  pointerLerp: 0.17,
  pacePeak: 0.029,
  paceAttack: 0.09,
  paceRelease: 0.205,
  paceThreshold: 0.06,
  paceRamp: 0.15,
  outlinePeriod: 3.1,
  outlineStagger: 1.2,
  outlineOpacity: 0.55,
  outlineWidth: 0.15,
  bgLineScale: 3.8,
  bgLineCount: 2.5,
  bgLineThickness: 1.4,
  bgLineOpacity: 0.85,
  bgWaveAmount: 0.37,
  bgWaveSpeed: 1.66,
  bgRevealLightness: 0.81,
  bgRevealLightnessAlt: 0.69,
  bgRevealOpacity: 1,
  introDuration: 4,
  burnStart: 0.14,
  burnSoftness: 0.02,
  burnGlow: 4,
}
export type SceneParams = typeof PARAMS

/** Where the cursor is assumed to be when there is none. y down. */
const STATIC_POSE = { x: 0.3, y: 0.1 }

/** The device's extent in its own units (y up): body, handle above. */
export const SUBJECT_TOP = 0.735
export const SUBJECT_BOTTOM = -0.55

/** The LED face: 32×30 dots. */
const LED_COLS = 32
const LED_ROWS = 30
const TRAIL_SAMPLES = 32
const MESSAGE = "HI, I'M HADI ♥ FULL-STACK DEV ♥ KUWAIT ♥ "

const vertex = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const fragment = (samples: number) => `#version 300 es
precision highp float;
out vec4 outColor;
#define SAMPLES ${samples}
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uWarpTime;
uniform vec2 uTrail[SAMPLES];
uniform vec2 uTrailMin;
uniform vec2 uTrailMax;
uniform float uPace;
uniform float uRadius, uIdleScale, uTaper, uTaperIdle, uTaperFast, uLength;
uniform float uGateStart, uGateWidth, uWarp, uWarpScale, uThreshold, uEdge;
uniform float uIntro, uBurnStart, uBurnSoft, uBurnGlow;
uniform vec3 uCenter;
uniform vec2 uLight;
uniform float uRelight;
uniform float uPeriod, uStagger, uWaveOpacity, uWaveWidth;
uniform float uLineScale, uLineCount, uLineThickness, uLineOpacity, uWaveAmount, uWaveSpeed;
uniform float uBgReveal, uBgGrey, uBgGreyAlt;
uniform sampler2D uLed;
uniform vec3 uBg, uLine, uInk, uAccent, uSteel, uBody, uRaised, uBlack;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) { return vnoise(p) * 0.6 + vnoise(p * 2.1 + 7.0) * 0.3 + vnoise(p * 4.3 + 3.0) * 0.1; }

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

float revealTrail(vec2 ndc) {
  float gate = smoothstep(uGateStart, uGateStart + uGateWidth, uPace);
  if (gate <= 0.0) return 0.0;
  vec2 bounded = vec2(ndc.x * uAspect, ndc.y);
  if (any(lessThan(bounded, uTrailMin)) || any(greaterThan(bounded, uTrailMax))) return 0.0;
  vec2 point = bounded;
  vec2 nuv = ndc * 0.5 + 0.5;
  float nx = fbm(nuv * uWarpScale * 3.0 + vec2(uWarpTime * 0.07, uWarpTime * 0.05) * 6.0);
  float ny = fbm(nuv * uWarpScale * 4.2 - vec2(uWarpTime * 0.06, uWarpTime * 0.09) * 6.0);
  point += (vec2(nx, ny) - 0.5) * uWarp * 0.22;
  float radius = uRadius * mix(uIdleScale, 1.0, uPace);
  float taper = uTaper * mix(uTaperIdle, uTaperFast, uPace);
  float span = max(uLength * float(SAMPLES - 1), 1.0);
  float ceiling = uThreshold + uEdge;
  float trail = 0.0;
  for (int i = 0; i < SAMPLES - 1; i++) {
    if (float(i) >= span) break;
    float weight = pow(1.0 - float(i) / span, taper);
    if (weight <= trail) break;
    vec2 a = vec2(uTrail[i].x * uAspect, uTrail[i].y);
    vec2 b = vec2(uTrail[i + 1].x * uAspect, uTrail[i + 1].y);
    float r = radius * weight;
    trail = max(trail, weight * smoothstep(r, r * 0.35, segDist(point, a, b)));
    if (trail >= ceiling) break;
  }
  return smoothstep(uThreshold - uEdge, uThreshold + uEdge, trail) * gate;
}

float backdropField(vec2 p, float t) {
  float f = sin(p.x * 1.00 + t * 0.60) * 0.50;
  f += sin(p.y * 0.85 - t * 0.45) * 0.45;
  f += sin((p.x + p.y) * 0.65 + t * 0.35) * 0.35;
  f += sin((p.x - p.y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
}

float sdRBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// The device, in its own units (y up).
float sdBody(vec2 s) { return sdRBox(s, vec2(0.42, 0.55), 0.16); }
float sdHandle(vec2 s) {
  float ring = abs(length(s - vec2(0.0, 0.55)) - 0.15) - 0.035;
  return s.y < 0.55 ? 1.0 : ring;
}
const vec2 PANEL_C = vec2(0.0, 0.06);
const vec2 PANEL_B = vec2(0.31, 0.29);
float sdPanel(vec2 s) { return sdRBox(s - PANEL_C, PANEL_B, 0.05); }
float sdPocket(vec2 s) { return sdRBox(s - vec2(0.0, -0.40), vec2(0.30, 0.09), 0.06); }
float sdStrap(vec2 s) {
  float l = sdRBox(s - vec2(-0.47, -0.02), vec2(0.035, 0.40), 0.03);
  float r = sdRBox(s - vec2(0.47, -0.02), vec2(0.035, 0.40), 0.03);
  return min(l, r);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 ndc = frag / uRes * 2.0 - 1.0;
  vec2 pt = vec2(ndc.x * uAspect, ndc.y);

  // Backdrop contours
  vec2 p = pt * uLineScale;
  float t = uTime * uWaveSpeed;
  vec2 q = p;
  q.x += sin(p.y * 0.8 + t * 0.7) * uWaveAmount;
  q.y += cos(p.x * 0.7 - t * 0.6) * uWaveAmount;
  float scaled = backdropField(q, t) * uLineCount;
  float w = max(fwidth(scaled) * uLineThickness, 1e-5);
  float line = 1.0 - smoothstep(0.0, w, abs(fract(scaled) - 0.5));
  vec3 color = mix(uBg, uLine, line * uLineOpacity);

  float trail = revealTrail(ndc);

  // Subject space
  vec2 s = (pt - uCenter.xy) / uCenter.z;
  float px = 2.0 / uRes.y / uCenter.z;
  // Most pixels only contain contours. Skip the device shading outside its bounds.
  if (abs(s.x) > 0.51 + 2.0 * px || s.y > 0.735 + 2.0 * px || s.y < -0.55 - 2.0 * px) {
    if (uBgReveal > 0.001 && trail > 0.0) {
      float parity = mod(floor(scaled + 0.5), 2.0);
      color = mix(color, vec3(mix(uBgGrey, uBgGreyAlt, parity)), trail * uBgReveal);
    }
    outColor = vec4(color, 1.0);
    return;
  }
  float body = sdBody(s);
  float handle = sdHandle(s);
  float outline = min(body, handle);
  float strap = sdStrap(s);
  float shape = min(outline, strap);
  float inside = 1.0 - smoothstep(-px, px, shape);

  // Grey half of the reveal, banded by the contours' parity, outside the device.
  if (uBgReveal > 0.001) {
    float parity = mod(floor(scaled + 0.5), 2.0);
    vec3 shade = vec3(mix(uBgGrey, uBgGreyAlt, parity));
    color = mix(color, shade, trail * uBgReveal * (1.0 - inside));
  }

  // Ghost: the device as a hairline drawing, always there.
  float panel = sdPanel(s);
  float pocket = sdPocket(s);
  float hair = 1.0 - smoothstep(0.6 * px, 1.6 * px, abs(outline));
  hair = max(hair, 1.0 - smoothstep(0.6 * px, 1.6 * px, abs(panel)));
  hair = max(hair, 1.0 - smoothstep(0.6 * px, 1.6 * px, abs(pocket)));
  hair = max(hair, 1.0 - smoothstep(0.6 * px, 1.6 * px, abs(strap)));
  color = mix(color, uBg, inside * 0.9);
  color = mix(color, uInk, hair * 0.55);

  // The LED face grid
  vec2 pmin = PANEL_C - PANEL_B + vec2(0.02);
  vec2 pmax = PANEL_C + PANEL_B - vec2(0.02);
  vec2 luv = (s - pmin) / (pmax - pmin);
  float inPanel = step(0.0, luv.x) * step(luv.x, 1.0) * step(0.0, luv.y) * step(luv.y, 1.0);
  vec2 cellUv = vec2(luv.x, 1.0 - luv.y) * vec2(${LED_COLS}.0, ${LED_ROWS}.0);
  vec2 cellId = floor(cellUv);
  float pitch = (pmax.x - pmin.x) / ${LED_COLS}.0;
  float dotD = length(fract(cellUv) - 0.5) * pitch;
  float dotMask = (1.0 - smoothstep(pitch * 0.30 - px, pitch * 0.30 + px, dotD)) * inPanel;
  vec4 led = texture(uLed, (cellId + 0.5) / vec2(${LED_COLS}.0, ${LED_ROWS}.0));

  // Scan wave down the ghost's dots.
  if (dotMask > 0.0) {
  float h01 = (s.y - ${SUBJECT_BOTTOM.toFixed(3)}) / ${(SUBJECT_TOP - SUBJECT_BOTTOM).toFixed(3)};
  float start = 1.0 + uWaveWidth * 3.0;
  float travel = 1.0 + uWaveWidth * 6.0;
  float wave = 0.0;
  for (int i = 0; i < 8; i++) {
    float age = mod(uTime, uStagger) + float(i) * uStagger;
    if (age > uPeriod) break;
    float centre = start - (age / uPeriod) * travel;
    float d = (h01 - centre) / uWaveWidth;
    wave = max(wave, exp(-d * d));
  }
  vec3 ghostDot = mix(uSteel, uAccent, wave * uWaveOpacity);
  color = mix(color, ghostDot, dotMask * (0.45 + wave * 0.4));
  }

  float intact = 0.0;
  if (inside > 0.0 && uIntro < 1.0) {
    float burnFront = smoothstep(uBurnStart, 1.0, uIntro);
    float burnNoise = fbm(ndc * 3.5 + 11.0);
    float burnHeight = 1.0 - (ndc.y * 0.5 + 0.5);
    intact = smoothstep(burnFront - uBurnSoft, burnFront + uBurnSoft, mix(burnHeight, burnNoise, 0.45));
  }
  float solidAlpha = inside * max(trail, intact);
  if (solidAlpha <= 0.0) {
    outColor = vec4(color, 1.0);
    return;
  }

  // Solid: the lit device.
  vec2 e = vec2(0.002, 0.0);
  vec2 grad = vec2(sdBody(s + e.xy) - sdBody(s - e.xy), sdBody(s + e.yx) - sdBody(s - e.yx)) / (2.0 * e.x);
  float bevel = smoothstep(-0.09, 0.0, body);
  vec3 n = normalize(vec3(-grad * bevel * 1.6, 1.0));
  vec3 l = normalize(vec3(uLight * 1.6, 1.0));
  float lambert = max(dot(n, l), 0.0) - 0.72;
  vec3 solid = uBody * (1.0 + lambert * uRelight * 2.0);
  solid += vec3(0.05) * (1.0 - smoothstep(0.0, 0.5, length(s - vec2(uLight.x * 0.4, 0.45))));
  float handleIn = 1.0 - smoothstep(-px, px, handle);
  solid = mix(solid, uRaised, handleIn);
  float strapIn = 1.0 - smoothstep(-px, px, strap);
  solid = mix(solid, uRaised, strapIn);
  float pocketIn = 1.0 - smoothstep(-px, px, pocket);
  solid = mix(solid, uRaised, pocketIn);
  float zip = (1.0 - smoothstep(0.5 * px, 1.5 * px, abs(s.y + 0.335))) * pocketIn * step(abs(s.x), 0.26);
  solid = mix(solid, uAccent, zip);
  float panelIn = 1.0 - smoothstep(-px, px, panel);
  solid = mix(solid, uBlack, panelIn);
  vec3 ledOff = uRaised * 0.9;
  vec3 ledOn = led.rgb;
  float glow = led.a * (1.0 - smoothstep(pitch * 0.2, pitch * 0.9, dotD)) * inPanel * 0.35;
  solid = mix(solid, mix(ledOff, ledOn, led.a), dotMask);
  solid += uAccent * glow;
  float rim = 1.0 - smoothstep(0.6 * px, 1.6 * px, abs(outline));
  solid = mix(solid, uAccent, rim * 0.35);
  color = mix(color, solid, solidAlpha);
  float burnEdge = 4.0 * intact * (1.0 - intact);
  color += uAccent * burnEdge * uBurnGlow * 0.25 * inside;

  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`

export class HeroScene {
  private gl: WebGL2RenderingContext
  private program: WebGLProgram
  private uniforms = new Map<string, WebGLUniformLocation | null>()
  private ledPixels = new Uint8Array(LED_COLS * LED_ROWS * 4)
  private ledTexture: WebGLTexture
  private readonly samples = TRAIL_SAMPLES
  private trail: Float32Array
  private params: SceneParams = { ...PARAMS }
  private pointer = { ...STATIC_POSE }
  private smoothed = { ...STATIC_POSE }
  private lastSmoothed = { ...STATIC_POSE }
  private pointerSeen = false
  private pace = 0
  private startTime: number | null = null
  private readyAt: number | null = null
  private intro = 0
  private width = 1
  private height = 1
  private disposed = false
  private ledStep = -1
  private blinkUntil = 0
  private nextBlink = 2.5
  private columns = textToColumns(MESSAGE)
  ready = false
  onReady: (() => void) | null = null
  onError: ((e: Error) => void) | null = null
  private shaders: WebGLShader[] = []
  private buffer: WebGLBuffer | null = null
  private staticDirty = true
  private trailDirty = true
  private linked = false
  /** Subject placement in NDC: centre (x, y) and scale. */
  private fit = { x: 0, y: PARAMS.subjectY, scale: PARAMS.subjectScale }
  private colours: Record<string, [number, number, number]>

  constructor(private canvas: HTMLCanvasElement) {
    this.trail = new Float32Array(this.samples * 2)
    for (let i = 0; i < this.samples; i++) {
      this.trail[i * 2] = STATIC_POSE.x
      this.trail[i * 2 + 1] = -STATIC_POSE.y
    }
    const gl = canvas.getContext('webgl2', {
      antialias: false, alpha: false, stencil: false, depth: false,
      powerPreference: 'low-power', failIfMajorPerformanceCaveat: true,
    })
    if (!gl) throw new Error('WebGL2 unavailable')
    this.gl = gl
    // One style read for every colour: the raw tier of the tokens is plain hex.
    const root = getComputedStyle(document.documentElement)
    const hex = (name: string): [number, number, number] => {
      const v = root.getPropertyValue(name).trim().replace('#', '')
      const n = parseInt(v.length === 3 ? [...v].map((c) => c + c).join('') : v, 16)
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }
    this.colours = {
      uBg: hex('--raw-color-ice-50'),
      uLine: hex('--raw-color-ice-200'),
      uInk: hex('--raw-color-ink-950'),
      uAccent: hex('--raw-color-cyan-400'),
      uSteel: hex('--raw-color-steel-400'),
      uBody: hex('--raw-color-ink-800'),
      uRaised: hex('--raw-color-ink-700'),
      uBlack: hex('--raw-color-ink-950'),
    }
    this.program = this.startProgram()
    const tex = gl.createTexture()!
    this.ledTexture = tex
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, LED_COLS, LED_ROWS)
    this.drawLed(0)
    // The compile runs in the background; once linked, one throwaway frame and we are ready.
    this.whenLinked(() => {
      this.render(0)
      this.ready = true
      this.onReady?.()
    })
  }

  /**
   * Starts the compile and returns at once. Status is only queried once the
   * driver reports completion (KHR_parallel_shader_compile), so the compile
   * runs off the main thread while the veil keeps animating. Without the
   * extension the status query simply blocks, as it always did.
   */
  private startProgram() {
    const gl = this.gl
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return sh
    }
    const program = gl.createProgram()!
    const vs = compile(gl.VERTEX_SHADER, vertex)
    const fs = compile(gl.FRAGMENT_SHADER, fragment(this.samples))
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    this.shaders = [vs, fs]
    return program
  }

  private whenLinked(done: () => void) {
    const gl = this.gl
    const ext = gl.getExtension('KHR_parallel_shader_compile')
    const poll = () => {
      if (this.disposed) return
      if (ext && !gl.getProgramParameter(this.program, ext.COMPLETION_STATUS_KHR)) {
        requestAnimationFrame(poll)
        return
      }
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        const log = this.shaders.map((s) => gl.getShaderInfoLog(s)).join('\n') || gl.getProgramInfoLog(this.program)
        this.onError?.(new Error(log ?? 'link'))
        return
      }
      this.finishProgram()
      done()
    }
    // Never poll synchronously: without the extension (iOS Safari, many phones)
    // the first poll completes at once, inside the constructor, before the
    // caller has attached onReady, and the veil would wait forever.
    queueMicrotask(poll)
  }

  private finishProgram() {
    const gl = this.gl
    const program = this.program
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    this.buffer = buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.linked = true
  }

  private u(name: string) {
    if (!this.uniforms.has(name)) this.uniforms.set(name, this.gl.getUniformLocation(this.program, name))
    return this.uniforms.get(name)!
  }

  /** The LED face: two eyes that blink, and a message scrolling under them. */
  private drawLed(t: number) {
    const step = Math.floor(t / 0.07)
    const blinking = t < this.blinkUntil
    if (t > this.nextBlink) {
      this.blinkUntil = t + 0.14
      this.nextBlink = t + 2.5 + Math.random() * 3
    }
    const key = step * 2 + (blinking ? 1 : 0)
    if (key === this.ledStep) return
    this.ledStep = key
    // Written straight into a byte array and uploaded as-is: no 2D canvas, so
    // no GPU readback on every step of the message.
    const px = this.ledPixels
    px.fill(0)
    const [ar, ag, ab] = this.colours.uAccent.map((v) => Math.round(v * 255))
    const set = (x: number, y: number, white: boolean) => {
      const o = (y * LED_COLS + x) * 4
      px[o] = white ? 255 : ar
      px[o + 1] = white ? 255 : ag
      px[o + 2] = white ? 255 : ab
      px[o + 3] = 255
    }
    const rect = (x: number, y: number, w: number, h: number) => {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, false)
    }
    for (const x0 of [7, 20]) {
      if (blinking) rect(x0, 9, 5, 1)
      else {
        rect(x0 + 1, 6, 3, 1)
        rect(x0, 7, 5, 4)
        rect(x0 + 1, 11, 3, 1)
      }
    }
    const cols = this.columns
    const offset = step % (cols.length + LED_COLS)
    for (let x = 0; x < LED_COLS; x++) {
      const c = cols[(x + offset) % cols.length]
      if (!c) continue
      for (let r = 0; r < 7; r++) if (c.bits[r]) set(x, 18 + r, c.char % 2 === 1)
    }
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.ledTexture)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, LED_COLS, LED_ROWS, gl.RGBA, gl.UNSIGNED_BYTE, px)
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y }
    if (!this.pointerSeen) {
      this.pointerSeen = true
      this.smoothed = { x, y }
      this.lastSmoothed = { x, y }
    }
  }

  setParams(partial: Partial<SceneParams>) {
    Object.assign(this.params, partial)
    this.staticDirty = true
  }

  /** Place the device: centre in NDC and a scale (1 = the xl frame). */
  setFit(fit: { x: number; y: number; scale: number }) {
    this.fit = fit
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    const pixelBudget = 650_000
    const dpr = Math.min(window.devicePixelRatio || 1, Math.sqrt(pixelBudget / (this.width * this.height)))
    const w = Math.max(1, Math.floor(this.width * dpr))
    const h = Math.max(1, Math.floor(this.height * dpr))
    if (this.canvas.width !== w) this.canvas.width = w
    if (this.canvas.height !== h) this.canvas.height = h
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.staticDirty = true
  }

  update(time: number) {
    if (this.disposed || !this.linked) return
    if (this.startTime === null) this.startTime = time
    const t = (time - this.startTime) / 1000
    const p = this.params

    this.smoothed.x += (this.pointer.x - this.smoothed.x) * p.pointerLerp
    this.smoothed.y += (this.pointer.y - this.smoothed.y) * p.pointerLerp

    if (this.ready) {
      if (this.readyAt === null) this.readyAt = t
      this.intro = Math.min(1, (t - this.readyAt) / p.introDuration)
    }

    const step = Math.hypot(this.smoothed.x - this.lastSmoothed.x, this.smoothed.y - this.lastSmoothed.y)
    const target = Math.min(1, step / p.pacePeak)
    this.pace += (target - this.pace) * (target > this.pace ? p.paceAttack : p.paceRelease)
    this.lastSmoothed.x = this.smoothed.x
    this.lastSmoothed.y = this.smoothed.y

    this.trail.copyWithin(2, 0, (this.samples - 1) * 2)
    this.trail[0] = this.smoothed.x
    this.trail[1] = -this.smoothed.y

    if (this.intro < 1 || this.pace > p.paceThreshold) this.drawLed(t)
    this.render(t)
  }

  /** Uniforms shared by every frame until the canvas or its placement changes. */
  private writeStatic() {
    const gl = this.gl
    const p = this.params
    gl.uniform2f(this.u('uRes'), this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u('uAspect'), this.width / this.height)
    gl.uniform1f(this.u('uRadius'), p.trailRadius)
    gl.uniform1f(this.u('uIdleScale'), p.trailIdleScale)
    gl.uniform1f(this.u('uTaper'), p.trailTaper)
    gl.uniform1f(this.u('uTaperIdle'), p.trailTaperIdle)
    gl.uniform1f(this.u('uTaperFast'), p.trailTaperFast)
    gl.uniform1f(this.u('uLength'), p.trailLength)
    gl.uniform1f(this.u('uGateStart'), p.paceThreshold)
    gl.uniform1f(this.u('uGateWidth'), p.paceRamp)
    gl.uniform1f(this.u('uWarp'), p.revealWarp)
    gl.uniform1f(this.u('uWarpScale'), p.revealWarpScale)
    gl.uniform1f(this.u('uThreshold'), p.revealThreshold)
    gl.uniform1f(this.u('uEdge'), p.revealEdge)
    gl.uniform1f(this.u('uBurnStart'), p.burnStart)
    gl.uniform1f(this.u('uBurnSoft'), p.burnSoftness)
    gl.uniform1f(this.u('uBurnGlow'), p.burnGlow)
    gl.uniform1f(this.u('uRelight'), p.relight)
    gl.uniform1f(this.u('uPeriod'), p.outlinePeriod)
    gl.uniform1f(this.u('uStagger'), p.outlineStagger)
    gl.uniform1f(this.u('uWaveWidth'), p.outlineWidth)
    gl.uniform1f(this.u('uLineScale'), p.bgLineScale)
    gl.uniform1f(this.u('uLineCount'), p.bgLineCount)
    gl.uniform1f(this.u('uLineThickness'), p.bgLineThickness)
    gl.uniform1f(this.u('uLineOpacity'), p.bgLineOpacity)
    gl.uniform1f(this.u('uWaveAmount'), p.bgWaveAmount)
    gl.uniform1f(this.u('uWaveSpeed'), p.bgWaveSpeed)
    gl.uniform1f(this.u('uBgReveal'), p.bgRevealOpacity)
    gl.uniform1f(this.u('uBgGrey'), p.bgRevealLightness)
    gl.uniform1f(this.u('uBgGreyAlt'), p.bgRevealLightnessAlt)
    for (const [name, [r, g, b]] of Object.entries(this.colours)) gl.uniform3f(this.u(name), r, g, b)
    gl.uniform1i(this.u('uLed'), 0)
    this.staticDirty = false
  }

  private render(t: number) {
    const gl = this.gl
    const p = this.params
    const aspect = this.width / this.height
    gl.useProgram(this.program)
    if (this.staticDirty) this.writeStatic()
    gl.uniform1f(this.u('uTime'), t)
    gl.uniform1f(this.u('uWarpTime'), t * p.revealSpeed)
    gl.uniform1f(this.u('uPace'), this.pace)
    gl.uniform1f(this.u('uIntro'), this.intro)
    gl.uniform1f(this.u('uWaveOpacity'), p.outlineOpacity * Math.min(1, this.intro * 2))
    // The trail only matters while the reveal can show; skip the upload when it cannot.
    if (this.pace > 0.001 || this.trailDirty) {
      gl.uniform2fv(this.u('uTrail'), this.trail)
      const active = Math.min(this.samples, Math.ceil(p.trailLength * (this.samples - 1)) + 1)
      const margin = p.trailRadius + p.revealWarp * 0.22 + 0.05
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < active; i++) {
        const x = this.trail[i * 2] * aspect
        const y = this.trail[i * 2 + 1]
        minX = Math.min(minX, x); maxX = Math.max(maxX, x)
        minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
      gl.uniform2f(this.u('uTrailMin'), minX - margin, minY - margin)
      gl.uniform2f(this.u('uTrailMax'), maxX + margin, maxY + margin)
      this.trailDirty = this.pace > 0.001
    }
    const cx = this.fit.x * aspect + this.smoothed.x * p.subjectParallax
    const cy = this.fit.y - this.smoothed.y * p.subjectParallax
    gl.uniform3f(this.u('uCenter'), cx, cy, this.fit.scale)
    gl.uniform2f(this.u('uLight'), this.smoothed.x, -this.smoothed.y)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.ledTexture)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    const gl = this.gl
    gl.useProgram(null)
    gl.deleteBuffer(this.buffer)
    gl.deleteTexture(this.ledTexture)
    gl.deleteProgram(this.program)
    for (const shader of this.shaders) gl.deleteShader(shader)
  }
}
