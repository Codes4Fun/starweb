
function TextureShader(gl)
{
	// create vertex shader
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, document.getElementById('vshTexture').text);
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
	gl.shaderSource(fs, document.getElementById('fshTexture').text);
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

	this.sp = sp;
	// get shader parameter(s)
	this.pos = gl.getAttribLocation(sp, 'pos');
	this.texCoord = gl.getAttribLocation(sp, 'texCoord');
	this.matrix = gl.getUniformLocation(sp, 'matrix');
	this.tex = gl.getUniformLocation(sp, 'tex');
}

function ColorVertexShader(gl)
{
	// create vertex shader
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, document.getElementById('vshColorVertex').text);
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
	gl.shaderSource(fs, document.getElementById('fshColorVertex').text);
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

	this.sp = sp;
	// get shader parameter(s)
	this.pos = gl.getAttribLocation(sp, 'pos');
	this.color = gl.getAttribLocation(sp, 'color');
	this.matrix = gl.getUniformLocation(sp, 'matrix');
}

function TCVShader(gl)
{
	// create vertex shader
	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, document.getElementById('vshTCV').text);
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
	gl.shaderSource(fs, document.getElementById('fshTCV').text);
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

	this.sp = sp;
	// get shader parameter(s)
	this.pos = gl.getAttribLocation(sp, 'pos');
	this.color = gl.getAttribLocation(sp, 'color');
	this.texCoord = gl.getAttribLocation(sp, 'texCoord');
	this.matrix = gl.getUniformLocation(sp, 'matrix');
	this.tex = gl.getUniformLocation(sp, 'tex');
}

