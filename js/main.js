document.addEventListener("DOMContentLoaded", function () {
    
    // Get references to HTML elements
    const canvas = document.getElementById('canvas');

    // Initialize WebGL
    const gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL is not supported in your browser.');
    }

    gl.enable(gl.DEPTH_TEST);

    // Vertex and fragment shader code
    const vertexShaderSource = `
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

    const fragmentShaderSource = `
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

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Load the .obj file
    loadOBJ("./obj/cow.obj")
        .then(({ vertices, indices }) => {
            // Create buffer objects
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            // Specify shader attributes and uniforms
            const coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
            const modelViewProjection = gl.getUniformLocation(shaderProgram, 'modelViewProjection');
            const color = gl.getUniformLocation(shaderProgram, 'color');

            gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(coordinates);

            // Create the model matrix here
            const modelMatrix = mat4.create();

            // Define variables for rotational velocity
            let rotationVelocityX = 0;
            let rotationVelocityY = 0;

            // Define variables for damping (controls how quickly rotation slows down)
            const damping = 0.99; // Adjust as needed

            // Event listener to update rotation and inertia
            canvas.addEventListener('mousemove', (event) => {
                // Calculate the rotation based on mouse movement
                const rotationX = ((event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 0.1;
                const rotationY = ((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 0.1;

                // Update the rotational velocity based on the mouse movement
                rotationVelocityX = rotationX;
                rotationVelocityY = rotationY;
            });

            // Function to resize the canvas and update projection matrix
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);

                // Recreate the projection matrix with the new aspect ratio
                const projectionMatrix = mat4.create();
                mat4.perspective(projectionMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);

                // Update the projection matrix in the shader
                gl.uniformMatrix4fv(modelViewProjection, false, projectionMatrix);
            }

            window.addEventListener('resize', resizeCanvas);

            // Function to apply inertia and render the model
            function render() {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Apply rotational velocity
                mat4.rotate(modelMatrix, modelMatrix, rotationVelocityX, [1, 0, 0]);
                mat4.rotate(modelMatrix, modelMatrix, rotationVelocityY, [0, 1, 0]);

                // Gradually decrease the rotational velocity (inertia)
                rotationVelocityX *= damping;
                rotationVelocityY *= damping;

                // Define view and projection matrices
                const viewMatrix = mat4.create();
                const projectionMatrix = mat4.create();

                // Set up view and projection matrices (you can customize these)
                mat4.lookAt(viewMatrix, [6, 6, 6], [0, 0, 0], [0, 1, 0]);
                mat4.perspective(projectionMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);

                // Combine matrices to get the model-view-projection matrix
                const modelViewProjectionMatrix = mat4.create();
                mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);
                mat4.multiply(modelViewProjectionMatrix, modelViewProjectionMatrix, modelMatrix);

                gl.uniformMatrix4fv(modelViewProjection, false, modelViewProjectionMatrix);

                // Calculate color based on model orientation
                const rotationMatrix = mat4.create();
                mat4.copy(rotationMatrix, modelMatrix);

                // Extract the orientation information (rotation) from the modelMatrix
                const orientation = mat4.getRotation(vec3.create(), rotationMatrix);

                // Convert orientation angles to color values
                const colorValues = [
                    (orientation[0] + 1) / 2, // Red component
                    (orientation[1] + 1) / 2, // Green component
                    (orientation[2] + 1) / 2, // Blue component
                    1.0 // Alpha (fully opaque)
                ];

                // Set model color based on orientation
                gl.uniform4fv(color, colorValues);

                // Draw the model
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

                requestAnimationFrame(render);
            }

            resizeCanvas(); // Call initially to set up the correct canvas size
            render(); // Start rendering
        })
        .catch(error => {
            console.error(error);
        });
});
