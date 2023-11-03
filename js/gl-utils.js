// Compile, link, and load shaders
function makeProgram(gl, vertexShaderSource, fragmentShaderSource) {
    
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

    return shaderProgram;
}

// Create a buffer object and load data into it
function makeBuffer(gl, data, bufferType) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, data, gl.STATIC_DRAW);
}

// Load vertex and index data from an .obj file
async function loadOBJ(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch .obj file: ${response.status} ${response.statusText}`);
        }

        const objData = await response.text();
        const vertices = [];
        const indices = [];
        const lines = objData.split('\n');
        for (const line of lines) {
            const parts = line.trim().split(' ');
            if (parts[0] === 'v') {
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);
                vertices.push(x, y, z);
            } else if (parts[0] === 'f') {
                const a = parseInt(parts[1]) - 1; // Subtract 1 to convert to 0-based index
                const b = parseInt(parts[2]) - 1;
                const c = parseInt(parts[3]) - 1;
                indices.push(a, b, c);
            }
        }

        return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
    } catch (error) {
        throw error;
    }
};