THREE.ExtendedMaterial = function( renderer, material, uniforms, hooks, debug ) {

    if(debug) console.log('EXTENDED_MATERIAL')
    var changed = false;

    material.onBeforeCompile = function ( shader, renderer ) {

        if( Boolean( changed ) === true )return;
        changed = true;

        
        var vertexShader = shader.vertexShader;
        var fragmentShader = shader.fragmentShader;

        if( uniforms !== undefined ){

            var uniformName = '';
            var uniformDeclaration = '';
            
            uniforms.forEach(function( uniform ){

                //retrieve the name of the uniform
                for( var key in uniform )uniformName = key;

                //retrieve the type of the uniform
                switch( uniform[ uniformName ].type ){
                    case "f":
                        uniformDeclaration += 'uniform float '+uniformName+';';
                        break;
                    case "v2":
                        uniformDeclaration += 'uniform vec2 '+uniformName+';';
                        break;
                    case "v3":
                        uniformDeclaration += 'uniform vec3 '+uniformName+';';
                        break;
                    case "v4":
                        uniformDeclaration += 'uniform vec4 '+uniformName+';';
                        break;
                }
                uniformDeclaration += "\n";

                //merge this uniforms to the existing ones
                shader.uniforms = THREE.UniformsUtils.merge([shader.uniforms, uniform ]);

            });

            //appends the uniforms declarations to the shader
            vertexShader = uniformDeclaration + shader.vertexShader;

            //creates a shortcut to the uniforms on the material for later update
            this.uniforms = shader.uniforms;
        }

        //hack the shaders' text content
        if( hooks !== undefined ){

            hooks.forEach(function( hook ){

                var needle = hook.needle;

                var vertex = hook.vertex;
                if( vertex !== undefined && vertex !== '' ){
                    vertexShader = vertexShader.replace( needle, vertex );
                }

                var fragment = hook.fragment;
                if( fragment !== undefined && fragment !== '' ){
                    fragmentShader = fragmentShader.replace( needle, fragment );
                }
            } );
        }

        shader.vertexShader = vertexShader;
        shader.fragmentShader = fragmentShader;

        if( Boolean(debug)===true ){
            console.log( 'vertexShader:' );
            console.log( vertexShader );
            console.log( 'fragmentShader:' );
            console.log( fragmentShader );
        }
    };

    return material;

};
