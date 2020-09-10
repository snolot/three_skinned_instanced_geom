
ShaderChunks.QuaternionRotation = `
	vec3 rotateVector(vec4 q, vec3 v) {
	    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
	}

	vec4 quatFromAxisAngle(vec3 axis, float angle) {
	    float halfAngle = angle * 0.5;
	    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
	}
`

ShaderChunks.QuaternionSlerp = `
	vec4 quatSlerp(vec4 q0, vec4 q1, float t) {
	    
	    float s = 1.0 - t;
	    float c = dot(q0, q1);
	    float dir = -1.0; //c >= 0.0 ? 1.0 : -1.0;
	    float sqrSn = 1.0 - c * c;

	    if (sqrSn > 2.220446049250313e-16) {
	        float sn = sqrt(sqrSn);
	        float len = atan(sn, c * dir);

	        s = sin(s * len) / sn;
	        t = sin(t * len) / sn;
	    }

	    float tDir = t * dir;

	    return normalize(q0 * s + q1 * tDir);
	}
`

ShaderChunks.CatmullRomSpline = `
	vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t, vec2 c) {
	    vec4 v0 = (p2 - p0) * c.x;
	    vec4 v1 = (p3 - p1) * c.y;
	    float t2 = t * t;
	    float t3 = t * t * t;

	    return vec4((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
	}

	vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t) {
	    return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
	}

	vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t, vec2 c) {
	    vec3 v0 = (p2 - p0) * c.x;
	    vec3 v1 = (p3 - p1) * c.y;
	    float t2 = t * t;
	    float t3 = t * t * t;

	    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
	}

	vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
	    return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
	}

	vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t, vec2 c) {
	    vec2 v0 = (p2 - p0) * c.x;
	    vec2 v1 = (p3 - p1) * c.y;
	    float t2 = t * t;
	    float t3 = t * t * t;

	    return vec2((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
	}

	vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
	    return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
	}

	float catmullRomSpline(float p0, float p1, float p2, float p3, float t, vec2 c) {
	    float v0 = (p2 - p0) * c.x;
	    float v1 = (p3 - p1) * c.y;
	    float t2 = t * t;
	    float t3 = t * t * t;

	    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
	}

	float catmullRomSpline(float p0, float p1, float p2, float p3, float t) {
	    return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
	}

	ivec4 getCatmullRomSplineIndices(float l, float p) {
	    float index = floor(p);
	    int i0 = int(max(0.0, index - 1.0));
	    int i1 = int(index);
	    int i2 = int(min(index + 1.0, l));
	    int i3 = int(min(index + 2.0, l));

	    return ivec4(i0, i1, i2, i3);
	}

	ivec4 getCatmullRomSplineIndicesClosed(float l, float p) {
	    float index = floor(p);
	    int i0 = int(index == 0.0 ? l : index - 1.0);
	    int i1 = int(index);
	    int i2 = int(mod(index + 1.0, l));
	    int i3 = int(mod(index + 2.0, l));

	    return ivec4(i0, i1, i2, i3);
	}
`

ShaderChunks.CubicBezier = `
	vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
	    float tn = 1.0 - t;

	    return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
	}

	vec2 cubicBezier(vec2 p0, vec2 c0, vec2 c1, vec2 p1, float t) {
	    float tn = 1.0 - t;

	    return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
	}
`

ShaderChunks.EaseBackIn = `
	float easeBackIn(float p, float amplitude) {
	    return p * p * ((amplitude + 1.0) * p - amplitude);
	}

	float easeBackIn(float p) {
	    return easeBackIn(p, 1.70158);
	}

	float easeBackIn(float t, float b, float c, float d, float amplitude) {
	    return b + easeBackIn(t / d, amplitude) * c;
	}

	float easeBackIn(float t, float b, float c, float d) {
	    return b + easeBackIn(t / d) * c;
	}
`

ShaderChunks.EaseBackInOut = `
	float easeBackInOut(float p, float amplitude) {
	    amplitude *= 1.525;

	    return ((p *= 2.0) < 1.0) ? 0.5 * p * p * ((amplitude + 1.0) * p - amplitude) : 0.5 * ((p -= 2.0) * p * ((amplitude + 1.0) * p + amplitude) + 2.0);
	}

	float easeBackInOut(float p) {
	    return easeBackInOut(p, 1.70158);
	}

	float easeBackInOut(float t, float b, float c, float d, float amplitude) {
	    return b + easeBackInOut(t / d, amplitude) * c;
	}

	float easeBackInOut(float t, float b, float c, float d) {
	    return b + easeBackInOut(t / d) * c;
	}
`

ShaderChunks.EaseBackOut = `
	float easeBackOut(float p, float amplitude) {
	    return ((p = p - 1.0) * p * ((amplitude + 1.0) * p + amplitude) + 1.0);
	}

	float easeBackOut(float p) {
	    return easeBackOut(p, 1.70158);
	}

	float easeBackOut(float t, float b, float c, float d, float amplitude) {
	    return b + easeBackOut(t / d, amplitude) * c;
	}

	float easeBackOut(float t, float b, float c, float d) {
	    return b + easeBackOut(t / d) * c;
	}
`

ShaderChunks.EaseBezier = `
	float easeBezier(float p, vec4 curve) {
	    float ip = 1.0 - p;
	    return (3.0 * ip * ip * p * curve.xy + 3.0 * ip * p * p * curve.zw + p * p * p).y;
	}

	float easeBezier(float t, float b, float c, float d, vec4 curve) {
	    return b + easeBezier(t / d, curve) * c;
	}
`

