

var gui = new dat.GUI({
    name: "City Options"
});


var params = {
    selected_building: "empty",

    light_angle: (Math.PI / 2) + 0.2,
    light_increase_speed: 0,
    height_threshold: 32,
    day: function () {
        params.light_angle = 1.8;
    },
    night: function () {
        params.light_angle = 4.4;
    },

    camera_rotate_speed: 0,

    walk_path_steps: genSteps,
    generate: function () {
        GenerateCity(genSteps);
    },

    firstPerson: function () {
        controls.reset();

        firstPersonMode = !firstPersonMode;
        keyboardControls.enabled = !keyboardControls.enabled;

        if (!firstPersonMode) {
            var Pos = new THREE.Vector3(-360, 700, 360);
            camera.position.set(Pos.x, Pos.y, Pos.z);
        } else {
            var Pos = new THREE.Vector3(0, 4, 13);
            camera.position.set(Pos.x, Pos.y, Pos.z);
            camera.rotation.y = 90 * Math.PI / 180;
            keyboardControls.getObject().position.set(0, 4, 13);
        }

        controls.update();
        camera.updateProjectionMatrix();
    },

    export : function () {
        const now = new Date().toISOString();
        const filename = 'City_JSON_' + now + '.json';
        const file = scene.toJSON();
        const jsonBlob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    generate1: function () { //match the skybox
        scene.background = textureCube1;
    },
    generate2: function () {
        scene.background = textureCube2;
    },
    generate5: function () {
        scene.background = textureCube5;
    },
    generate7: function () {
        scene.background = textureCube7;
    },
    generate8: function () {
        scene.background = textureCube8;
    },
    generate9: function () {
        scene.background = textureCube9;
    },

    generate11: function () {
        textureT(1);
    },
    generate22: function () {
        textureT(2);
    },
    generate33: function () {
        textureT(3);
    },
    generate44: function () {
        textureT(4);
    },
    generate55: function () {
        textureT(5);
    },
    generate66: function () {
        textureT(6);
    },
    generate77: function () {
        textureT(7);
    },
    generate88: function () {
        textureT(8);
    },
    generate99: function () {
        textureT(9);
    },
}


const NUM_OF_BUILDINGS = 87;
for (let i = 1; i <= NUM_OF_BUILDINGS; i++) {
    params[`spawn${i}`] = function () {
        // console.log(`Spawn ${i}`);
        AddBuilding(Math.random() % (NUM_OF_BUILDINGS * 100), Math.random() % (NUM_OF_BUILDINGS * 100), 0, 0, 1, i.toString())
    }
}

var heightFolder = gui.addFolder('Height Thresholds');
heightFolder.open();

var heightController = heightFolder.add(params, 'height_threshold', 0, 100).listen();;
heightController.name("Height Story Limit");
heightController.onChange(function (val) {
    updateHeight(val);
});


function updateHeight(val) {
    // if (val >= 1000) {
    //     val = 0;
    // }
    params.height_threshold = val;

    updateThreshold(val * 10)
}


function updateThreshold(val) {
    if (val == 1000) {
        for (var i = 0; i < scene.children.length; i++) {
            if (i > 4 && scene.children[i].type == "Mesh") {
                const selectedObject = scene.children[i];
                scene.children[i].userData = {
                    OGColor: scene.children[i].material.color,
                };

                // selectedObject.material.color = paramcolor.color;
                // selectedObjectColor = [paramcolor.color[0], paramcolor.color[1], paramcolor.color[2]];
                // selectedObject.material.color = new THREE.Color(selectedObjectColor[0] / 255, selectedObjectColor[1] / 255, selectedObjectColor[2] / 255);

                scene.children[i].material.color = new THREE.Color(215 / 255, 16 / 255, 63 / 255);
                scene.children[i].visible = true;
            }
        }
        return;
    }
    for (var i = 0; i < scene.children.length; i++) {
        // console.log(scene.children[i].userData)
        // const ogCOL = scene.children[i].userData.OGColor;
        // console.log(ogCOL)
        // scene.children[i].material.color = new THREE.Color(ogCOL[0] / 255, ogCOL[1] / 255, ogCOL[2] / 255);
        if (scene.children[i].type == "Mesh") {
            // console.log(scene.children[i].position.y * 1000, val)
            // const height = Math.abs()
            if (scene.children[i].position.y * 1000 > val) {
                scene.children[i].visible = false;
            } else {
                scene.children[i].visible = true;
            }
        }
    }
}



// var heightController = heightFolder.add(params, 'height_threshold', 0, 100, 1).listen();;





var lightFolder = gui.addFolder('Light Options');
lightFolder.open();

var lightController = lightFolder.add(params, 'light_angle', 0, Math.PI * 2).listen();;
lightController.name("Angle");
lightController.onChange(function (val) {
    updateLight(val);
});

// Update the position, intensity, and colour of the light sources based on the angle given
function updateLight(val) {
    if (val >= Math.PI * 2) {
        val = 0;
    }

    params.light_angle = val;
    light.position.y = Math.sin(val) * 1000;
    light.position.x = Math.cos(val) * 1000;
    var lightVal = Math.abs(Math.sin(val));
    light.color = new THREE.Color(1, lightVal, lightVal);

    if (val >= Math.PI) {
        light.intensity = 0;
        ambientLight.intensity = 0.1;
    } else {
        light.intensity = 0.25 + 0.25 * lightVal;
        ambientLight.intensity = 0.1 + 0.2 * lightVal;
    }
}

var lightIncreaseSpeedController = lightFolder.add(params, 'light_increase_speed', 0, 10, 0.1).listen();;
lightIncreaseSpeedController.name("Light Increase Speed");
lightIncreaseSpeedController.onChange(function (val) {
    params.light_increase_speed = val;
});

window.setInterval(function () {
    updateLight(params.light_angle + (params.light_increase_speed / 100));
}, 30);

var ctrlBtnDay = lightFolder.add(params, 'day');
ctrlBtnDay.name("Set Time to Day");

var ctrlBtnNight = lightFolder.add(params, 'night');
ctrlBtnNight.name("Set Time to Night");


var cameraFolder = gui.addFolder('Camera Options');
cameraFolder.open();

var cameraSpeedController = cameraFolder.add(params, 'camera_rotate_speed', 0, 5, 0.1);
cameraSpeedController.name("Camera Rotation Speed");
cameraSpeedController.onChange(function (val) {
    controls.autoRotateSpeed = val;
});

var spawnOptions = gui.addFolder('Spawn Options');
spawnOptions.open();

var categoryFolder = spawnOptions.addFolder('Spawn Buildings');

for (let i = 1; i <= 24; i++) {
    var spawnBtn = categoryFolder.add(params, `spawn${i}`);
    spawnBtn.name(`Building ${i}`);
}

var carFolder = spawnOptions.addFolder('Spawn Cars');

for (let i = 25; i <= 26; i++) {
    var spawnBtn = carFolder.add(params, `spawn${i}`);
    spawnBtn.name(`Cars ${i - 24}`);
}

var bridgeFolder = spawnOptions.addFolder('Spawn Roads/Bridges');
for (let i = 27; i <= 87; i++) {
    var spawnBtn = bridgeFolder.add(params, `spawn${i}`);
    spawnBtn.name(`Roads/Bridges ${i - 26}`);
}

var generationFolder = gui.addFolder('Generation Options');
generationFolder.open();

var genStepsController = generationFolder.add(params, 'walk_path_steps', 1, 50, 1);
genStepsController.name("Generation Steps");
genStepsController.onChange(function (val) {
    genSteps = val;
});

var genBtn = generationFolder.add(params, 'generate');
genBtn.name("Generate New City");




//Controller settings, for example whether or not to use first person controls
var controlsFolder = gui.addFolder('Control Options');
controlsFolder.open();

var ctrlBtnFP = controlsFolder.add(params, 'firstPerson');
ctrlBtnFP.name("First Person Mode");


//Skybox
var generationFolder1 = gui.addFolder('Skybox');
generationFolder1.close();

var genBtn1 = generationFolder1.add(params, 'generate1');
genBtn1.name("Sky1");

var genBtn2 = generationFolder1.add(params, 'generate2');
genBtn2.name("Sky2");

var genBtn5 = generationFolder1.add(params, 'generate5');
genBtn5.name("Sky3");

var genBtn7 = generationFolder1.add(params, 'generate7');
genBtn7.name("Sky4");

var genBtn8 = generationFolder1.add(params, 'generate8');
genBtn8.name("Sky5");

var genBtn9 = generationFolder1.add(params, 'generate9');
genBtn9.name("Sky6");


//ground
var generationFolder11 = gui.addFolder('Ground Texture');
generationFolder11.close();

var genBtn11 = generationFolder11.add(params, 'generate11');
genBtn11.name("Ground1");

var genBtn22 = generationFolder11.add(params, 'generate22');
genBtn22.name("Ground2");

var genBtn33 = generationFolder11.add(params, 'generate33');
genBtn33.name("Ground3");

var genBtn44 = generationFolder11.add(params, 'generate44');
genBtn44.name("Ground4");

var genBtn55 = generationFolder11.add(params, 'generate55');
genBtn55.name("Ground5");

var genBtn66 = generationFolder11.add(params, 'generate66');
genBtn66.name("Ground6");

var genBtn77 = generationFolder11.add(params, 'generate77');
genBtn77.name("Ground7");

var genBtn88 = generationFolder11.add(params, 'generate88');
genBtn88.name("Ground8");

var genBtn99 = generationFolder11.add(params, 'generate99');
genBtn99.name("Ground9");


var buildingFolder = gui.addFolder('Building Options');
buildingFolder.open();

var colourPicker;
var scalePicker;
var pollutionLevel;
var bodyScaleLevel;

var exportFolder = gui.addFolder('Export Options');
exportFolder.open();

// var importBtn = exportFolder.add(params, 'import');
// importBtn.name("Import City");

var exportBtn = exportFolder.add(params, 'export');
exportBtn.name("Export City");


function selectCheck() {
    if (isSelected == true) {
                var paramcolor = {
            color: selectedObjectColor
        };
        var paramscale = {
            scale: selectedObjectScale
        };

        colourPicker = buildingFolder.addColor(paramcolor, 'color').onChange(function () {
            // console.log("BEFORE COLOR", selectedObject.material.color)
            // selectedObject.material.color = paramcolor.color;
            selectedObjectColor = [paramcolor.color[0], paramcolor.color[1], paramcolor.color[2]];
            selectedObject.material.color = new THREE.Color(selectedObjectColor[0] / 255, selectedObjectColor[1] / 255, selectedObjectColor[2] / 255);
            // console.log("AFTER COLOR", selectedObject.material.color)
        });

        colourPicker.name('Building Colour');

        scalePicker = buildingFolder.add(paramscale, 'scale', 0, 100).onChange(function () {
            selectedObject.scale.y = paramscale.scale;
        });
        scalePicker.name("Building Height Scale");

        pollutionLevel = buildingFolder.add(paramscale, 'scale', 0, 100).onChange(function () {
            selectedObject.scale.y = paramscale.scale;
        });
        pollutionLevel.name('Pollution Level')

        bodyScaleLevel = buildingFolder.add(paramscale, 'scale', 0, 100).onChange(function () {
            selectedObject.scale.x = paramscale.scale;
            selectedObject.scale.y = paramscale.scale;
            selectedObject.scale.z = paramscale.scale;
        });
        bodyScaleLevel.name('Body Scale Level')

    }
}

function textureT(textureMode) {
    if (textureMode == 1) {
        baseMaterial.map = TextureL1;
    } else if (textureMode == 2) {
        baseMaterial.map = TextureL2;
    } else if (textureMode == 3) {
        baseMaterial.map = TextureL3;
    } else if (textureMode == 4) {
        baseMaterial.map = TextureL4;
    } else if (textureMode == 5) {
        baseMaterial.map = TextureL5;
    } else if (textureMode == 6) {
        baseMaterial.map = TextureL6;
    } else if (textureMode == 7) {
        baseMaterial.map = TextureL7;
    } else if (textureMode == 8) {
        baseMaterial.map = TextureL8;
    } else if (textureMode == 9) {
        baseMaterial.map = TextureL9;
    }
}

let orgData;

// function to switch themes for pollution 
document.getElementsByClassName("pTheme")[0].addEventListener("click", function () {
    for (var i = 0; i < scene.children.length; i++) {
        if (i > 4 && scene.children[i].type == "Mesh") {
            const selectedObject = scene.children[i];
            scene.children[i].userData = {
                OGColor: scene.children[i].material.color,
            };

            // selectedObject.material.color = paramcolor.color;
            // selectedObjectColor = [paramcolor.color[0], paramcolor.color[1], paramcolor.color[2]];
            // selectedObject.material.color = new THREE.Color(selectedObjectColor[0] / 255, selectedObjectColor[1] / 255, selectedObjectColor[2] / 255);

            scene.children[i].material.color = new THREE.Color(215 / 255, 16 / 255, 63 / 255);
            scene.children[i].visible = true;
        }
    }
})

// function to switch themes for energy
document.getElementsByClassName("eTheme")[0].addEventListener("click", function () {
    for (var i = 0; i < scene.children.length; i++) {
        if (i > 4 && scene.children[i].type == "Mesh") {
            const selectedObject = scene.children[i];
            scene.children[i].userData = {
                OGColor: scene.children[i].material.color,
            };

            // selectedObject.material.color = paramcolor.color;
            // selectedObjectColor = [paramcolor.color[0], paramcolor.color[1], paramcolor.color[2]];
            // selectedObject.material.color = new THREE.Color(selectedObjectColor[0] / 255, selectedObjectColor[1] / 255, selectedObjectColor[2] / 255);

            scene.children[i].material.color = new THREE.Color(215 / 255, 16 / 255, 63 / 255);
            scene.children[i].visible = true;
        }
    }
})

// function to switch back to normal
document.getElementsByClassName("normal")[0].addEventListener("click", function () {
    // Retrieve orgData from localStorage
    for (var i = 0; i < deserializedScene.children.length; i++) {
        scene.children[i].material.color = deserializedScene.children[i].material.color;
        scene.children[i].visible = true;
    }
})
