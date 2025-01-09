varying vec2 vUv;
varying vec3 vColor;

uniform bool uEnableGrain;

// Simple random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 color = vColor;

    if (uEnableGrain) {
        vec2 grainUv = vUv * 5000.0;
        float grain = random(floor(grainUv)) * 2.0 - 1.0;
        color = color + color * grain * 0.5;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}