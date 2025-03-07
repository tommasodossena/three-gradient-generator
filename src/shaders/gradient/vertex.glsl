uniform vec2 uFrequency;
uniform float uTime;
uniform float uAmount;
uniform float uSpeed;
uniform vec3 uColor[3];

varying vec2 vUv;
varying vec3 vColor;

// Simplex noise functions
vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3) ) );
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec2 noiseCoord = uv * vec2(uFrequency.x, uFrequency.y);

    // Get the noise value
    float noise = snoise(vec3(noiseCoord.x + uTime*0.02, noiseCoord.y, uTime * uSpeed));

    // Clamp the noise value to prevent extreme displacements
    // This limits the range to [-0.8, 0.8] instead of [-1, 1]
    noise = clamp(noise, -0.8, 0.8);

    // Apply the displacement with a maximum limit
    float maxDisplacement = 0.15; // Maximum displacement allowed
    float displacement = noise * uAmount;

    // Ensure the displacement doesn't exceed the maximum
    displacement = clamp(displacement, -maxDisplacement, maxDisplacement);

    modelPosition.y += displacement;

    // Updated color mixing logic for 3 colors
    vColor = uColor[2]; // Start with the last color
    for(int i = 0; i < 2; i++) {
        float noiseFlow = 0.0002 + float(i)*0.07; // Adjusted flow for better distribution
        float noiseSpeed = 0.0001 + float(i)*0.04; // Adjusted speed
        float noiseSeed = 1.0 + float(i)*15.0; // Increased seed difference
        vec2 noiseFreq = vec2(0.3, 0.6);
        float noiseFloor = 0.1;
        float noiseCeiling = 0.6 + float(i)*0.12; // Adjusted ceiling for better color separation

        float noise = smoothstep(
            noiseFloor,
            noiseCeiling,
            snoise(vec3(
                noiseCoord.x * noiseFreq.x + uTime * noiseFlow,
                noiseCoord.y * noiseFreq.y,
                uTime * noiseSpeed + noiseSeed
            ))
        );

        vColor = mix(vColor, uColor[i], noise);
    }

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vUv = uv;
}
