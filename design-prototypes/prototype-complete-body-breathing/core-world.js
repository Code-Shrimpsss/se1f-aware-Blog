(() => {
  'use strict'

  const vertexSource = `#version 300 es
    in vec2 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `

  const fragmentSource = `#version 300 es
    precision highp float;

    out vec4 outColor;

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;
    uniform float uScroll;
    uniform float uCrackLight;
    uniform float uSideLeft;
    uniform float uSideRight;
    uniform float uPressurePhase;
    uniform float uPressureAmount;
    uniform float uArmLift;
    uniform float uCavityOpen;
    uniform float uGrowth;
    uniform float uBreathIndex;
    uniform float uReducedMotion;

    const float PI = 3.141592653589793;
    const int MAX_STEPS = 112;
    const float MAX_DISTANCE = 16.0;
    const float SURFACE_EPSILON = 0.00125;

    float saturate(float value) {
      return clamp(value, 0.0, 1.0);
    }

    float easeInOut(float value) {
      value = saturate(value);
      return value * value * (3.0 - 2.0 * value);
    }

    mat2 rotate2d(float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return mat2(c, -s, s, c);
    }

    float hash31(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      return mix(
        mix(
          mix(hash31(i + vec3(0.0, 0.0, 0.0)), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x),
          f.y
        ),
        mix(
          mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x),
          f.y
        ),
        f.z
      );
    }

    float smoothMinimum(float a, float b, float k) {
      float h = saturate(0.5 + 0.5 * (b - a) / k);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    float smoothMaximum(float a, float b, float k) {
      return -smoothMinimum(-a, -b, k);
    }

    float sdSphere(vec3 p, float radius) {
      return length(p) - radius;
    }

    float sdEllipsoid(vec3 p, vec3 radius) {
      float k0 = length(p / radius);
      float k1 = length(p / (radius * radius));
      return k0 * (k0 - 1.0) / max(k1, 0.0001);
    }

    float sdSuperellipsoid(vec3 p, vec3 radius, float exponent) {
      vec3 normalized = abs(p) / radius;
      float field = pow(
        pow(normalized.x, exponent)
          + pow(normalized.y, exponent)
          + pow(normalized.z, exponent),
        1.0 / exponent
      );
      return (field - 1.0) * min(radius.x, min(radius.y, radius.z)) * 0.82;
    }

    float sdRoundBox(vec3 p, vec3 bounds, float radius) {
      vec3 q = abs(p) - bounds + radius;
      return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - radius;
    }

    float sdCapsule(vec3 p, vec3 a, vec3 b, float radius) {
      vec3 pa = p - a;
      vec3 ba = b - a;
      float h = saturate(dot(pa, ba) / dot(ba, ba));
      return length(pa - ba * h) - radius;
    }

    float sdRoundCone(vec3 p, vec3 a, vec3 b, float radiusA, float radiusB) {
      vec3 ba = b - a;
      float lengthSquared = dot(ba, ba);
      float radiusDelta = radiusA - radiusB;
      float a2 = lengthSquared - radiusDelta * radiusDelta;
      float inverseLengthSquared = 1.0 / lengthSquared;
      vec3 pa = p - a;
      float y = dot(pa, ba);
      float z = y - lengthSquared;
      float x2 = dot(pa * lengthSquared - ba * y, pa * lengthSquared - ba * y);
      float y2 = y * y * lengthSquared;
      float z2 = z * z * lengthSquared;
      float k = sign(radiusDelta) * radiusDelta * radiusDelta * x2;

      if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * inverseLengthSquared - radiusB;
      if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * inverseLengthSquared - radiusA;
      return (sqrt(x2 * a2 * inverseLengthSquared) + y * radiusDelta) * inverseLengthSquared - radiusA;
    }

    float crackCurve(float y) {
      float broadS = sin((y + 0.03) * 2.22) * 0.2;
      float lowerTurn = sin((y + 0.48) * 4.18) * 0.052;
      return 0.17 + broadS + lowerTurn;
    }

    float crackWindow(float y) {
      return 1.0 - smoothstep(1.18, 1.47, abs(y + 0.02));
    }

    vec3 warpForBreath(vec3 p) {
      float curve = crackCurve(p.y);
      float relativeX = p.x - curve;
      float window = crackWindow(p.y);
      float leftMask = (1.0 - smoothstep(-0.05, 0.05, relativeX)) * window;
      float rightMask = smoothstep(-0.05, 0.05, relativeX) * window;

      vec3 q = p;

      vec2 cavityCoordinate = vec2((p.x + 0.34) / 0.59, (p.y - 0.01) / 0.86);
      cavityCoordinate = rotate2d(-0.14) * cavityCoordinate;
      float cavityField = exp(
        -pow(abs(cavityCoordinate.x), 2.7)
        -pow(abs(cavityCoordinate.y), 2.45)
      );
      float cavityFront = smoothstep(-0.16, 0.66, p.z);
      float cavityDepth = 0.1 + (uCavityOpen + uGrowth * 0.4) * 0.028;
      q.z += cavityField * cavityFront * cavityDepth;
      q.x += cavityField * cavityFront * 0.038;
      q.y -= cavityField * cavityFront * 0.018;

      float temporalStretch = smoothstep(0.42, 1.08, p.y) * smoothstep(-0.08, 0.72, p.x);
      q.x -= temporalStretch * 0.11;
      q.z += temporalStretch * 0.035;

      q.x += leftMask * (uSideLeft + uGrowth * 0.32) * 0.031;
      q.x -= rightMask * (uSideRight + uGrowth * 0.21) * 0.017;

      float crackNear = exp(-abs(relativeX) * 2.25) * window;
      float opening = easeInOut((uScroll - 0.35) / 0.20);
      float depthSide = mix(-1.0, 1.0, smoothstep(-0.035, 0.035, relativeX));
      q.z += depthSide * opening * crackNear * 0.27;

      float liftMask = smoothstep(0.3, 1.08, q.y) * smoothstep(-0.08, 0.72, q.x);
      vec2 armPoint = q.xy - vec2(0.12, 0.45);
      armPoint = rotate2d(-(uArmLift + uGrowth * 0.16) * 0.0349066 * liftMask) * armPoint;
      q.xy = mix(q.xy, armPoint + vec2(0.12, 0.45), liftMask);

      return q;
    }

    float completeBody(vec3 p) {
      vec3 q = warpForBreath(p);

      float grooveWindow = crackWindow(q.y);
      float curve = crackCurve(q.y);
      float groove = exp(-abs(q.x - curve) * 15.0) * grooveWindow;
      q.z += groove * (0.055 + uCrackLight * 0.018);

      vec3 shellPoint = q - vec3(-0.035, 0.02, -0.045);
      shellPoint.xy = rotate2d(0.035) * shellPoint.xy;
      shellPoint.xz = rotate2d(-0.055) * shellPoint.xz;

      float lowerWeight = smoothstep(-1.27, 0.22, shellPoint.y);
      float lowerWidth = mix(0.28, 1.0, lowerWeight);
      float crownWidth = 1.0 - smoothstep(0.88, 1.28, shellPoint.y) * 0.09;
      shellPoint.x += (1.0 - lowerWeight) * 0.23;
      shellPoint.x += shellPoint.y * 0.045;
      shellPoint.x /= lowerWidth * crownWidth;
      shellPoint.z /= mix(0.73, 1.0, lowerWeight);

      float body = sdSuperellipsoid(shellPoint, vec3(0.9, 1.29, 0.62), 4.15);
      body = max(body, q.y + q.x * 0.085 - 1.27);

      vec3 timeWallPoint = q - vec3(0.5, 0.16, -0.14);
      timeWallPoint.xy = rotate2d(-0.105) * timeWallPoint.xy;
      timeWallPoint.xz = rotate2d(-0.07) * timeWallPoint.xz;
      float timeWall = sdRoundBox(timeWallPoint, vec3(0.31, 0.86, 0.5), 0.16);

      body = smoothMinimum(body, timeWall, 0.13);

      vec3 upperCantileverPoint = q - vec3(-0.34, 0.9, 0.01);
      upperCantileverPoint.xy = rotate2d(0.065) * upperCantileverPoint.xy;
      upperCantileverPoint.xz = rotate2d(-0.12) * upperCantileverPoint.xz;
      float upperCantilever = sdRoundBox(
        upperCantileverPoint,
        vec3(0.62, 0.24, 0.53),
        0.12
      );
      body = smoothMinimum(body, upperCantilever, 0.1);

      vec3 inwardBayPoint = q - vec3(-0.84, 0.05, -0.02);
      inwardBayPoint.xy = rotate2d(-0.23) * inwardBayPoint.xy;
      inwardBayPoint.xz = rotate2d(0.32) * inwardBayPoint.xz;
      float inwardBay = sdSuperellipsoid(inwardBayPoint, vec3(0.46, 0.72, 0.52), 3.0);
      body = smoothMaximum(body, -inwardBay, 0.075);

      float tubeFront = 0.545 - q.y * 0.018;
      float crackTube = length(vec2((q.x - crackCurve(q.y)) * 0.86, q.z - tubeFront)) - (0.046 + uCrackLight * 0.004);
      crackTube = max(crackTube, abs(q.y + 0.02) - 1.28);
      body = smoothMaximum(body, -crackTube, 0.022);

      vec2 pressureSource = uBreathIndex < 0.5 ? vec2(-0.19, 0.05) : vec2(0.31, -0.3);
      float surfaceDistance = length(q.xy - pressureSource);
      float waveRadius = mix(0.12, 2.05, uPressurePhase);
      float irregularity = (noise3(q * 3.1 + vec3(0.0, 0.0, uBreathIndex * 2.7)) - 0.5) * 0.17;
      float wave = exp(-pow((surfaceDistance + irregularity - waveRadius) * 5.2, 2.0));
      body -= wave * uPressureAmount * 0.042;

      float materialGrain = (noise3(q * 8.5) - 0.5) * 0.0018;
      body += materialGrain;

      return body;
    }

    float mapScene(vec3 p) {
      return completeBody(p);
    }

    vec3 sceneNormal(vec3 p) {
      vec2 e = vec2(0.0014, 0.0);
      return normalize(vec3(
        mapScene(p + e.xyy) - mapScene(p - e.xyy),
        mapScene(p + e.yxy) - mapScene(p - e.yxy),
        mapScene(p + e.yyx) - mapScene(p - e.yyx)
      ));
    }

    float ambientOcclusion(vec3 p, vec3 normal) {
      float occlusion = 0.0;
      float scale = 1.0;
      for (int index = 0; index < 5; index += 1) {
        float distanceAlongNormal = 0.025 + 0.055 * float(index);
        float sampledDistance = mapScene(p + normal * distanceAlongNormal);
        occlusion += (distanceAlongNormal - sampledDistance) * scale;
        scale *= 0.62;
      }
      return saturate(1.0 - occlusion * 2.1);
    }

    float raymarch(vec3 rayOrigin, vec3 rayDirection, out vec3 hitPoint, out float stepRatio) {
      float distanceTravelled = 0.0;
      float minimumDistance = 10.0;
      int stepsTaken = 0;

      for (int index = 0; index < MAX_STEPS; index += 1) {
        vec3 point = rayOrigin + rayDirection * distanceTravelled;
        float distanceToSurface = mapScene(point);
        minimumDistance = min(minimumDistance, abs(distanceToSurface));
        stepsTaken = index;
        if (distanceToSurface < SURFACE_EPSILON || distanceTravelled > MAX_DISTANCE) break;
        distanceTravelled += distanceToSurface * 0.72;
      }

      hitPoint = rayOrigin + rayDirection * distanceTravelled;
      stepRatio = float(stepsTaken) / float(MAX_STEPS);
      return distanceTravelled > MAX_DISTANCE ? -minimumDistance : distanceTravelled;
    }

    vec3 cameraRay(vec2 uv, vec3 rayOrigin, vec3 target, float zoom) {
      vec3 forward = normalize(target - rayOrigin);
      vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(right, forward);
      return normalize(forward * zoom + right * uv.x + up * uv.y);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;

      float approach = easeInOut(min(uScroll / 0.35, 1.0));
      float settle = easeInOut((uScroll - 0.22) / 0.13);

      vec3 cameraStart = vec3(-3.12, 0.13, 5.42);
      vec3 cameraNear = vec3(-0.24, 0.04, 1.3);
      vec3 curveControl = vec3(-1.52, 0.36, 2.95);
      vec3 firstLeg = mix(cameraStart, curveControl, approach);
      vec3 secondLeg = mix(curveControl, cameraNear, approach);
      vec3 rayOrigin = mix(firstLeg, secondLeg, approach);

      float yaw = uPointer.x * 0.0261799 * (1.0 - settle * 0.45);
      float pitch = uPointer.y * 0.0261799 * (1.0 - settle * 0.45);
      rayOrigin.xz = rotate2d(yaw) * rayOrigin.xz;
      rayOrigin.yz = rotate2d(-pitch) * rayOrigin.yz;

      vec3 cameraTarget = mix(vec3(0.0, 0.02, 0.0), vec3(0.4, 0.03, 0.27), approach);
      float framingOffset = mix(0.31, -0.04, approach);
      uv.x -= framingOffset;
      float zoom = mix(2.22, 2.28, approach);
      vec3 rayDirection = cameraRay(uv, rayOrigin, cameraTarget, zoom);

      vec3 hitPoint = vec3(0.0);
      float stepRatio = 0.0;
      float hitDistance = raymarch(rayOrigin, rayDirection, hitPoint, stepRatio);

      if (hitDistance > 0.0) {
        vec3 normal = sceneNormal(hitPoint);
        vec3 viewDirection = normalize(rayOrigin - hitPoint);
        vec3 keyLight = normalize(vec3(-0.72, 0.86, 0.63));
        vec3 lowFill = normalize(vec3(0.62, -0.34, 0.46));

        float key = max(dot(normal, keyLight), 0.0);
        float fill = max(dot(normal, lowFill), 0.0);
        float halfLambert = dot(normal, keyLight) * 0.5 + 0.5;
        float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.2);
        float ao = ambientOcclusion(hitPoint, normal);

        vec3 bone = vec3(0.94, 0.93, 0.89);
        vec3 warmEdge = vec3(0.96, 0.945, 0.89);
        vec3 deepLayer = vec3(0.13, 0.135, 0.13);

        float cavityShade = (1.0 - smoothstep(-0.08, 0.2, normal.z))
          * (1.0 - smoothstep(-0.08, 0.46, hitPoint.x));
        vec3 color = bone * (0.18 + key * 0.79 + fill * 0.1 + halfLambert * 0.08);
        color *= mix(0.6, 1.0, ao);
        color = mix(color, deepLayer, cavityShade * 0.54);
        color += warmEdge * rim * 0.085;

        float curve = crackCurve(hitPoint.y);
        float crackOffset = hitPoint.x - curve;
        float crackMask = exp(-abs(crackOffset) * 34.0) * crackWindow(hitPoint.y);
        float crackFacing = smoothstep(-0.3, 0.45, hitPoint.z);
        float internalLight = crackMask * crackFacing * uCrackLight;
        float foldSide = exp(-abs(crackOffset) * 7.5) * crackWindow(hitPoint.y)
          * smoothstep(-0.11, 0.1, crackOffset);
        float litInnerEdge = exp(-abs(crackOffset + 0.028) * 54.0)
          * crackWindow(hitPoint.y) * crackFacing * uCrackLight;
        color *= 1.0 - foldSide * 0.17;
        color = mix(color, vec3(0.028, 0.029, 0.028), crackMask * 0.78);
        color += vec3(0.93, 0.91, 0.82) * internalLight * 0.21;
        color += vec3(0.95, 0.93, 0.85) * litInnerEdge * 0.27;

        float surfaceGrain = noise3(hitPoint * 18.0) - 0.5;
        color += surfaceGrain * 0.018;
        color *= 1.0 - stepRatio * 0.045;

        float depthFog = smoothstep(5.8, 10.0, hitDistance);
        color = mix(color, vec3(0.0), depthFog);

        outColor = vec4(max(color, 0.0), 1.0);
      } else {
        float closeFog = smoothstep(0.48, 1.0, uScroll) * exp(-length(uv * vec2(0.72, 0.9)) * 1.8);
        float pressureFog = exp(-length(uv - vec2(0.18, 0.02)) * 2.8) * 0.025;
        vec3 fogColor = vec3(0.055, 0.056, 0.054) * (closeFog * 0.32 + pressureFog);
        float fogAlpha = closeFog * 0.08 + pressureFog * 0.22;
        outColor = vec4(fogColor, fogAlpha);
      }
    }
  `

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown WebGL shader compile error.'
      gl.deleteShader(shader)
      throw new Error(message)
    }

    return shader
  }

  function createProgram(gl) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'Unknown WebGL program link error.'
      gl.deleteProgram(program)
      throw new Error(message)
    }

    return program
  }

  class CompleteCoreWorld {
    constructor(canvas) {
      this.canvas = canvas
      this.gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      })

      if (!this.gl) throw new Error('WebGL2 is required for the complete-body prototype.')

      this.program = createProgram(this.gl)
      this.uniforms = {}
      this.width = 0
      this.height = 0
      this.dpr = 1
      this.frameCount = 0

      const uniformNames = [
        'uResolution',
        'uPointer',
        'uTime',
        'uScroll',
        'uCrackLight',
        'uSideLeft',
        'uSideRight',
        'uPressurePhase',
        'uPressureAmount',
        'uArmLift',
        'uCavityOpen',
        'uGrowth',
        'uBreathIndex',
        'uReducedMotion',
      ]

      uniformNames.forEach((name) => {
        this.uniforms[name] = this.gl.getUniformLocation(this.program, name)
      })

      const geometry = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometry)
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        this.gl.STATIC_DRAW,
      )

      const position = this.gl.getAttribLocation(this.program, 'aPosition')
      this.gl.enableVertexAttribArray(position)
      this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0)
      this.gl.disable(this.gl.DEPTH_TEST)
      this.gl.disable(this.gl.CULL_FACE)
      this.gl.enable(this.gl.BLEND)
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
      this.gl.clearColor(0, 0, 0, 0)
    }

    resize() {
      const width = Math.max(1, window.innerWidth)
      const height = Math.max(1, window.innerHeight)
      const compact = width <= 720
      const dprLimit = compact ? 1.25 : 1.5
      const dpr = Math.min(window.devicePixelRatio || 1, dprLimit)
      const backingWidth = Math.round(width * dpr)
      const backingHeight = Math.round(height * dpr)

      if (this.canvas.width !== backingWidth || this.canvas.height !== backingHeight) {
        this.canvas.width = backingWidth
        this.canvas.height = backingHeight
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
      }

      this.width = backingWidth
      this.height = backingHeight
      this.dpr = dpr
      this.gl.viewport(0, 0, backingWidth, backingHeight)
    }

    render(frame) {
      if (this.canvas.width !== Math.round(window.innerWidth * this.dpr)
        || this.canvas.height !== Math.round(window.innerHeight * this.dpr)) {
        this.resize()
      }

      const gl = this.gl
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(this.program)
      gl.uniform2f(this.uniforms.uResolution, this.width, this.height)
      gl.uniform2f(this.uniforms.uPointer, frame.pointerX, frame.pointerY)
      gl.uniform1f(this.uniforms.uTime, frame.time)
      gl.uniform1f(this.uniforms.uScroll, frame.scroll)
      gl.uniform1f(this.uniforms.uCrackLight, frame.crackLight)
      gl.uniform1f(this.uniforms.uSideLeft, frame.sideLeft)
      gl.uniform1f(this.uniforms.uSideRight, frame.sideRight)
      gl.uniform1f(this.uniforms.uPressurePhase, frame.pressurePhase)
      gl.uniform1f(this.uniforms.uPressureAmount, frame.pressureAmount)
      gl.uniform1f(this.uniforms.uArmLift, frame.armLift)
      gl.uniform1f(this.uniforms.uCavityOpen, frame.cavityOpen)
      gl.uniform1f(this.uniforms.uGrowth, frame.growth)
      gl.uniform1f(this.uniforms.uBreathIndex, frame.breathIndex)
      gl.uniform1f(this.uniforms.uReducedMotion, frame.reducedMotion ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      this.frameCount += 1
    }

    finish() {
      this.gl.finish()
    }

    diagnostics() {
      return {
        renderer: this.gl.getParameter(this.gl.RENDERER),
        version: this.gl.getParameter(this.gl.VERSION),
        width: this.width,
        height: this.height,
        dpr: this.dpr,
        frameCount: this.frameCount,
      }
    }
  }

  window.CompleteCoreWorld = {
    create(canvas) {
      return new CompleteCoreWorld(canvas)
    },
  }
})()
