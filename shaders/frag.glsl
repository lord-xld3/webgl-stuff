precision highp float;
varying vec3 fragOrientation;
uniform vec4 color;

void main(void) {
    // Use fragOrientation to compute the fragment color
    vec3 orientation = normalize(fragOrientation);
    vec3 colorValues = (orientation + 1.0) * 0.5; // Map orientation to color values
    gl_FragColor = vec4(colorValues, 1.0); // Alpha is fully opaque
}