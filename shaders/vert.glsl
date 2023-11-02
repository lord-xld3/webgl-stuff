attribute vec4 coordinates;
uniform mat4 modelViewProjection;
varying vec3 fragOrientation;

void main(void) {
    gl_Position = modelViewProjection * coordinates;

    // Calculate orientation (rotation)
    mat4 rotationMatrix = mat4(modelViewProjection);
    fragOrientation = mat3(rotationMatrix) * coordinates.xyz;
}