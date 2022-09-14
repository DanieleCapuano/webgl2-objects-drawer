export const init_data = _init_data;


function _init_data(data) {
    return new Promise((res, err) => {
        data = data || {};
        if (!data.objects_desc_url || !data.scene_desc_url) return err();
        Promise.all([
            _get_url(data.objects_desc_url),
            _get_url(data.scene_desc_url)
        ]).then((json_files) => {
            let objects = json_files[0];
            Promise.all(Object.keys(objects)
                .map((obj_key) => _get_url(objects[obj_key]))
            )
                .then((objects_jsons) => {
                    Promise.all(
                        Object.keys(objects_jsons)
                            .map((obj_key) => {
                                let program_shaders = objects_jsons[obj_key].program_info_def.shaders;
                                return [
                                    _get_url(program_shaders.vertex.url, 'text'),
                                    _get_url(program_shaders.fragment.url, 'text')
                                ];
                            })
                            .flat()
                    ).then((shaders_code_arr) => {
                        let arr_i = 0;
                        objects_jsons.forEach((o) => {
                            const ////////////
                                { program_info_def } = o,
                                { shaders } = program_info_def;
                            shaders.vertex.code = shaders_code_arr[arr_i];
                            shaders.fragment.code = shaders_code_arr[arr_i + 1];
                            arr_i += 2;
                        });

                        res({
                            scene_desc: json_files[1],
                            objects_desc: objects_jsons
                        });
                    })

                })
        });
    });
}

function _get_url(url, type) {
    return fetch(url).then(o => o[type || 'json']());
}