// Initialize WebGL
function initGL(canvas) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL is not supported in your browser.');
    } else {
        
        // Fix depth buffer issues
        gl.enable(gl.DEPTH_TEST);

        // Load the vertex and fragment shaders
        let vertexShaderSource = `
            attribute vec4 coordinates;
            uniform mat4 modelViewProjection;
            varying vec3 fragOrientation;
            
            void main(void) {
                gl_Position = modelViewProjection * coordinates;
            
                // Calculate orientation (rotation)
                mat4 rotationMatrix = mat4(modelViewProjection);
                fragOrientation = mat3(rotationMatrix) * coordinates.xyz;
            }
        `;

        let fragmentShaderSource = `
            precision highp float;
            varying vec3 fragOrientation;
            uniform vec4 color;
            
            void main(void) {
                // Use fragOrientation to compute the fragment color
                vec3 orientation = normalize(fragOrientation);
                vec3 colorValues = (orientation + 1.0) * 0.5; // Map orientation to color values
                gl_FragColor = vec4(colorValues, 1.0); // Alpha is fully opaque
            }
        `;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        return {gl, shaderProgram};
    }
};