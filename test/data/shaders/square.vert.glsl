#version 300 es

precision mediump float;

in vec3 a_position;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main() {
    gl_Position = u_projection * u_modelview * vec4(a_position, 1.);
}