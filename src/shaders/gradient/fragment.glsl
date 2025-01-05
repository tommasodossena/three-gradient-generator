uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

void main()
{
  gl_FragColor = vec4(mix(uColor1, uColor2, vUv.y), 1.0);

  #include <colorspace_fragment>
}