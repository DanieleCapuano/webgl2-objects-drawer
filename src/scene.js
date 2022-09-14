import glm from "glm-js";
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

function _init_scene(in_canvas, desc) {
    canvas = in_canvas;
    if (!canvas || !desc) return;

    const {scene_desc, objects_desc} = desc;

    gl = canvas.getContext('webgl2');
    console.info("Context and input data");
    console.info(gl, canvas, objects_desc, scene_desc);

    let input_objects = objects_desc;
    objects_info = _init_scene_struct(input_objects, scene_desc);
    console.info("SCENE DATA", objects_info);

    init_scene_webgl(gl, objects_info);
}

function _run() {
    console.info("RUNNING START");
    run_program(gl, objects_info);
}

function _stop() {
    console.info("STOP RUNNING");
    stop_program();
}


function _init_scene_struct(objects, scene_desc) {
    let obj_list = _init_objects(objects, scene_desc);

    const OI = {
        objects_to_draw: obj_list,
        projection_matrix: T.perspective(90, canvas.width / canvas.height, .1, 99)
    }

    _print_debug(OI);

    return OI;
}

function _init_objects(objects, scene_desc) {
    const C = scene_desc.camera,
        Mlookat = T.lookAt(glm.vec3(C.position), glm.vec3(C.center), glm.vec3(C.up));

    return objects.map((obj_def) => {
        const { coords_dim, coordinates_def } = obj_def;
        return Object.assign(obj_def, {
            ////////////////////
            //Coordinates put in a single Float32Array
            coords: coordinates_def
                .reduce((ab, coord_buf, i) => {
                    let icurr = i * coords_dim,
                        k = 0;
                    for (let j = icurr; j < icurr + coords_dim; j++) {
                        ab[j] = coord_buf[k];
                        k++;
                    }
                    return ab;
                }, new Float32Array(coordinates_def.length * coords_dim)),

            ////////////////////
            //model_view computed multiplying up all the transformations in the object description file
            model_view_matrix: Mlookat.mul(
                Object.keys(scene_desc)
                    .filter((scene_desc_key) => scene_desc_key === obj_def.id)
                    .map((scene_desc_key) => scene_desc[scene_desc_key].transforms || [])
                    .flat()
                    .reduce((M, transform_desc) => {
                        let transform_fn = T[transform_desc.type] || (() => glm.mat4(1));
                        return M.mul(transform_fn(glm.vec3(transform_desc.amount)));

                    }, glm.mat4(1))
            )
        })
    });
}

//this prints the final results of the graphics pipeline computation, i.e. what arrives to the fragment shader
function _print_debug(OI) {
    let f32a = new Float32Array(24),
        a = [],
        obj = OI.objects_to_draw[0],
        coords = obj.coords,
        j = 0;
    for (let i = 0; i < 18; i += 3) {
        // console.info("IT", i, coords[i], coords[i + 1], coords[i + 2]);
        let mvp = OI.projection_matrix.mul(
            obj.model_view_matrix
        );
        let transf_vec = mvp.mul(
            glm.vec4(coords[i], coords[i + 1], coords[i + 2], 1.)
        ), tr_elems = transf_vec.elements;

        f32a[j] = tr_elems[0];
        f32a[j + 1] = tr_elems[1];
        f32a[j + 2] = tr_elems[2];
        f32a[j + 3] = tr_elems[3];

        a.push(glm.vec4(
            tr_elems[0] / tr_elems[3],
            tr_elems[1] / tr_elems[3],
            tr_elems[2] / tr_elems[3],
            1.
        ));

        j += 4;
    }
    let vl = 0,
        vr = canvas.width,
        vt = canvas.height,
        vb = 0,
        viewport_mat = glm.mat4(
            (vr - vl) / 2, 0, 0, 0,
            0, (vt - vb) / 2, 0, 0,
            0, 0, 1 / 2, 0,
            (vr + vl) / 2, (vt + vb) / 2, 1 / 2, 1
        );
    a = a.map(vec => viewport_mat.mul(vec));
    console.info("TRANSFORMED ARRS", f32a, a);
}