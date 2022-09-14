export const create_program = _create_program;
export const init_vao = _init_vao;
export const buffer_data = _buffer_data;
export const set_uniforms = _set_uniforms;


function _create_program(gl, vert, frag) {
    const program = gl.createProgram();

    // Attach pre-existing shaders
    let vertexShader = _createShader(gl, vert, gl.VERTEX_SHADER);
    gl.attachShader(program, vertexShader);

    let fragmentShader = _createShader(gl, frag, gl.FRAGMENT_SHADER);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw `Could not compile WebGL program. \n\n${info}`;
    }

    return program;
}

function _createShader(gl, sourceCode, type) {
    // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        throw `Could not compile WebGL program. \n\n${info}`;
    }
    return shader;
}

function _init_vao(gl, program_info) {
    const { program, attributes, uniforms } = program_info;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buffer = gl.createBuffer(),
        buffer_bind = gl.ARRAY_BUFFER;
    gl.bindBuffer(buffer_bind, buffer);

    Object.keys(attributes).forEach((attr_name) => {
        let attr_desc = attributes[attr_name];
        let location = gl.getAttribLocation(program, attr_desc.name);
        gl.vertexAttribPointer.apply(gl, [location].concat(attr_desc.opts));
        gl.enableVertexAttribArray(location);

        Object.assign(program_info.attributes[attr_desc.name], {
            location,
            buffer,
            buffer_bind
        });
    });

    Object.keys(uniforms).forEach((uniform_name) => {
        Object.assign(
            program_info.uniforms[uniform_name],
            {
                location: gl.getUniformLocation(program, uniform_name)
            }
        );
    });

    gl.bindVertexArray(null);
    gl.bindBuffer(buffer_bind, null);

    program_info.vao = vao;
    return program_info;
}

function _buffer_data(gl, attrs_values, program_info) {
    gl.bindVertexArray(program_info.vao);
    Object.keys(program_info.attributes).forEach((attr_name) => {
        const ///////////////////////
            { buffer, buffer_bind } = program_info.attributes[attr_name],
            val = attrs_values[attr_name];

        gl.bindBuffer(buffer_bind, buffer);
        gl.bufferData(buffer_bind, val, gl.STATIC_DRAW, 0);
        gl.bindBuffer(buffer_bind, null);
    });
    gl.bindVertexArray(null);
}

function _set_uniforms(gl, uniforms_values, object_info) {
    const { program_info } = object_info;

    Object.keys(program_info.uniforms).forEach((uniform_name) => {
        const /////////////////////////
            uniform_desc = program_info.uniforms[uniform_name],
            { opts, location } = uniform_desc;

        let val = uniforms_values[uniform_name],
            args = opts.fn.indexOf('Matrix') === -1 ? [location, val] : [location, false, val];

        gl['uniform' + opts.fn].apply(gl, args);
    });
}