uniform float uElevation;
uniform vec2 uFrequency;
uniform float uTime;
uniform float uSpeed;

varying vec2 vUv;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Elevation
  float elevation = sin(modelPosition.x * uFrequency.x + uTime * uSpeed) *
                    sin(modelPosition.z * uFrequency.y + uTime * uSpeed) *
                    uElevation;

  modelPosition.y += elevation;

  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Varying
  vUv = uv;
}
