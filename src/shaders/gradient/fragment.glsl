varying vec2 vUv;
varying vec3 vColor;

uniform bool uEnableGrain;
uniform float uGrainAmount;

// Simple random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);

    // Mix 4 corners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    // Loop of octaves - using more octaves for finer detail
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.1; // Slightly higher frequency multiplier for finer detail
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec3 color = vColor;

    if (uEnableGrain) {
        // Add grain using fbm for a textile-like effect
        // Increased scale factor for much finer grain
        float grain = fbm(vUv * 5000.0);
        color.rgb += (grain - 0.5) * uGrainAmount;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}