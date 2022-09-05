import * as square_vert from "../shaders/square.vert.glsl";
import * as square_frag from "../shaders/square.frag.glsl";

import { create_program } from "./webgl_utils";

/*********************************************************************
 * this module is responsible for the scene initialization and management
 * from the point of view of webgl
 * so it takes vectors and matrices objects and creates webgl buffers
 * attributes uniforms etc etc to manage the actual webgl program.
 * 
 * utilities are stored into webgl_utils.js
 */

export const init_scene_webgl = _init_scene_webgl;
export const run_program = _run_program;
export const stop_program = _stop_program;


////////////////////////////////////////////////////////////
let program = null,
    running = false;

function _init_scene_webgl(canvas, gl) {
    _init_webgl_program(square_vert, square_frag);
    return program;
}

function _run_program(objects_info) {
    running = true;
    _do_run(objects_info);
}

function _stop_program() {
    running = false;
}


function _do_run(objects_info, time) {
    if (running) requestAnimationFrame(_do_run.bind(null, objects_info));
    if (time !== undefined) console.info("TIME PASSING BY", time);
    objects_info.objects_to_draw.forEach((obj) => {
        //runs the actual webgl program to draw the object
    });
}

function _init_webgl_program(vert, frag) {
    console.info("SHADERS SRC", vert, frag);

    return create_program(vert, frag);
}