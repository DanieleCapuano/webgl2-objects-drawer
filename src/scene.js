import glm from "glm-js";

import * as square_mod from "../data/square.json";
import * as scene_mod from "../data/scene.json";
import * as T from './transforms';

import { init_scene_webgl, run_program, stop_program } from "./webgl_scene";

/*********************************************************************
 * this module is responsible for the scene initialization
 * for what concerns the objects and scene structures and math operations
 * it creates vectors and matrices to be passed to the webgl_scene
 */

export const init_scene = _init_scene;
export const run_scene = _run;
export const stop_scene = _stop;


let ////////////////////////////////////////
    canvas,
    gl,
    objects_info = [];

const square = square_mod.default || square_mod;    //1 square object
const scene = scene_mod.default || scene_mod;       //contains camera position, fov, etc

function _init_scene(in_canvas) {
    canvas = in_canvas;
    if (!canvas) return;

    gl = canvas.getContext('webgl2');
    console.info("Context and input data");
    console.info(gl, square, scene);

    let input_objects = [square];
    objects_info = _init_scene_struct(input_objects, scene);
    console.info("SCENE DATA", objects_info);

    init_scene_webgl(canvas, gl);
}

function _run() {
    console.info("RUNNING START");
    run_program(objects_info);
}

function _stop() {
    console.info("STOP RUNNING");
    stop_program();
}


function _init_scene_struct(objects, scene_desc) {
    let obj_list = _init_objects(objects);

    console.info("TRANSLATE");
    let v = glm.vec4(1),
        v_t = T.scale(v, glm.vec3(.5)),
        v_tt = T.translate(v_t, glm.vec3(.5));
    console.info("SCALED 1", v_t, v_tt);

    let model_view = glm.mat4(1);
    let projection = glm.mat4(1);

    return {
        objects_to_draw: obj_list,
        model_view_matrix: model_view,
        projection_matrix: projection
    }
}

function _init_objects(objects) {
    return objects.map((obj_def) => {
        return obj_def.coordinates.map((coords_array) => {
            let coords = glm.vec3(coords_array);
            return glm.vec4(coords, 1.);
        });
    });
}