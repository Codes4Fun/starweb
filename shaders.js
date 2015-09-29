
function Shader(gl, vsh, fsh, attributes, uniforms)
{
	// create vertex shader
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, document.getElementById(vsh).text);
	gl.compileShader(vs)
	if (gl.getShaderParameter(vs, gl.COMPILE_STATUS))
	{
		log.innerHTML += 'vertex shader compiled successfully<br>';
	}
	else
	{
		log.innerHTML += gl.getShaderInfoLog(fs) + '<br>';
	}

	// create fragment shader
	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, document.getElementById(fsh).text);
	gl.compileShader(fs);
	if (gl.getShaderParameter(fs, gl.COMPILE_STATUS))
	{
		log.innerHTML += 'fragment shader compiled successfully<br>';
	}
	else
	{
		log.innerHTML += gl.getShaderInfoLog(fs) + '<br>';
	}

	// create the shader program
	var sp = gl.createProgram();
	gl.attachShader(sp, vs);
	gl.attachShader(sp, fs);
	gl.linkProgram(sp);
	if (gl.getProgramParameter(sp, gl.LINK_STATUS))
	{
		log.innerHTML += 'program linked successfully<br>';
	}
	else
	{
		log.innerHTML += gl.getProgramInfoLog(sp) + '<br>';
	}

	// get shader attribute(s)
	for (var i = 0; i < attributes.length; i++)
	{
		var name = attributes[i];
		this[name] = gl.getAttribLocation(sp, name);
	}

	// get shader uniform(s)
	for (var i = 0; i < uniforms.length; i++)
	{
		var name = uniforms[i];
		this[name] = gl.getUniformLocation(sp, name);
	}

	this.sp = sp;
}

