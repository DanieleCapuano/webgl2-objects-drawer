import glm from 'glm-js';

export const rotate_axis = _rotate_axis;
export const rotate = _rotate;
export const translate = _translate;
export const scale = _scale;
export const create_reference_frame = _create_reference_frame;
export const lookAt = _lookAt;
export const perspective = _perspective;

//////////////////////////////////////////////////////////
//Functions implementation

function _lookAt(/*vec3*/eye_pos, /*vec3*/eye_center, /*vec3*/eye_up) {
    let gaze = eye_center.sub(eye_pos).mul(-1),
        frame = create_reference_frame(gaze, eye_up),
        minus_eye_pos = eye_pos.mul(-1),
        translate_mat = _translate(minus_eye_pos);

    return frame.mul(translate_mat);
}

/**
 * Rotates the invec_point about the arbitrary given <axis> for the amount given by <degrees>.
 * This rotation is implemented by creating a reference frame whose "z" axis is the "axis" vector and the "t" axis is 
 * a non-collinear vector dynamically computed by the function. 
 * See "Fundamentals of Computer Graphics" by Marschner & Shirley
 * @param {*} axis the axis to rotate about. It's a vec3
 * @param {*} degrees the amount to rotate, in degrees
 * @param {*} invec_point [optional] the input point to rotate. It should be a vec3
 * @returns if invec_point !== null, a vec3 which is the result of the computation, otherwise the rotation matrix
 */
function _rotate_axis(/*vec3*/axis, degrees, /*vec3*/invec_point) {
    let P = invec_point,
        A = axis,
        T = axis.clone(),
        theta = glm.radians(degrees),
        cos_theta = Math.cos(theta),
        sin_theta = Math.sin(theta),
        change_vec_to_1 = (vec) => {
            let found = false;
            return [{
                axis: 'x',
                others: ['y', 'z']
            }, {
                axis: 'y',
                others: ['x', 'z']
            }, {
                axis: 'z',
                others: ['x', 'y']
            }].reduce((v, o) => {
                if (!found && o.others.every(oth_axis => v[o.axis] <= v[oth_axis])) {
                    found = true;
                    v[o.axis] = 1.;
                }
                return v;
            }, vec);
        };

    T = change_vec_to_1(T); //create a non collinear vector T wrt A

    let REF_M = _create_reference_frame(A, T),  //mat4
        ROT_Z_M = glm.mat4(
            cos_theta, sin_theta, 0, 0,
            -sin_theta, cos_theta, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ),
        REF_M_inv = glm.inverse(REF_M),
        M = REF_M_inv.mul(
            ROT_Z_M.mul(REF_M)
        );

        return P ? (M.mul(glm.vec4(P, 1))).xyz : M;
}

function _rotate(amount_vec3, invec) {
    const
        rad = glm.radians,
        tx = rad(amount_vec3.x),
        ty = rad(amount_vec3.y),
        tz = rad(amount_vec3.z),
        sin = Math.sin,
        cos = Math.cos;

    const
        r_x = tx === 0 ? glm.mat4(1) : glm.mat4(
            1, 0, 0, 0,
            0, cos(tx), sin(tx), 0,
            0, 0, -sin(tx), cos(tx),
            0, 0, 0, 1
        ),
        r_y = ty === 0 ? glm.mat4(1) : glm.mat4(
            cos(ty), 0, -sin(ty), 0,
            0, 1, 0, 0,
            sin(ty), 0, cos(ty), 1,
            0, 0, 0, 1
        ),
        r_z = tz === 0 ? glm.mat4(1) : glm.mat4(
            cos(tz), sin(tz), 0, 0,
            -sin(tz), cos(tz), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    let M = r_x.mul(r_y).mul(r_z);

    return invec ? M.mul(invec) : M;
}

function _translate(amount_vec3, invec) {
    let translate_mat = glm.mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        amount_vec3.x, amount_vec3.y, amount_vec3.z, 1
    );

    return invec ? translate_mat.mul(invec) : translate_mat;
}

function _scale(amount_vec3, invec) {
    let s_mat = glm.mat4(
        amount_vec3.x, 0, 0, 0,
        0, amount_vec3.y, 0, 0,
        0, 0, amount_vec3.z, 0,
        0, 0, 0, 1
    );

    return invec ? s_mat.mul(invec) : s_mat;
}

function _create_reference_frame(w_dir, up_vec) {
    const ////////////
        w = glm.normalize(w_dir),
        u = glm.normalize(glm.cross(up_vec, w)),
        v = glm.cross(w, u);

    return glm.mat4(
        u.x, v.x, w.x, 0,
        u.y, v.y, w.y, 0,
        u.z, v.z, w.z, 0,
        0, 0, 0, 1
    );
}

/* 
   We want the output of the MVP transform to be into the "viewing volume", which is generally defined
   as [-1, 1]^3. But if you check the actual output from the perspective projection they're not within [-1, 1].

   BUT see https://www.khronos.org/opengl/wiki/Vertex_Post-Processing

   The viewing volume for a vertex is defined by (with vertex point defined as [P_x, P_y, P_z, P_w]):
   -P_w <= P_x <= P_w
   -P_w <= P_y <= P_w
   -P_w <= P_z <= P_w

   All P_x, P_y and P_z coords will be divided by P_w in the perspective divide stage, so the actual
   range before the viewport transform will be [-1, 1]^3
*/
function _perspective(fov_y, aspect_ratio, near, far) {
    const ////////////////// 
        half_theta = glm.radians(fov_y) / 2,
        tan_fov = Math.tan(half_theta),
        n = Math.abs(near),
        f = Math.abs(far),
        t = tan_fov * n,                //t = "top". This works because sin(half_theta) = t / hyp and cos(half_theta) = n / hyp ==> tan(half_theta) = (t / hyp) / (n / hyp) = t / n
        b = -t,                         //b = "bottom"
        r = aspect_ratio * t,           //aspect_ratio = w / h and we can see that (w / h = r / t) ==> because pixels are assumed to be squared
        l = -r;

    return glm.mat4(
        (2 * n) / (r - l), 0, 0, 0,
        0, (2 * n) / (t - b), 0, 0,
        (l + r) / (r - l), (b + t) / (t - b), (f + n) / (n - f), -1,
        0, 0, (2 * f * n) / (n - f), 0
    );
}