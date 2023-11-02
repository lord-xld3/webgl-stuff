// Shader loading function
function loadShaderSource(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch shader source: ${response.status} ${response.statusText}`);
        }
        return response.text();
    });
}

// Initialize WebGL
function initGL(canvas) {
    return new Promise((resolve, reject) => {
        const gl = canvas.getContext('webgl');
        if (!gl) {
            alert('WebGL is not supported in your browser.');
            reject('WebGL not supported');
        } else {
            gl.enable(gl.DEPTH_TEST);

            // Load vertex/fragment shader source
            const vertexShaderPromise = loadShaderSource('../shaders/vert.glsl');
            const fragmentShaderPromise = loadShaderSource('../shaders/frag.glsl');

            // Once both shaders are loaded, create and compile the shaders and the shader program
            Promise.all([vertexShaderPromise, fragmentShaderPromise])
                .then(([vertexShaderSource, fragmentShaderSource]) => {
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

                    resolve({ gl, shaderProgram });
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        }
    });
}
