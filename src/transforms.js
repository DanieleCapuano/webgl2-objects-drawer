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

function _lookAt(eye_pos, eye_center, eye_up) {
    let gaze = eye_pos.sub(eye_center),
        frame = create_reference_frame(gaze, eye_up),
        minus_eye_pos = eye_pos.mul(-1),
        translate_mat = _translate(minus_eye_pos);

    return frame.mul(translate_mat);
}

function _rotate_axis(invec, axis, degrees) {
    //rodriguez, NON quaterion stuff
    let P = invec,
        A = axis,
        ID = glm.mat4(1),
        theta = glm.radians(degrees),
        cos_theta = Math.cos(theta),
        sin_theta = Math.sin(theta),
        one_minus_cos_theta = 1 - cos_theta;

    return (
        ID.mul(P.mul(cos_theta)).add(
            glm.mat4(
                0, A.z, -A.y, 0,
                -A.z, 0, A.x, 0,
                A.y, -A.x, 0, 0,
                0, 0, 0, 1
            ).mul(P.mul(sin_theta)).add(
                glm.mat4(
                    A.x * A.x, A.x * A.y, A.x * A.z, 0,
                    A.x * A.y, A.y * A.y, A.y * A.z, 0,
                    A.x * A.z, A.y * A.z, A.z * A.x, 1
                ).mul(P.mul(one_minus_cos_theta))
            )
        )
    );
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
        r_x = glm.mat4(
            1, 0, 0, 0,
            0, cos(tx), sin(tx), 0,
            0, 0, -sin(tx), cos(tx),
            0, 0, 0, 1
        ),
        r_y = glm.mat4(
            cos(ty), 0, -sin(ty), 0,
            0, 1, 0, 0,
            sin(ty), 0, cos(ty), 1,
            0, 0, 0, 1
        ),
        r_z = glm.mat4(
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

function _create_reference_frame(eye_dir, up_vec) {
    const ////////////
        w = glm.normalize(eye_dir),
        u = glm.normalize(glm.cross(up_vec, w)),
        v = glm.cross(w, u);

    return glm.mat4(
        u.x, v.x, w.x, 0,
        u.y, v.y, w.y, 0,
        u.z, v.z, w.z, 0,
        0, 0, 0, 1
    );
}


function _perspective(fov_y, aspect_ratio, near, far) {
    const ////////////////// 
        half_theta = glm.radians(fov_y) / 2,
        tan_fov = Math.tan(half_theta),
        n = Math.abs(near),
        f = Math.abs(far),
        t = tan_fov * Math.abs(near),   //t = "top". This works if cos(half_theta) = near and sin(half_theta) = top ==> triangle's hypotenuse = 1
        b = -t,                         //b = "bottom"
        r = aspect_ratio * t,           //(w / h = r / t) ==> because pixels are assumed to be squared
        l = -r;

    return glm.mat4(
        (2 * n) / (r - l), 0, 0, 0,
        0, (2 * n) / (t - b), 0, 0,
        (l + r) / (r - l), (b + t) / (t - b), (f + n) / (n - f), -1,
        0, 0, (2 * f * n) / (n - f), 0
    );
}